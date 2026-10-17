<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('is_available')) {
            $this->merge([
                'is_available' => $this->boolean('is_available'),
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isSupportAgent = $this->input('role') === Role::SupportAgent;

        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'lowercase', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['required', 'string', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'is_available' => [Rule::requiredIf($isSupportAgent), 'boolean'],
            'max_active_tickets' => [
                Rule::requiredIf($isSupportAgent),
                'nullable',
                'integer',
                'min:1',
            ],
        ];
    }
}
