<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleEditRequest;
use App\Http\Requests\RoleStoreRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Administrative/Role/Index', [
            'roles' => Role::with('permissions')->orderBy('name')->get(),
            'permission' => $this->groupedPermissionOptions(),
        ]);
    }

    public function store(RoleStoreRequest $request)
    {
        $data = $request->validated();

        $role = Role::create([
            'name' => $data['name'],
            'label' => $data['label'] ?? Str::headline(str_replace('_', ' ', $data['name'])),
            'guard_name' => 'web',
        ]);

        $permissions = array_values(array_filter($data['permissions'] ?? []));
        if ($permissions !== []) {
            $role->syncPermissions($permissions);
        }

        return redirect()
            ->route('administrative.role.index')
            ->with('success', 'Role created successfully.');
    }

    public function update(RoleEditRequest $request, Role $role)
    {
        $data = $request->validated();

        $role->update([
            'name' => $data['name'],
            'label' => $data['label'] ?? $role->label ?? Str::headline(str_replace('_', ' ', $data['name'])),
        ]);

        $role->syncPermissions(array_values(array_filter($data['permissions'] ?? [])));

        return redirect()
            ->route('administrative.role.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return redirect()
            ->route('administrative.role.index')
            ->with('success', 'Role deleted successfully.');
    }

    private function groupedPermissionOptions(): array
    {
        return Permission::query()
            ->orderBy('label')
            ->orderBy('name')
            ->get(['id', 'name', 'label'])
            ->groupBy(fn (Permission $permission) => $permission->label ?: 'General')
            ->map(function ($permissions, $groupLabel) {
                return [
                    'label' => $groupLabel,
                    'options' => $permissions->map(fn (Permission $permission) => [
                        'value' => $permission->id,
                        'label' => Str::headline(str_replace('_', ' ', $permission->name)),
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();
    }
}
