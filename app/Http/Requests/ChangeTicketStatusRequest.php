<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $ticket = $this->route('ticket');

        if (! $user || ! $ticket) {
            return false;
        }

        if ($user->isSystemAdmin()) {
            return true;
        }

        return $user->hasRole(Role::SupportAgent)
            && (int) $ticket->assigned_to === (int) $user->id;
    }

    public function rules(): array
    {
        return [
            'status_id' => ['required', 'integer', Rule::exists('ticket_statuses', 'id')],
        ];
    }
}
