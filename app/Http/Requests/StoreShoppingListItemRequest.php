<?php

namespace App\Http\Requests;

use App\Models\Household;
use App\Models\ShoppingList;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShoppingListItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $shoppingList = $this->route('shoppingList');

        return $shoppingList instanceof ShoppingList
            && ($this->user()?->can('update', $shoppingList) ?? false);
    }

    public function rules(): array
    {
        /** @var Household $household */
        $household = $this->route('household');

        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn (Builder $query): Builder => $query->where('household_id', $household->id),
                ),
            ],
            'name' => ['required', 'string', 'max:120'],
            'quantity' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Add a name for the grocery item.',
            'category_id.exists' => 'Choose a category from this household.',
            'quantity.max' => 'Quantities may not be longer than 40 characters.',
        ];
    }
}
