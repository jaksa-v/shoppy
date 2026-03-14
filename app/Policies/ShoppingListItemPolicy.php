<?php

namespace App\Policies;

use App\Models\ShoppingListItem;
use App\Models\User;

class ShoppingListItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->households()->exists();
    }

    public function view(User $user, ShoppingListItem $shoppingListItem): bool
    {
        return $user->belongsToHousehold($shoppingListItem->shoppingList->household);
    }

    public function create(User $user): bool
    {
        return $user->households()->exists();
    }

    public function update(User $user, ShoppingListItem $shoppingListItem): bool
    {
        return $user->belongsToHousehold($shoppingListItem->shoppingList->household);
    }

    public function delete(User $user, ShoppingListItem $shoppingListItem): bool
    {
        return $user->belongsToHousehold($shoppingListItem->shoppingList->household);
    }

    public function restore(User $user, ShoppingListItem $shoppingListItem): bool
    {
        return $user->belongsToHousehold($shoppingListItem->shoppingList->household);
    }

    public function forceDelete(User $user, ShoppingListItem $shoppingListItem): bool
    {
        return $user->ownsHousehold($shoppingListItem->shoppingList->household);
    }
}
