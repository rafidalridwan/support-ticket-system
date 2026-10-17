<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merge = [
            'password' => $this->password === '' ? null : $this->password,
        ];

        if ($this->has('is_available')) {
            $merge['is_available'] = $this->boolean('is_available');
        }

        $this->merge($merge);
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
            'email' => [
                'required',
                'email',
                'lowercase',
                Rule::unique(User::class, 'email')->ignore(optional($this->route('user'))->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['required', 'string', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'is_available' => [Rule::requiredIf($isSupportAgent), 'boolean'],
            'max_active_tickets' => [
                Rule::requiredIf($isSupportAgent),
                'nullable',
                'integer',
                'min:1',
                'max:65535',
            ],
        ];
    }
}
