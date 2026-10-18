<?php

use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketStatus;

describe('Dashboard', function () {
    beforeEach(function () {
        seedTicketCatalog();
    });

    it('shows dashboard stats for an administrator', function () {
        $admin = createAdministrator();
        $user = createEndUser();
        $category = TicketCategory::where('value', 'technical')->firstOrFail();
        $open = TicketStatus::where('value', 'open')->firstOrFail();
        $resolved = TicketStatus::where('value', 'resolved')->firstOrFail();

        Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-100001',
            'unique_key' => 'DASH01',
            'subject' => 'Open critical',
            'description' => 'Critical issue',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 4,
            'status_id' => $open->id,
        ]);

        Ticket::withoutGlobalScopes()->create([
            'ticket_number' => 'TKT-2026-100002',
            'unique_key' => 'DASH02',
            'subject' => 'Resolved ticket',
            'description' => 'Done',
            'created_by' => $user->id,
            'category_id' => $category->id,
            'priority' => 2,
            'status_id' => $resolved->id,
            'closed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('administrative.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Administrative/Dashboard')
                ->where('stats.open', 1)
                ->where('stats.critical', 1)
                ->where('stats.resolved', 1)
                ->where('stats.unassigned', 1)
                ->has('byPriority')
                ->has('byAgent')
            );
    });

    it('requires authentication', function () {
        $this->get(route('administrative.dashboard'))
            ->assertRedirect(route('login'));
    });
});
