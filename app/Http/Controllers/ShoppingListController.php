<?php

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\ShoppingList;
use Illuminate\Http\RedirectResponse;

class ShoppingListController extends Controller
{
    public function show(Household $household, ShoppingList $shoppingList): RedirectResponse
    {
        $this->authorize('view', $shoppingList);

        return to_route('dashboard', [
            'household' => $household->id,
            'list' => $shoppingList->id,
        ]);
    }
}
