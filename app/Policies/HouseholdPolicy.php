<?php

namespace App\Policies;

use App\Models\Household;
use App\Models\User;

class HouseholdPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->households()->exists();
    }

    public function view(User $user, Household $household): bool
    {
        return $user->belongsToHousehold($household);
    }

    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, Household $household): bool
    {
        return $user->belongsToHousehold($household);
    }

    public function delete(User $user, Household $household): bool
    {
        return $user->ownsHousehold($household);
    }

    public function restore(User $user, Household $household): bool
    {
        return $user->ownsHousehold($household);
    }

    public function forceDelete(User $user, Household $household): bool
    {
        return $user->ownsHousehold($household);
    }
}
