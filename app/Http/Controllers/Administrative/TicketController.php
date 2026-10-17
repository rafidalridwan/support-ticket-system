<?php

namespace App\Http\Controllers\Administrative;

use App\Enums\SlaPolicyPriority;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Role;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketAssignment;
use App\Models\TicketCategory;
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
            ->with(['creator:id,name', 'assignee:id,name', 'category:id,name', 'status:id,name', 'slaPolicy:id,name'])
            ->latest();

        if ($user->isSystemAdmin()) {
            // Administrators can see every ticket.
        } elseif ($user->hasRole(Role::SupportAgent)) {
            $query->where('assigned_to', $user->id);
        } else {
            $query->where('created_by', $user->id);
        }

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($query) use ($search) {
                $query->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('assignee', fn($q) => $q->where('name', 'like', "%{$search}%"));
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
            'statuses' => TicketStatus::orderBy('id')->get(['id', 'name']),
            'priorities' => SlaPolicyPriority::options(),
            'filters' => $request->only([
                'search',
                'status_id',
                'priority',
                'category_id',
                'date_from',
                'date_to',
            ]),
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
            $sla = $this->slaTimes($policy, $now);

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
                'sla_started_at' => $sla['started_at'],
                'sla_warning_at' => $sla['warning_at'],
                'sla_due_at' => $sla['due_at'],
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
            ->whereHas('roles', fn($query) => $query->where('name', Role::SupportAgent))
            ->whereHas('agentProfile', fn($query) => $query->where('is_available', true))
            ->with('agentProfile')
            ->get()
            ->sortBy(fn(User $agent) => Ticket::where('assigned_to', $agent->id)
                ->whereHas('status', fn ($query) => $query->where('is_close', false))
                ->count())
            ->first();
    }

    private function nextTicketNumber(): string
    {
        $year = now()->year;
        $number = Ticket::whereYear('created_at', $year)->count() + 1;

        return sprintf('TKT-%d-%06d', $year, $number);
    }
}
