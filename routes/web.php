<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\ShoppingListItemController;
use App\Http\Controllers\ShoppingListItemStatusController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::scopeBindings()->group(function () {
        Route::post('households', [HouseholdController::class, 'store'])->name('households.store');
        Route::get('households/{household}', [HouseholdController::class, 'show'])->name('households.show');

        Route::post('households/{household}/categories', [CategoryController::class, 'store'])->name('households.categories.store');
        Route::put('households/{household}/categories/{category}', [CategoryController::class, 'update'])->name('households.categories.update');
        Route::delete('households/{household}/categories/{category}', [CategoryController::class, 'destroy'])->name('households.categories.destroy');

        Route::get('households/{household}/shopping-lists/{shoppingList}', [ShoppingListController::class, 'show'])->name('households.shopping-lists.show');
        Route::post('households/{household}/shopping-lists/{shoppingList}/items', [ShoppingListItemController::class, 'store'])->name('households.shopping-lists.items.store');
        Route::put('households/{household}/shopping-lists/{shoppingList}/items/{shoppingListItem}', [ShoppingListItemController::class, 'update'])->name('households.shopping-lists.items.update');
        Route::delete('households/{household}/shopping-lists/{shoppingList}/items/{shoppingListItem}', [ShoppingListItemController::class, 'destroy'])->name('households.shopping-lists.items.destroy');
        Route::put('households/{household}/shopping-lists/{shoppingList}/items/{shoppingListItem}/status', [ShoppingListItemStatusController::class, 'update'])->name('households.shopping-lists.items.status.update');
    });
});

require __DIR__.'/settings.php';
