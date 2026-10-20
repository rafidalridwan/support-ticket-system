<?php

use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketStatus;
use App\Notifications\TicketEventNotification;

describe('Notifications', function () {
    beforeEach(function () {
        seedTicketCatalog();
    });

    it('lists unread notifications for the current user', function () {
        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-300001',
            'unique_key' => 'NOTF01',
            'subject' => 'Notify',
            'description' => 'Hello',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
        ]);

        $admin->notify(new TicketEventNotification(
            $ticket,
            'ticket_created',
            "Ticket {$ticket->ticket_number} was created."
        ));

        $this->actingAs($admin)
            ->get(route('administrative.notifications.index'))
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.0.event', 'ticket_created');
    });

    it('marks a notification as read', function () {
        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-300002',
            'unique_key' => 'NOTF02',
            'subject' => 'Mark read',
            'description' => 'Hello',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $status->id,
        ]);

        $admin->notify(new TicketEventNotification(
            $ticket,
            'ticket_assigned',
            'Assigned to you.'
        ));

        $notificationId = $admin->unreadNotifications()->first()->id;

        $this->actingAs($admin)
            ->post(route('administrative.notifications.read', $notificationId))
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        expect($admin->fresh()->unreadNotifications()->count())->toBe(0);
    });

    it('marks all notifications as read', function () {
        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $status = TicketStatus::where('value', 'open')->firstOrFail();

        $ticket = Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-300003',
            'unique_key' => 'NOTF03',
            'subject' => 'Mark all',
            'description' => 'Hello',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 1,
            'status_id' => $status->id,
        ]);

        $admin->notify(new TicketEventNotification($ticket, 'ticket_created', 'One'));
        $admin->notify(new TicketEventNotification($ticket, 'ticket_assigned', 'Two'));

        expect($admin->fresh()->unreadNotifications()->count())->toBe(2);

        $this->actingAs($admin)
            ->post(route('administrative.notifications.read-all'))
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        expect($admin->fresh()->unreadNotifications()->count())->toBe(0);
    });
});
