<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'administrator' => 'Administrator',
            'user' => 'User',
        ];

        foreach ($roles as $name => $label) {
            Role::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['label' => $label]
            );
        }

        $permissions = [
            ['setting_menu', 'Menu Management'],

            ['user_list', 'User Management'],
            ['user_create', 'User Management'],
            ['user_edit', 'User Management'],
            ['user_delete', 'User Management'],

            ['permission_list', 'Permission Management'],
            ['permission_create', 'Permission Management'],
            ['permission_edit', 'Permission Management'],
            ['permission_delete', 'Permission Management'],

            ['role_list', 'Role Management'],
            ['role_create', 'Role Management'],
            ['role_edit', 'Role Management'],
            ['role_delete', 'Role Management'],
        ];

        foreach ($permissions as [$name, $label]) {
            Permission::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['label' => $label]
            );
        }

        Role::findByName('administrator', 'web')
            ->syncPermissions(Permission::all());
    }
}
