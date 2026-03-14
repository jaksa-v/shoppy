<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateShoppingListItemStatusRequest;
use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\RedirectResponse;

class ShoppingListItemStatusController extends Controller
{
    public function update(
        UpdateShoppingListItemStatusRequest $request,
        Household $household,
        ShoppingList $shoppingList,
        ShoppingListItem $shoppingListItem,
    ): RedirectResponse {
        $isBought = $request->boolean('is_bought');

        $shoppingListItem->update([
            'is_bought' => $isBought,
            'bought_at' => $isBought ? now() : null,
            'bought_by_user_id' => $isBought ? $request->user()->id : null,
        ]);

        return to_route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ]);
    }
}
