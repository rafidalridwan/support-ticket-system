<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSlaPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $policyId = $this->route('slaPolicy')->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'priority' => [
                'required',
                'integer',
                'between:1,4',
                Rule::unique('sla_policies', 'priority')->ignore($policyId),
            ],
            'resolution_minutes' => ['required', 'integer', 'min:1'],
            'warning_threshold_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
