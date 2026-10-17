<?php

namespace App\Http\Controllers\Administrative;

use App\Enums\SlaPolicyPriority;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\ChangeTicketStatusRequest;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Role;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketAssignment;
use App\Models\TicketAttachment;
use App\Models\TicketCategory;
use App\Models\TicketMessage;
use App\Models\TicketStatus;
use App\Models\User;
use App\Services\BusinessHoursSlaCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ticket::query()
            ->with([
                'creator:id,name',
                'assignee:id,name',
                'category:id,name',
                'status:id,name,value',
                'slaPolicy:id,name',
            ])
            ->latest();

        if ($user->isSystemAdmin()) {
        
        } elseif ($user->hasRole(Role::SupportAgent)) {
            $query->where('assigned_to', $user->id);
        } else {
            $query->where('created_by', $user->id);
        }

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($query) use ($search) {
                $query->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('unique_key', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('assignee', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->integer('status_id'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->integer('priority'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('assigned_to')) {
            $assignedTo = (string) $request->input('assigned_to');

            if ($assignedTo === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', (int) $assignedTo);
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        $perPage = min(100, max(10, $request->integer('per_page', 25)));

        return Inertia::render('Administrative/Tickets/Index', [
            'tickets' => $query->paginate($perPage)->withQueryString(),
            'categories' => TicketCategory::orderBy('name')->get(['id', 'name']),
            'statuses' => TicketStatus::orderBy('id')->get(['id', 'name', 'value']),
            'priorities' => SlaPolicyPriority::options(),
            'agents' => $this->agentOptions(),
            'filters' => $request->only([
                'search',
                'status_id',
                'priority',
                'category_id',
                'assigned_to',
                'date_from',
                'date_to',
            ]),
        ]);
    }

    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        $this->authorizeTicket($user, $ticket);

        $canSeeInternalNotes = $user->isSystemAdmin()
            || ($user->hasRole(Role::SupportAgent) && (int) $ticket->assigned_to === (int) $user->id);

        $messages = $ticket->messages()
            ->with([
                'user:id,name',
                'attachments:id,ticket_id,message_id,path,original_name,mime_type,size_bytes',
            ])
            ->oldest();

        if (! $canSeeInternalNotes) {
            $messages->where('type', '!=', 'internal_note');
        }

        $ticket->load([
            'creator:id,name',
            'assignee:id,name',
            'category:id,name',
            'status:id,name,value,is_close',
        ]);

        $ticket->setRelation('messages', $messages->get());

        return Inertia::render('Administrative/Tickets/Show', [
            'ticket' => $ticket,
            'canUseInternalNote' => $canSeeInternalNotes,
            'priorities' => SlaPolicyPriority::options(),
            'statuses' => TicketStatus::orderBy('id')->get(['id', 'name', 'value', 'is_close']),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $ticket = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $now = now();
            $status = TicketStatus::where('value', 'open')->firstOrFail();
            $policy = SlaPolicy::where('priority', $data['priority'])
                ->where('is_active', true)
                ->first();
            $agent = $this->findAgent();
            $ticketNumber = $this->nextTicketNumber();

            $ticket = Ticket::create([
                'ticket_number' => $ticketNumber,
                'subject' => $data['subject'],
                'description' => $data['description'],
                'created_by' => $request->user()->id,
                'assigned_to' => $agent?->id,
                'assigned_at' => $agent ? $now : null,
                'category_id' => $data['category_id'],
                'priority' => $data['priority'],
                'status_id' => $status->id,
                'sla_policy_id' => $policy?->id,
                'sla_started_at' => null,
                'sla_warning_at' => null,
                'sla_due_at' => null,
                'sla_minutes' => $policy?->resolution_minutes,
            ]);

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $request->user()->id,
                'event' => 'created',
                'new_values' => ['status' => $status->value, 'priority' => $data['priority']],
                'description' => 'Ticket created.',
            ]);

            if ($agent) {
                TicketAssignment::create([
                    'ticket_id' => $ticket->id,
                    'agent_id' => $agent->id,
                    'assignment_type' => 'automatic',
                    'assigned_at' => $now,
                ]);

                $sla = $this->slaTimes($policy, $now);
                
                $ticket->update([
                    'sla_started_at' => $sla['started_at'],
                    'sla_warning_at' => $sla['warning_at'],
                    'sla_due_at' => $sla['due_at'],
                ]);
                $this->syncAgentAvailability($agent);

                TicketActivity::create([
                    'ticket_id' => $ticket->id,
                    'actor_id' => $request->user()->id,
                    'event' => 'assigned',
                    'new_values' => ['assigned_to' => $agent->id],
                    'description' => "Ticket automatically assigned to {$agent->name}.",
                ]);
            }

            return $ticket;
        });

        return redirect()
            ->route('administrative.ticket.index')
            ->with('success', "Ticket {$ticket->ticket_number} created successfully.");
    }

    public function reply(StoreTicketMessageRequest $request, Ticket $ticket)
    {
        $this->authorizeTicket($request->user(), $ticket);
        $ticket->loadMissing('status:id,is_close');

        if ($ticket->status?->is_close) {
            return redirect()->back()->with('error', 'This ticket is closed and cannot accept new replies.');
        }

        $data = $request->validated();
        $type = $data['type'] ?? 'reply';
        $isInternal = $type === 'internal_note';

        DB::transaction(function () use ($request, $ticket, $data, $type, $isInternal) {
            $message = TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'type' => $type,
                'body' => trim((string) ($data['body'] ?? '')) ?: '(attachment)',
            ]);

            foreach ($request->file('attachments', []) as $file) {
                TicketAttachment::create([
                    'ticket_id' => $ticket->id,
                    'message_id' => $message->id,
                    'uploaded_by' => $request->user()->id,
                    'path' => $file->store("tickets/{$ticket->id}", 'public'),
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
                    'size_bytes' => $file->getSize() ?: 0,
                ]);
            }

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $request->user()->id,
                'event' => $isInternal ? 'internal_note' : 'replied',
                'description' => $isInternal ? 'Internal note added.' : 'New reply added.',
            ]);
        });

        return redirect()
            ->route('administrative.ticket.show', $ticket)
            ->with('success', $isInternal ? 'Internal note added successfully.' : 'Reply sent successfully.');
    }

    public function assign(AssignTicketRequest $request, Ticket $ticket)
    {
        $this->authorizeTicket($request->user(), $ticket);

        DB::transaction(function () use ($request, $ticket) {
            $previousAgentId = $ticket->assigned_to;
            $agentId = $request->input('assigned_to');
            $now = now();
            $policy = $ticket->slaPolicy;

            TicketAssignment::query()
                ->where('ticket_id', $ticket->id)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            if ($agentId) {
                $agent = User::query()->with('agentProfile')->findOrFail($agentId);

                $ticket->update([
                    'assigned_to' => $agent->id,
                    'assigned_at' => $now,
                ]);

                TicketAssignment::create([
                    'ticket_id' => $ticket->id,
                    'agent_id' => $agent->id,
                    'assigned_by' => $request->user()->id,
                    'assignment_type' => 'manual',
                    'assigned_at' => $now,
                ]);

                $sla = $this->slaTimes($policy, $now);
                $ticket->update([
                    'sla_started_at' => $sla['started_at'],
                    'sla_warning_at' => $sla['warning_at'],
                    'sla_due_at' => $sla['due_at'],
                ]);

                $this->syncAgentAvailability($agent);

                TicketActivity::create([
                    'ticket_id' => $ticket->id,
                    'actor_id' => $request->user()->id,
                    'event' => 'assigned',
                    'old_values' => ['assigned_to' => $previousAgentId],
                    'new_values' => ['assigned_to' => $agent->id],
                    'description' => "Ticket reassigned to {$agent->name}.",
                ]);
            } else {
                $ticket->update([
                    'assigned_to' => null,
                    'assigned_at' => null,
                ]);

                TicketActivity::create([
                    'ticket_id' => $ticket->id,
                    'actor_id' => $request->user()->id,
                    'event' => 'unassigned',
                    'old_values' => ['assigned_to' => $previousAgentId],
                    'new_values' => ['assigned_to' => null],
                    'description' => 'Ticket unassigned.',
                ]);
            }

            if ($previousAgentId && (int) $previousAgentId !== (int) $agentId) {
                $previousAgent = User::query()->with('agentProfile')->find($previousAgentId);
                if ($previousAgent) {
                    $this->syncAgentAvailability($previousAgent);
                }
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Ticket assignment updated successfully.');
    }

    public function updateStatus(ChangeTicketStatusRequest $request, Ticket $ticket)
    {
        $ticket->loadMissing('status:id,name,value,is_close');

        if ($ticket->status?->is_close) {
            return redirect()->back()->with('error', 'Closed tickets cannot be reopened or updated.');
        }

        $status = TicketStatus::query()->findOrFail($request->integer('status_id'));

        if ((int) $ticket->status_id === (int) $status->id) {
            return redirect()->back();
        }

        DB::transaction(function () use ($request, $ticket, $status) {
            $previousStatus = $ticket->status;

            $ticket->update([
                'status_id' => $status->id,
                'closed_at' => $status->is_close ? now() : null,
            ]);

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'actor_id' => $request->user()->id,
                'event' => $status->is_close ? 'closed' : 'status_updated',
                'old_values' => ['status' => $previousStatus?->value],
                'new_values' => ['status' => $status->value],
                'description' => "Ticket status updated to {$status->name}.",
            ]);

            if ($status->is_close && $ticket->assigned_to) {
                $agent = User::query()->with('agentProfile')->find($ticket->assigned_to);
                if ($agent) {
                    $this->syncAgentAvailability($agent);
                }
            }
        });

        return redirect()
            ->route('administrative.ticket.show', $ticket)
            ->with('success', 'Ticket status updated successfully.');
    }

    private function slaTimes(?SlaPolicy $policy, $now): array
    {
        if (! $policy) {
            return [
                'started_at' => null,
                'warning_at' => null,
                'due_at' => null,
            ];
        }

        $calculator = new BusinessHoursSlaCalculator();
        $startedAt = $calculator->startAt($now);
        $warningMinutes = (int) ($policy->resolution_minutes * $policy->warning_threshold_percent / 100);

        return [
            'started_at' => $startedAt,
            'warning_at' => $calculator->addMinutes($startedAt, $warningMinutes),
            'due_at' => $calculator->addMinutes($startedAt, $policy->resolution_minutes),
        ];
    }

    private function syncAgentAvailability(User $agent): void
    {
        $profile = $agent->agentProfile;

        if (! $profile) {
            return;
        }

        $openTickets = Ticket::query()
            ->where('assigned_to', $agent->id)
            ->whereHas('status', fn ($query) => $query->where('is_close', false))
            ->count();

        $maxTickets = $profile->max_active_tickets ?: 10;

        $profile->update([
            'is_available' => $openTickets < $maxTickets,
            'last_assigned_at' => now(),
        ]);
    }

    private function findAgent(): ?User
    {
        return User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->whereHas('roles', fn ($query) => $query->where('name', Role::SupportAgent))
            ->whereHas('agentProfile', fn ($query) => $query->where('is_available', true))
            ->with('agentProfile')
            ->get()
            ->sortBy(fn (User $agent) => Ticket::where('assigned_to', $agent->id)
                ->whereHas('status', fn ($query) => $query->where('is_close', false))
                ->count())
            ->first();
    }

    private function agentOptions()
    {
        return User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->whereHas('roles', fn ($query) => $query->where('name', Role::SupportAgent))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function authorizeTicket(User $user, Ticket $ticket): void
    {
        if ($user->isSystemAdmin()) {
            return;
        }

        if ($user->hasRole(Role::SupportAgent) && (int) $ticket->assigned_to === (int) $user->id) {
            return;
        }

        if ((int) $ticket->created_by === (int) $user->id) {
            return;
        }

        abort(403, 'You do not have access to this ticket.');
    }

    private function nextTicketNumber(): string
    {
        $year = now()->year;
        $number = Ticket::whereYear('created_at', $year)->count() + 1;

        return sprintf('TKT-%d-%06d', $year, $number);
    }
}
