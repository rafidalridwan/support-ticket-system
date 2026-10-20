<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreTicketCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name', ''));

        $this->merge([
            'name' => $name,
            'value' => Str::slug($name, '_'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'value' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:ticket_categories,value'],
        ];
    }
}
