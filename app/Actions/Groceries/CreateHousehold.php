<?php

namespace App\Actions\Groceries;

use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateHousehold
{
    /**
     * @var list<string>
     */
    private const DEFAULT_CATEGORIES = [
        'Meat',
        'Dairy',
        'Vegetables',
        'Fruits',
        'Hygiene',
    ];

    public function handle(User $user, string $name): Household
    {
        return DB::transaction(function () use ($user, $name): Household {
            $household = Household::query()->create([
                'name' => $name,
                'created_by_user_id' => $user->id,
            ]);

            $household->members()->attach($user->id, [
                'role' => Household::ROLE_OWNER,
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $household->categories()->createMany(
                collect(self::DEFAULT_CATEGORIES)
                    ->values()
                    ->map(fn (string $category, int $index): array => [
                        'name' => $category,
                        'slug' => Str::slug($category),
                        'sort_order' => $index + 1,
                    ])
                    ->all(),
            );

            $household->shoppingLists()->create([
                'name' => 'Shopping List',
                'status' => ShoppingList::STATUS_ACTIVE,
                'created_by_user_id' => $user->id,
            ]);

            return $household->load([
                'categories' => fn ($query) => $query->ordered(),
                'activeShoppingList',
            ]);
        });
    }
}
