<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Household;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function store(StoreCategoryRequest $request, Household $household): RedirectResponse
    {
        $validated = $request->validated();

        $household->categories()->create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? ($household->categories()->max('sort_order') + 1),
        ]);

        return to_route('dashboard', [
            'household' => $household->id,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Household $household, Category $category): RedirectResponse
    {
        $validated = $request->validated();

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? $category->sort_order,
        ]);

        return to_route('dashboard', [
            'household' => $household->id,
        ]);
    }

    public function destroy(Household $household, Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $category->delete();

        return to_route('dashboard', [
            'household' => $household->id,
        ]);
    }
}
