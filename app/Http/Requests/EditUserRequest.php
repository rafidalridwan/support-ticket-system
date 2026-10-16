<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'password' => $this->password === '' ? null : $this->password,
            'clear_image' => $this->boolean('clear_image'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
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
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'clear_image' => ['sometimes', 'boolean'],
        ];
    }
}
