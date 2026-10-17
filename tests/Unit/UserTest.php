<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

describe('User model', function () {
    it('treats active status as active', function () {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        expect($user->isActive())->toBeTrue();
    });

    it('treats inactive status as not active', function () {
        $user = User::factory()->inactive()->create();

        expect($user->isActive())->toBeFalse();
    });

    it('identifies system admin via role', function () {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('system_admin');

        $member = User::factory()->create();

        expect($admin->isAdministrator())->toBeTrue()
            ->and($member->fresh()->isAdministrator())->toBeFalse();
    });
});
