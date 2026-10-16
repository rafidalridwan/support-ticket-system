<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature', 'Unit');

/**
 * Seed roles/permissions and return a system admin user.
 */
function createSystemAdmin(array $attributes = []): User
{
    test()->seed(RolePermissionSeeder::class);

    $user = User::factory()->create(array_merge([
        'status' => User::STATUS_ACTIVE,
        'is_protected' => true,
    ], $attributes));

    $user->assignRole('system_admin');

    return $user->fresh();
}
