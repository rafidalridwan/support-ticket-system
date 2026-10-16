<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionEditRequest;
use App\Http\Requests\PermissionStoreRequest;
use App\Models\Permission;
use Inertia\Inertia;

class PermissionController extends Controller
{

    public function index()
    {
        try {
            return Inertia::render('Administrative/Permission/Index', [
                'permissions' => Permission::query()
                    ->orderBy('label')
                    ->orderBy('name')
                    ->get(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(PermissionStoreRequest $request)
    {
        try {
            Permission::create($request->all());

            return redirect()->route('administrative.permission.index')->with('success', 'Permission created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('Administrative/Permission/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(PermissionEditRequest $request, Permission $permission)
    {
        try {
            $permission->update($request->all());

            return redirect()->route('administrative.permission.index')->with('success', 'Permission updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return redirect()->route('administrative.permission.index')->with('success', 'Permission deleted successfully.');
    }
}
