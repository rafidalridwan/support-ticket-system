<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'value' => [
                'required',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('ticket_categories', 'value')->ignore($this->route('ticketCategory')),
            ],
        ];
    }
}
