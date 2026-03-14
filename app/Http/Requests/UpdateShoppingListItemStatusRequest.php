<?php

namespace App\Http\Requests;

use App\Models\ShoppingListItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShoppingListItemStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $shoppingListItem = $this->route('shoppingListItem');

        return $shoppingListItem instanceof ShoppingListItem
            && ($this->user()?->can('update', $shoppingListItem) ?? false);
    }

    public function rules(): array
    {
        return [
            'is_bought' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'is_bought.required' => 'Tell us whether the item has been bought.',
            'is_bought.boolean' => 'The bought status must be true or false.',
        ];
    }
}
