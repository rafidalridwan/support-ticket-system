<?php

use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketStatus;
use App\Notifications\TicketEventNotification;
use Illuminate\Support\Facades\Notification;

describe('SLA escalation', function () {
    beforeEach(function () {
        seedTicketCatalog();
    });

    it('sets warning fields when warning time has passed', function () {
        Notification::fake();

        $agent = createSupportAgent();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-200001',
            'unique_key' => 'SLAW01',
            'subject' => 'Approaching SLA',
            'description' => 'Warn me',
            'created_by' => $user->id,
            'assigned_to' => $agent->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
            'sla_minutes' => 120,
            'sla_started_at' => now()->subMinutes(100),
            'sla_warning_at' => null,
            'sla_due_at' => now()->addMinutes(20),
            'is_escalated' => false,
        ]);

        $this->artisan('sla:escalation')->assertSuccessful();

        $ticket->refresh();

        expect($ticket->sla_warning_at)->not->toBeNull()
            ->and($ticket->sla_warning_sent_at)->not->toBeNull()
            ->and($ticket->is_escalated)->toBeFalse();

        Notification::assertSentTo($agent, TicketEventNotification::class);
    });

    it('escalates and reassigns when sla_due_at is past', function () {
        Notification::fake();

        $oldAgent = createSupportAgent(['email' => 'old-agent@example.com']);
        $newAgent = createSupportAgent(['email' => 'new-agent@example.com']);
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-200002',
            'unique_key' => 'SLAB01',
            'subject' => 'Breached SLA',
            'description' => 'Escalate me',
            'created_by' => $user->id,
            'assigned_to' => $oldAgent->id,
            'category_id' => $category->id,
            'priority' => 3,
            'status_id' => $status->id,
            'sla_minutes' => 60,
            'sla_started_at' => now()->subHours(2),
            'sla_warning_at' => now()->subHour(),
            'sla_due_at' => now()->subMinutes(10),
            'is_escalated' => false,
        ]);

        $this->artisan('sla:escalation')->assertSuccessful();

        $ticket->refresh();

        expect($ticket->is_escalated)->toBeTrue()
            ->and($ticket->sla_breached_at)->not->toBeNull()
            ->and($ticket->escalated_at)->not->toBeNull()
            ->and($ticket->assigned_to)->toBe($newAgent->id);

        Notification::assertSentTo($oldAgent, TicketEventNotification::class);
        Notification::assertSentTo($newAgent, TicketEventNotification::class);
    });
});
