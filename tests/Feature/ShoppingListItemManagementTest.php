<?php

use App\Models\Category;
use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use App\Models\User;

test('household members can add, buy, unbuy, and delete shopping list items', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $household = Household::factory()->create([
        'created_by_user_id' => $owner->id,
    ]);

    $household->members()->attach($member->id, [
        'role' => Household::ROLE_MEMBER,
        'joined_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $shoppingList = ShoppingList::factory()->create([
        'household_id' => $household->id,
        'created_by_user_id' => $owner->id,
    ]);

    $category = Category::factory()->create([
        'household_id' => $household->id,
        'name' => 'Vegetables',
        'slug' => 'vegetables',
    ]);

    $this->actingAs($member)
        ->post(route('households.shopping-lists.items.store', [$household, $shoppingList]), [
            'category_id' => $category->id,
            'name' => 'Tomatoes',
            'quantity' => '4',
            'notes' => 'For pasta night',
        ])
        ->assertRedirect(route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ], absolute: false));

    $shoppingListItem = ShoppingListItem::query()->firstOrFail();

    expect($shoppingListItem->name)->toBe('Tomatoes')
        ->and($shoppingListItem->added_by_user_id)->toBe($member->id)
        ->and($shoppingListItem->position)->toBe(1)
        ->and($shoppingListItem->is_bought)->toBeFalse();

    $this->actingAs($member)
        ->put(route('households.shopping-lists.items.status.update', [$household, $shoppingList, $shoppingListItem]), [
            'is_bought' => true,
        ])
        ->assertRedirect(route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ], absolute: false));

    expect($shoppingListItem->fresh()->is_bought)->toBeTrue()
        ->and($shoppingListItem->fresh()->bought_by_user_id)->toBe($member->id)
        ->and($shoppingListItem->fresh()->bought_at)->not->toBeNull();

    $this->actingAs($member)
        ->put(route('households.shopping-lists.items.status.update', [$household, $shoppingList, $shoppingListItem]), [
            'is_bought' => false,
        ])
        ->assertRedirect(route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ], absolute: false));

    expect($shoppingListItem->fresh()->is_bought)->toBeFalse()
        ->and($shoppingListItem->fresh()->bought_by_user_id)->toBeNull()
        ->and($shoppingListItem->fresh()->bought_at)->toBeNull();

    $this->actingAs($member)
        ->delete(route('households.shopping-lists.items.destroy', [$household, $shoppingList, $shoppingListItem]))
        ->assertRedirect(route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ], absolute: false));

    $this->assertDatabaseMissing('shopping_list_items', [
        'id' => $shoppingListItem->id,
    ]);
});

test('shopping list item routes are scoped to the selected household and list', function () {
    $user = User::factory()->create();

    $firstHousehold = Household::factory()->create([
        'created_by_user_id' => $user->id,
    ]);

    $secondHousehold = Household::factory()->create([
        'created_by_user_id' => $user->id,
    ]);

    $firstShoppingList = ShoppingList::factory()->create([
        'household_id' => $firstHousehold->id,
        'created_by_user_id' => $user->id,
    ]);

    $secondShoppingList = ShoppingList::factory()->create([
        'household_id' => $secondHousehold->id,
        'created_by_user_id' => $user->id,
    ]);

    $shoppingListItem = ShoppingListItem::factory()->create([
        'shopping_list_id' => $secondShoppingList->id,
        'name' => 'Milk',
    ]);

    $this->actingAs($user)
        ->put(route('households.shopping-lists.items.update', [$firstHousehold, $firstShoppingList, $shoppingListItem]), [
            'name' => 'Oat Milk',
            'quantity' => '2',
            'notes' => null,
        ])
        ->assertNotFound();
});
