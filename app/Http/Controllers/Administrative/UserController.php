<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(100, max(10, $request->integer('per_page', 25)));
        $sortDir = $request->string('sort_dir')->toString() === 'asc' ? 'asc' : 'desc';

        $query = User::query()->with(['roles:id,name,label', 'agentProfile']);

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 1 || $status === '1' || $status === 'active') {
                $query->where('status', User::STATUS_ACTIVE);
            } elseif ($status === 0 || $status === '0' || $status === 'inactive') {
                $query->where('status', User::STATUS_INACTIVE);
            }
        }

        if ($request->filled('role_id')) {
            $roleId = $request->integer('role_id');
            $query->whereHas('roles', fn ($q) => $q->where('roles.id', $roleId));
        }

        if ($request->filled('registration_date_from')) {
            $query->whereDate('created_at', '>=', $request->date('registration_date_from'));
        }

        if ($request->filled('registration_date_to')) {
            $query->whereDate('created_at', '<=', $request->date('registration_date_to'));
        }

        $query->orderBy('created_at', $sortDir);

        return Inertia::render('Administrative/Users/Index', [
            'users' => $query->paginate($perPage)->withQueryString(),
            'roles' => $this->roleOptions(),
            'filterRoles' => Role::query()
                ->orderBy('label')
                ->get(['id', 'name', 'label'])
                ->map(fn (Role $role) => [
                    'value' => $role->id,
                    'label' => $role->label ?: $role->name,
                ])
                ->values(),
            'filters' => [
                'search' => $search ?? '',
                'status' => $request->input('status'),
                'role_id' => $request->input('role_id'),
                'registration_date_from' => $request->input('registration_date_from'),
                'registration_date_to' => $request->input('registration_date_to'),
                'sort_dir' => $sortDir,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $attributes = $request->validated();
        $roleName = (string) $request->role;

        $user = User::create($attributes);

        if ($role = Role::query()->where('name', $roleName)->first()) {
            $user->assignRole($role);
        }

        $this->syncAgentProfile($user, $roleName, $request);

        return redirect()->route('administrative.user.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'agentProfile']);

        return Inertia::render('Administrative/Users/Edit', [
            'user' => $user,
            'roles' => $this->roleOptions(),
        ]);
    }

    public function update(EditUserRequest $request, User $user)
    {
        $attributes = $request->validated();
            
        $roleName = (string) $request->role;

        if (empty($attributes['password'])) {
            unset($attributes['password']);
        }

        if ($role = Role::query()->where('name', $roleName)->first()) {
            $user->syncRoles([$role]);
        }

        $user->update($attributes);

        $this->syncAgentProfile($user, $roleName, $request);

        return redirect()->route('administrative.user.index')->with('success', 'User updated successfully.');
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $user->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->is_protected) {
            return redirect()->route('administrative.user.index')->with('error', 'This user is protected and cannot be deleted.');
        }

        $user->delete();

        return redirect()->route('administrative.user.index')->with('success', 'User deleted successfully.');
    }

    private function syncAgentProfile(User $user, string $roleName, Request $request): void
    {
        if ($roleName === Role::SupportAgent) {
            $user->agentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'is_available' => $request->boolean('is_available', true),
                    'max_active_tickets' => $request->integer('max_active_tickets', 10),
                ]
            );

            return;
        }

        $user->agentProfile()->delete();
    }

    private function roleOptions()
    {
        return Role::query()
            ->orderBy('label')
            ->get(['name', 'label'])
            ->map(fn (Role $role) => [
                'value' => $role->name,
                'label' => $role->label ?: $role->name,
            ])
            ->values();
    }
}
