<?php

use App\Enums\SlaPolicyPriority;
use App\Models\AgentProfile;
use App\Models\BusinessHourDay;
use App\Models\Role;
use App\Models\SlaPolicy;
use App\Models\TicketCategory;
use App\Models\TicketStatus;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature', 'Unit');

/**
 * Seed roles/permissions and return an administrator.
 */
function createAdministrator(array $attributes = []): User
{
    test()->seed(RolePermissionSeeder::class);

    $user = User::factory()->create(array_merge([
        'status' => User::STATUS_ACTIVE,
        'is_protected' => true,
    ], $attributes));

    $user->assignRole(Role::Administrator);

    return $user->fresh();
}

/** @deprecated use createAdministrator() */
function createSystemAdmin(array $attributes = []): User
{
    return createAdministrator($attributes);
}

function createSupportAgent(array $attributes = []): User
{
    test()->seed(RolePermissionSeeder::class);

    $user = User::factory()->create(array_merge([
        'status' => User::STATUS_ACTIVE,
    ], $attributes));

    $user->assignRole(Role::SupportAgent);

    AgentProfile::query()->updateOrCreate(
        ['user_id' => $user->id],
        [
            'is_available' => true,
            'max_active_tickets' => 50,
        ]
    );

    return $user->fresh();
}

function createEndUser(array $attributes = []): User
{
    test()->seed(RolePermissionSeeder::class);

    $user = User::factory()->create(array_merge([
        'status' => User::STATUS_ACTIVE,
    ], $attributes));

    $user->assignRole(Role::User);

    return $user->fresh();
}

/**
 * Seed ticket statuses, categories, SLA policies, and business hours.
 */
function seedTicketCatalog(): void
{
    foreach ([
        ['name' => 'Open', 'value' => 'open', 'is_close' => false],
        ['name' => 'In Progress', 'value' => 'in_progress', 'is_close' => false],
        ['name' => 'Resolved', 'value' => 'resolved', 'is_close' => true],
        ['name' => 'Closed', 'value' => 'closed', 'is_close' => true],
    ] as $status) {
        TicketStatus::query()->updateOrCreate(
            ['value' => $status['value']],
            $status
        );
    }

    TicketCategory::query()->updateOrCreate(
        ['value' => 'technical'],
        ['name' => 'Technical']
    );

    TicketCategory::query()->updateOrCreate(
        ['value' => 'billing'],
        ['name' => 'Billing']
    );

    foreach ([
        [SlaPolicyPriority::Low, 'Low Priority SLA', 2880],
        [SlaPolicyPriority::Medium, 'Medium Priority SLA', 1440],
        [SlaPolicyPriority::High, 'High Priority SLA', 480],
        [SlaPolicyPriority::Critical, 'Critical Priority SLA', 120],
    ] as [$priority, $name, $minutes]) {
        SlaPolicy::query()->updateOrCreate(
            ['priority' => $priority->value],
            [
                'name' => $name,
                'resolution_minutes' => $minutes,
                'warning_threshold_percent' => 80,
                'is_active' => true,
            ]
        );
    }

    for ($day = 0; $day <= 6; $day++) {
        $isWorking = $day >= 1 && $day <= 5;
        BusinessHourDay::query()->updateOrCreate(
            ['day_of_week' => $day],
            [
                'is_working_day' => $isWorking,
                'start_time' => $isWorking ? '09:00:00' : null,
                'end_time' => $isWorking ? '17:00:00' : null,
            ]
        );
    }
}
