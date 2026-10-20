<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $userData = null;
        $permissions = [];
        $isAdministrator = false;
        $currentRole = null;

        if ($user) {
            $roleNames = $user->roles()->pluck('name')->toArray();

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => array_map(fn($name) => ['name' => $name], $roleNames),
            ];

            $isAdministrator = $user->isAdministrator();
            $permissions = $user->getAllPermissions()->pluck('name')->values()->all();

            $primaryRole = $user->roles()->select(['name', 'label'])->first();
            if ($primaryRole) {
                $currentRole = [
                    'name' => $primaryRole->name,
                    'label' => $primaryRole->label ?: $primaryRole->name,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
                'permissions' => $permissions,
                'is_administrator' => $isAdministrator,
                'role' => $currentRole,
            ],
            'unreadNotificationsCount' => $user
                ? $user->unreadNotifications()->count()
                : 0,
            'flash' => [
                'success' => $request->session()->pull('success'),
                'error' => $request->session()->pull('error'),
                'info' => $request->session()->pull('info'),
                'warning' => $request->session()->pull('warning'),
            ],
            'csrf_token' => csrf_token(),
            'pagination' => [
                'per_page' => (int) config('pagination.per_page', 25),
                'options' => config('pagination.options', [25, 50, 100]),
            ],
            'website' => [
                'website_name' => config('app.name', 'Pera'),
                'favicon' => null,
                'primary_color' => '#e60013',
            ],
        ];
    }
}
