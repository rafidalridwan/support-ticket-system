<?php

use App\Models\Role;
use Database\Seeders\RolePermissionSeeder;

describe('Role model', function () {
    it('can be created updated and deleted', function () {
        $this->seed(RolePermissionSeeder::class);

        $role = Role::create([
            'name' => 'editor',
            'guard_name' => 'web',
            'label' => 'Editor',
        ]);

        expect($role->name)->toBe('editor')
            ->and($role->label)->toBe('Editor');

        $role->update(['label' => 'Content Editor', 'name' => 'content_editor']);
        $role->refresh();

        expect($role->name)->toBe('content_editor')
            ->and($role->label)->toBe('Content Editor');

        $roleId = $role->id;
        $role->delete();

        expect(Role::query()->find($roleId))->toBeNull();
    });
});
