<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'type' => $this->canUseInternalNote() && $this->input('type') === 'internal_note'
                ? 'internal_note'
                : 'reply',
        ]);
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:reply,internal_note'],
            'body' => ['nullable', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! filled(trim((string) $this->input('body', ''))) && ! $this->hasFile('attachments')) {
                $validator->errors()->add('body', 'Write a message or attach a file.');
            }
        });
    }

    private function canUseInternalNote(): bool
    {
        $user = $this->user();
        $ticket = $this->route('ticket');

        return (bool) (
            $user?->isAdministrator()
            || ($user?->hasRole(Role::SupportAgent) && $ticket && (int) $ticket->assigned_to === (int) $user->id)
        );
    }
}
