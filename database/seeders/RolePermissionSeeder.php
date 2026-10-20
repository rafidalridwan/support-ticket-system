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
            'support_agent' => 'Support Agent',
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

            ['sla_policy_list', 'SLA Policy Management'],
            ['sla_policy_create', 'SLA Policy Management'],
            ['sla_policy_edit', 'SLA Policy Management'],
            ['sla_policy_delete', 'SLA Policy Management'],

            ['business_hour_list', 'Business Hour Management'],
            ['business_hour_edit', 'Business Hour Management'],

            ['ticket_status_list', 'Ticket Status Management'],
            ['ticket_status_create', 'Ticket Status Management'],
            ['ticket_status_edit', 'Ticket Status Management'],
            ['ticket_status_delete', 'Ticket Status Management'],

            ['ticket_category_list', 'Ticket Category Management'],
            ['ticket_category_create', 'Ticket Category Management'],
            ['ticket_category_edit', 'Ticket Category Management'],
            ['ticket_category_delete', 'Ticket Category Management'],

            ['ticket_list', 'Ticket Management'],
            ['ticket_create', 'Ticket Management'],
        ];

        foreach ($permissions as [$name, $label]) {
            Permission::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['label' => $label]
            );
        }

        Role::findByName('administrator', 'web')
            ->syncPermissions(Permission::all());

        Role::findByName('user', 'web')
            ->syncPermissions(['ticket_list', 'ticket_create']);

        Role::findByName('support_agent', 'web')
            ->syncPermissions(['ticket_list']);
    }
}
