<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleEditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = Str::of((string) $this->input('name', ''))
            ->trim()
            ->lower()
            ->replace(' ', '_')
            ->toString();

        $this->merge([
            'name' => $name,
            'label' => $this->input('label') ?: Str::headline(str_replace('_', ' ', $name)),
            'permissions' => array_values(array_filter($this->input('permissions', []))),
        ]);
    }

    public function rules(): array
    {
        $roleId = optional($this->route('role'))->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'label' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
