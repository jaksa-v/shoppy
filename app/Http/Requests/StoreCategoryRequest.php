<?php

namespace App\Http\Requests;

use App\Models\Household;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $household = $this->route('household');

        return $household instanceof Household
            && ($this->user()?->can('update', $household) ?? false);
    }

    public function rules(): array
    {
        /** @var Household $household */
        $household = $this->route('household');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('categories', 'name')->where('household_id', $household->id),
            ],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Categories need a name.',
            'name.unique' => 'That category already exists for this household.',
            'sort_order.integer' => 'The category order must be a number.',
        ];
    }
}
