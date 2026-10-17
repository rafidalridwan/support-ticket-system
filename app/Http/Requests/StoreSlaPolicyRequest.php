<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSlaPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'priority' => ['required', 'integer', 'between:1,4', 'unique:sla_policies,priority'],
            'resolution_minutes' => ['required', 'integer', 'min:1'],
            'warning_threshold_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
