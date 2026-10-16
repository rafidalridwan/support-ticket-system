<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $user = User::updateOrCreate(
            ['email' => 'administrator@gmail.com'],
            [
                'name' => 'Administrator',
                'phone' => null,
                'password' => '12345678',
                'status' => User::STATUS_ACTIVE,
                'is_protected' => true,
            ]
        );

        $user->syncRoles([
            Role::findByName('administrator', 'web'),
        ]);

    }
}
