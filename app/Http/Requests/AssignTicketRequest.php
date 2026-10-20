<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdministrator();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'assigned_to' => in_array($this->assigned_to, [null, '', 'unassigned'], true)
                ? null
                : $this->assigned_to,
        ]);
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['nullable', 'integer', Rule::exists('users', 'id')],
        ];
    }
}
