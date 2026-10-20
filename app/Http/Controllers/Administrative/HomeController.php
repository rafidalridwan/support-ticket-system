<?php

namespace App\Http\Controllers\Administrative;

use App\Enums\SlaPolicyPriority;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $now = now();
        $stats = [
            'open' => Ticket::query()->whereNull('closed_at')->count(),
            'unassigned' => Ticket::query()->whereNull('assigned_to')->whereNull('closed_at')->count(),
            'critical' => Ticket::query()->where('priority', SlaPolicyPriority::Critical)->whereNull('closed_at')->count(),
            'sla_breached' => Ticket::query()->whereNull('closed_at')
                ->whereNotNull('sla_due_at')
                ->where('sla_due_at', '<', $now)
                ->count(),
            'approaching_sla' => Ticket::query()->whereNull('closed_at')
                ->whereBetween('sla_due_at', [$now, $now->copy()->addMinutes(30)])
                ->count(),
            'resolved' => Ticket::query()->whereNotNull('closed_at')->count(),
        ];

        $byPriority = collect(SlaPolicyPriority::cases())->map(function (SlaPolicyPriority $priority) {
            return [
                'priority' => $priority->value,
                'label' => $priority->label(),
                'count' => Ticket::query()->whereNull('closed_at')->where('priority', $priority)->count(),
            ];
        })->values();

        $byAgent = Ticket::query()
            ->whereNull('closed_at')
            ->whereNotNull('assigned_to')
            ->join('users', 'users.id', '=', 'tickets.assigned_to')
            ->select(
                'tickets.assigned_to as agent_id',
                'users.name',
                DB::raw('count(*) as count'),
            )
            ->groupBy('tickets.assigned_to', 'users.name')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'agent_id' => (int) $row->agent_id,
                'name' => $row->name,
                'count' => (int) $row->count,
            ]);
        $user = Auth::user();
        $isStaff = $user?->hasAnyRole(['administrator', 'user']) ?? false;
        return Inertia::render('Administrative/Dashboard', [
            'stats' => $stats,
            'byPriority' => $byPriority,
            'byAgent' => $byAgent,
            'isStaff' => $isStaff,
            'resolvedStatusId' => TicketStatus::query()->where('value', 'resolved')->value('id'),
        ]);
    }
}
