<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Household>
 */
class HouseholdFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Household',
            'created_by_user_id' => User::factory(),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Household $household): void {
            if ($household->created_by_user_id === null) {
                return;
            }

            $household->members()->syncWithoutDetaching([
                $household->created_by_user_id => [
                    'role' => Household::ROLE_OWNER,
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        });
    }
}
