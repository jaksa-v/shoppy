<?php

namespace App\Policies;

use App\Models\ShoppingList;
use App\Models\User;

class ShoppingListPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->households()->exists();
    }

    public function view(User $user, ShoppingList $shoppingList): bool
    {
        return $user->belongsToHousehold($shoppingList->household);
    }

    public function create(User $user): bool
    {
        return $user->households()->exists();
    }

    public function update(User $user, ShoppingList $shoppingList): bool
    {
        return $user->belongsToHousehold($shoppingList->household);
    }

    public function delete(User $user, ShoppingList $shoppingList): bool
    {
        return $user->ownsHousehold($shoppingList->household);
    }

    public function restore(User $user, ShoppingList $shoppingList): bool
    {
        return $user->ownsHousehold($shoppingList->household);
    }

    public function forceDelete(User $user, ShoppingList $shoppingList): bool
    {
        return $user->ownsHousehold($shoppingList->household);
    }
}
