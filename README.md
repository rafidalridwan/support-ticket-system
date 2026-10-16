# Users, Roles & Permissions Boilerplate

Laravel + Inertia (React) starter focused on authentication and RBAC.

## Stack

- Laravel 13 / PHP 8.5
- Inertia.js + React 18
- Spatie Laravel Permission
- Tailwind CSS + Vite

## Features

- Web auth: login / logout
- Users CRUD (role assignment, status)
- Roles CRUD (permission sync)
- Permissions CRUD

## Quick start

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
php artisan serve
```

Default admin (from seeder):

- Email: `admin@example.com`
- Password: `12345678`

## Useful routes

| Area | Path |
|------|------|
| Login | `/login` |
| Dashboard | `/administrative/dashboard` |
| Users | `/administrative/user` |
| Roles | `/administrative/role` |
| Permissions | `/administrative/permission` |

## Permissions seeded

`setting_menu`, `user_*`, `role_*`, `permission_*`

Seeded roles: `system_admin` (all permissions) and `user`.

## Tests

```bash
php artisan test
```
