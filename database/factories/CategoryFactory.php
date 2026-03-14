<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Household;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(fake()->numberBetween(1, 2), true));

        return [
            'household_id' => Household::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
