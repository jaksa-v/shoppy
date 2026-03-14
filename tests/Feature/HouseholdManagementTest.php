<?php

use App\Models\Category;
use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\User;

test('users can create a household with default categories and an active shopping list', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('households.store'), [
            'name' => 'Home',
        ]);

    $household = Household::query()->firstOrFail();

    $response->assertRedirect(route('dashboard', [
        'household' => $household->id,
    ], absolute: false));

    expect($household->name)->toBe('Home')
        ->and($household->created_by_user_id)->toBe($user->id)
        ->and($household->categories()->ordered()->pluck('name')->values()->all())->toBe([
            'Meat',
            'Dairy',
            'Vegetables',
            'Fruits',
            'Hygiene',
        ]);

    $this->assertDatabaseHas('household_user', [
        'household_id' => $household->id,
        'user_id' => $user->id,
        'role' => Household::ROLE_OWNER,
    ]);

    $this->assertDatabaseHas('shopping_lists', [
        'household_id' => $household->id,
        'name' => 'Shopping List',
        'status' => ShoppingList::STATUS_ACTIVE,
        'created_by_user_id' => $user->id,
    ]);
});

test('household members can update categories but outsiders cannot', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $outsider = User::factory()->create();

    $household = Household::factory()->create([
        'created_by_user_id' => $owner->id,
    ]);

    $household->members()->attach($member->id, [
        'role' => Household::ROLE_MEMBER,
        'joined_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $category = Category::factory()->create([
        'household_id' => $household->id,
        'name' => 'Vegetables',
        'slug' => 'vegetables',
        'sort_order' => 3,
    ]);

    $this->actingAs($member)
        ->put(route('households.categories.update', [$household, $category]), [
            'name' => 'Produce',
            'sort_order' => 1,
        ])
        ->assertRedirect(route('dashboard', [
            'household' => $household->id,
        ], absolute: false));

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Produce',
        'slug' => 'produce',
        'sort_order' => 1,
    ]);

    $this->actingAs($outsider)
        ->put(route('households.categories.update', [$household, $category]), [
            'name' => 'Fresh Produce',
            'sort_order' => 2,
        ])
        ->assertForbidden();
});
