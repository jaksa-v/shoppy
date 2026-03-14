<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->households()->exists();
    }

    public function view(User $user, Category $category): bool
    {
        return $user->belongsToHousehold($category->household);
    }

    public function create(User $user): bool
    {
        return $user->households()->exists();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->belongsToHousehold($category->household);
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->belongsToHousehold($category->household);
    }

    public function restore(User $user, Category $category): bool
    {
        return $user->belongsToHousehold($category->household);
    }

    public function forceDelete(User $user, Category $category): bool
    {
        return $user->ownsHousehold($category->household);
    }
}
