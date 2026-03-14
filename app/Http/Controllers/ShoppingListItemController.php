<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShoppingListItemRequest;
use App\Http\Requests\UpdateShoppingListItemRequest;
use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\RedirectResponse;

class ShoppingListItemController extends Controller
{
    public function store(
        StoreShoppingListItemRequest $request,
        Household $household,
        ShoppingList $shoppingList,
    ): RedirectResponse {
        $validated = $request->validated();

        $shoppingList->shoppingListItems()->create([
            'category_id' => $validated['category_id'] ?? null,
            'name' => $validated['name'],
            'quantity' => $validated['quantity'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'added_by_user_id' => $request->user()->id,
            'position' => $shoppingList->shoppingListItems()->max('position') + 1,
        ]);

        return to_route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ]);
    }

    public function update(
        UpdateShoppingListItemRequest $request,
        Household $household,
        ShoppingList $shoppingList,
        ShoppingListItem $shoppingListItem,
    ): RedirectResponse {
        $shoppingListItem->update($request->validated());

        return to_route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ]);
    }

    public function destroy(
        Household $household,
        ShoppingList $shoppingList,
        ShoppingListItem $shoppingListItem,
    ): RedirectResponse {
        $this->authorize('delete', $shoppingListItem);

        $shoppingListItem->delete();

        return to_route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ]);
    }
}
