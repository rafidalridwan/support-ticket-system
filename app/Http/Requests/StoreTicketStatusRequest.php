<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreTicketStatusRequest extends FormRequest
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
            'is_close' => $this->boolean('is_close'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'value' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:ticket_statuses,value'],
            'is_close' => ['required', 'boolean'],
        ];
    }
}
