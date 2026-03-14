<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $households = $request->user()
            ->households()
            ->orderBy('households.name')
            ->get(['households.id', 'households.name']);

        $selectedHousehold = $request->user()
            ->households()
            ->with([
                'members:id,name,email',
                'categories' => fn ($query) => $query->ordered(),
                'shoppingLists' => fn ($query) => $query->orderByDesc('created_at'),
                'shoppingLists.shoppingListItems.category:id,name',
                'shoppingLists.shoppingListItems.addedBy:id,name',
                'shoppingLists.shoppingListItems.boughtBy:id,name',
            ])
            ->when(
                $request->integer('household') > 0,
                fn ($query) => $query->whereKey($request->integer('household')),
                fn ($query) => $query->orderBy('households.name'),
            )
            ->first();

        $selectedShoppingList = $selectedHousehold?->shoppingLists
            ->firstWhere('id', $request->integer('list'))
            ?? $selectedHousehold?->shoppingLists->firstWhere('status', 'active')
            ?? $selectedHousehold?->shoppingLists->first();

        return Inertia::render('dashboard', [
            'households' => $households->map(fn ($household): array => [
                'id' => $household->id,
                'name' => $household->name,
            ]),
            'selectedHousehold' => $selectedHousehold ? [
                'id' => $selectedHousehold->id,
                'name' => $selectedHousehold->name,
                'members' => $selectedHousehold->members->map(fn ($member): array => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->pivot->role,
                ])->values(),
                'categories' => $selectedHousehold->categories->map(fn ($category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'sort_order' => $category->sort_order,
                ])->values(),
                'shopping_lists' => $selectedHousehold->shoppingLists->map(fn ($shoppingList): array => [
                    'id' => $shoppingList->id,
                    'name' => $shoppingList->name,
                    'status' => $shoppingList->status,
                    'archived_at' => $shoppingList->archived_at?->toISOString(),
                ])->values(),
            ] : null,
            'selectedShoppingList' => $selectedShoppingList ? [
                'id' => $selectedShoppingList->id,
                'name' => $selectedShoppingList->name,
                'status' => $selectedShoppingList->status,
                'items' => $selectedShoppingList->shoppingListItems->map(fn ($item): array => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'notes' => $item->notes,
                    'is_bought' => $item->is_bought,
                    'position' => $item->position,
                    'bought_at' => $item->bought_at?->toISOString(),
                    'category' => $item->category ? [
                        'id' => $item->category->id,
                        'name' => $item->category->name,
                    ] : null,
                    'added_by' => $item->addedBy?->only(['id', 'name']),
                    'bought_by' => $item->boughtBy?->only(['id', 'name']),
                ])->values(),
            ] : null,
        ]);
    }
}
