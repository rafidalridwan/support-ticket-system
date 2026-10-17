<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
