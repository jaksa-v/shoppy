<?php

namespace App\Http\Controllers;

use App\Actions\Groceries\CreateHousehold;
use App\Http\Requests\StoreHouseholdRequest;
use App\Models\Household;
use Illuminate\Http\RedirectResponse;

class HouseholdController extends Controller
{
    public function store(StoreHouseholdRequest $request, CreateHousehold $createHousehold): RedirectResponse
    {
        $household = $createHousehold->handle(
            $request->user(),
            $request->validated('name'),
        );

        return to_route('dashboard', [
            'household' => $household->id,
        ]);
    }

    public function show(Household $household): RedirectResponse
    {
        $this->authorize('view', $household);

        return to_route('dashboard', [
            'household' => $household->id,
        ]);
    }
}
