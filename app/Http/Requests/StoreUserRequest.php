<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'lowercase', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['required', 'string', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }
}
