<?php

namespace Database\Factories;

use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingListItem>
 */
class ShoppingListItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shopping_list_id' => ShoppingList::factory(),
            'category_id' => null,
            'name' => fake()->words(2, true),
            'quantity' => (string) fake()->numberBetween(1, 4),
            'notes' => fake()->optional()->sentence(),
            'is_bought' => false,
            'bought_at' => null,
            'added_by_user_id' => null,
            'bought_by_user_id' => null,
            'position' => fake()->numberBetween(1, 10),
        ];
    }
}
