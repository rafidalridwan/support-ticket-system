<?php

use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketMessage;
use App\Models\TicketStatus;
use App\Notifications\TicketEventNotification;
use Illuminate\Support\Facades\Notification;

describe('Tickets', function () {
    beforeEach(function () {
        seedTicketCatalog();
    });

    it('lets an authenticated user create a ticket', function () {
        Notification::fake();

        $user = createEndUser();
        $agent = createSupportAgent();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();

        $this->actingAs($user)
            ->post(route('administrative.ticket.store'), [
                'subject' => 'Power outage',
                'description' => 'No electricity in sector 5.',
                'category_id' => $category->id,
                'priority' => 3,
            ])
            ->assertRedirect(route('administrative.ticket.index'));

        $ticket = Ticket::withoutGlobalScopes()->first();

        expect($ticket)->not->toBeNull()
            ->and($ticket->subject)->toBe('Power outage')
            ->and($ticket->created_by)->toBe($user->id)
            ->and($ticket->assigned_to)->toBe($agent->id)
            ->and($ticket->priority->value)->toBe(3);

        Notification::assertSentTo($user, TicketEventNotification::class);
        Notification::assertSentTo($agent, TicketEventNotification::class);
    });

    it('lists tickets for an administrator', function () {
        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-000001',
            'unique_key' => 'ABC123',
            'subject' => 'Test ticket',
            'description' => 'Description',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
        ]);

        $this->actingAs($admin)
            ->get(route('administrative.ticket.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Administrative/Tickets/Index')
                ->has('tickets.data', 1)
            );
    });

    it('assigns a ticket to an agent', function () {
        Notification::fake();

        $admin = createAdministrator();
        $agent = createSupportAgent();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-000002',
            'unique_key' => 'ASGN01',
            'subject' => 'Assign me',
            'description' => 'Needs agent',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
        ]);

        $this->actingAs($admin)
            ->post(route('administrative.ticket.assign', $ticket), [
                'assigned_to' => $agent->id,
            ])
            ->assertRedirect();

        expect($ticket->fresh()->assigned_to)->toBe($agent->id);

        Notification::assertSentTo($agent, TicketEventNotification::class);
    });

    it('records a customer reply and notifies the agent', function () {
        Notification::fake();

        $user = createEndUser();
        $agent = createSupportAgent();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-000003',
            'unique_key' => 'RPLY01',
            'subject' => 'Reply test',
            'description' => 'Initial',
            'created_by' => $user->id,
            'assigned_to' => $agent->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
        ]);

        $this->actingAs($user)
            ->post(route('administrative.ticket.reply', $ticket), [
                'body' => 'Any update?',
                'type' => 'reply',
            ])
            ->assertRedirect(route('administrative.ticket.show', $ticket));

        expect(TicketMessage::where('ticket_id', $ticket->id)->count())->toBe(1);

        Notification::assertSentTo($agent, TicketEventNotification::class);
    });

    it('resolves a ticket and notifies the creator', function () {
        Notification::fake();

        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $open = TicketStatus::where('value', 'open')->firstOrFail();
        $resolved = TicketStatus::where('value', 'resolved')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-000004',
            'unique_key' => 'RSLV01',
            'subject' => 'Resolve test',
            'description' => 'Please resolve',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $open->id,
        ]);

        $this->actingAs($admin)
            ->post(route('administrative.ticket.status', $ticket), [
                'status_id' => $resolved->id,
            ])
            ->assertRedirect(route('administrative.ticket.show', $ticket));

        $ticket->refresh();

        expect($ticket->status_id)->toBe($resolved->id)
            ->and($ticket->closed_at)->not->toBeNull();

        Notification::assertSentTo($user, TicketEventNotification::class);
    });

    it('hides other users tickets from a regular user', function () {
        $user = createEndUser();
        $other = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-000005',
            'unique_key' => 'HIDE01',
            'subject' => 'Other ticket',
            'description' => 'Secret',
            'created_by' => $other->id,
            'category_id' => $category->id,
            'priority' => 1,
            'status_id' => $status->id,
        ]);

        $this->actingAs($user)
            ->get(route('administrative.ticket.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('tickets.data', 0));
    });
});
