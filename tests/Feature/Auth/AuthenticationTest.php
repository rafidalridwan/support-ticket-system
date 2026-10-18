<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

describe('Authentication', function () {
    it('shows the login page to guests', function () {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Auth/Login'));
    });

    it('authenticates an active system admin and redirects to the dashboard', function () {
        $admin = createSystemAdmin([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertRedirect(route('administrative.dashboard'));

        $this->assertAuthenticatedAs($admin);
    });

    it('rejects invalid credentials', function () {
        createSystemAdmin([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->from(route('login'))
            ->post('/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-password',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    it('rejects inactive accounts', function () {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->inactive()->create([
            'email' => 'inactive@example.com',
            'password' => 'password',
        ]);
        $user->assignRole('administrator');

        $this->from(route('login'))
            ->post('/login', [
                'email' => 'inactive@example.com',
                'password' => 'password',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    it('rejects users without a role', function () {
        User::factory()->create([
            'email' => 'norole@example.com',
            'password' => 'password',
            'status' => User::STATUS_ACTIVE,
        ]);

        $this->from(route('login'))
            ->post('/login', [
                'email' => 'norole@example.com',
                'password' => 'password',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    it('logs out an authenticated user', function () {
        $admin = createSystemAdmin();

        $this->actingAs($admin)
            ->get(route('administrative.logout'))
            ->assertRedirect();

        $this->assertGuest();
    });
});
