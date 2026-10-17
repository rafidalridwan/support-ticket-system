<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $type = $this->input('type', 'reply');

        if (! $this->canUseInternalNote()) {
            $type = 'reply';
        }

        $this->merge([
            'type' => $type ?: 'reply',
        ]);
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['reply', 'internal_note'])],
            'body' => ['nullable', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $hasBody = filled(trim((string) $this->input('body', '')));
            $hasFiles = $this->hasFile('attachments');

            if (! $hasBody && ! $hasFiles) {
                $validator->errors()->add('body', 'Write a message or attach a file.');
            }

            if ($this->input('type') === 'internal_note' && ! $this->canUseInternalNote()) {
                $validator->errors()->add('type', 'You cannot post internal notes.');
            }
        });
    }

    private function canUseInternalNote(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        if ($user->isSystemAdmin()) {
            return true;
        }

        $ticket = $this->route('ticket');

        return $user->hasRole(Role::SupportAgent)
            && $ticket
            && (int) $ticket->assigned_to === (int) $user->id;
    }
}
