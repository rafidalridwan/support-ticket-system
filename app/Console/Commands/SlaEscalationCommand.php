<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketAssignment;
use App\Models\User;
use App\Notifications\TicketEventNotification;
use Illuminate\Console\Command;

class SlaEscalationCommand extends Command
{
    protected $signature = 'sla:escalation';

    protected $description = 'Check SLA warnings and escalations';

    public function handle(): int
    {
        $now = now();

        $tickets = Ticket::where('is_escalated', false)
            ->whereHas('status', fn ($q) => $q->where('is_close', false))
            ->get();

        foreach ($tickets as $ticket) {

            // 1. SLA warning
            if (
                ! $ticket->sla_warning_at &&
                $ticket->sla_started_at &&
                $ticket->sla_minutes
            ) {
                $warningTime = $ticket->sla_started_at
                    ->copy()
                    ->addMinutes(max(0, $ticket->sla_minutes - 30));

                if ($now->gte($warningTime)) {
                    $ticket->update([
                        'sla_warning_at' => $now,
                        'sla_warning_sent_at' => $now,
                    ]);

                    $ticket->loadMissing('assignee');
                    $ticket->assignee?->notify(new TicketEventNotification(
                        $ticket,
                        'sla_approaching',
                        "SLA is approaching for ticket {$ticket->ticket_number}."
                    ));

                    $this->info("Warning set for ticket #{$ticket->id}");
                }
            }

            // 2. Check SLA deadline
            if (! $ticket->sla_due_at || $now->lt($ticket->sla_due_at)) {
                continue;
            }

            // 3. Find another available agent
            $agent = User::where('status', User::STATUS_ACTIVE)
                ->whereHas('roles', fn ($q) =>
                    $q->where('name', Role::SupportAgent)
                )
                ->whereHas('agentProfile', fn ($q) =>
                    $q->where('is_available', true)
                )
                ->where('id', '!=', $ticket->assigned_to)
                ->first();

            // 4. Mark ticket as escalated
            $oldAgentId = $ticket->assigned_to;

            $ticket->update([
                'sla_breached_at' => $ticket->sla_breached_at ?? $now,
                'is_escalated' => true,
                'escalated_at' => $now,
                'assigned_to' => $agent?->id ?? $oldAgentId,
                'assigned_at' => $agent ? $now : $ticket->assigned_at,
            ]);

            // 5. Update assignment history
            if ($agent) {
                TicketAssignment::where('ticket_id', $ticket->id)
                    ->whereNull('unassigned_at')
                    ->update(['unassigned_at' => $now]);

                TicketAssignment::create([
                    'ticket_id' => $ticket->id,
                    'agent_id' => $agent->id,
                    'assigned_by' => null,
                    'assignment_type' => 'escalation',
                    'assigned_at' => $now,
                ]);
            }

            // 6. Record activity
            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'actor_id' => null,
                'event' => 'escalated',
                'old_values' => ['assigned_to' => $oldAgentId],
                'new_values' => [
                    'assigned_to' => $agent?->id ?? $oldAgentId,
                    'is_escalated' => true,
                ],
                'description' => $agent
                    ? "SLA breached. Reassigned to {$agent->name}."
                    : 'SLA breached. No available agent for reassignment.',
            ]);

            $breachMessage = "SLA breached for ticket {$ticket->ticket_number}.";
            if ($oldAgentId) {
                User::find($oldAgentId)?->notify(new TicketEventNotification(
                    $ticket,
                    'sla_breached',
                    $breachMessage
                ));
            }
            if ($agent) {
                $agent->notify(new TicketEventNotification(
                    $ticket,
                    'sla_breached',
                    $breachMessage.' It was reassigned to you.'
                ));
            }

            $this->info("Ticket #{$ticket->id} escalated.");
        }

        $this->info('SLA escalation check completed.');

        return self::SUCCESS;
    }
}