# Support Ticket System

A support/helpdesk ticketing system built with Laravel, Inertia.js and React — with role-based access control, SLA policies, business hours, ticket assignment, notifications, and SLA escalation.

Sessions, cache, and queues all run on the **database** driver — no Redis (or any other external service) is required.

## Stack

- Laravel 13 / PHP 8.5
- Inertia.js + React 18
- Spatie Laravel Permission (roles & permissions)
- Tailwind CSS + Vite
- MySQL (database-backed sessions, cache, and queue)

## Features

- Web auth: login / logout (with login rate limiting and account lockout)
- Tickets: create, reply, assign, change status, attachments, activity log
- Ticket categories & statuses (CRUD)
- SLA policies (CRUD), business hours, and automatic SLA escalation (`sla:escalation`, scheduled every minute)
- In-app notifications for ticket creation, assignment, and SLA events
- Users CRUD (role assignment, agent profiles, status)
- Roles & permissions CRUD

## Requirements

Make sure the following are installed before you start:

| Tool | Version |
|------|---------|
| PHP | 8.5+ (with the extensions Laravel requires: Bcmath, Ctype, Fileinfo, JSON, MbString, OpenSSL, PDO, Tokenizer, XML — plus `pdo_mysql`) |
| Composer | 2.x |
| Node.js | 20+ (with npm) |
| MySQL | 8.x (or MariaDB 10.6+) |

## Installation

### 1. Clone the project

```bash
git clone git@github.com:rafidalridwan/support-ticket-system.git
cd support-ticket-system
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Configure the environment

```bash
cp .env.example .env
php artisan key:generate
```

Create the database, then update the `DB_*` values in `.env` to match your setup:

```sql
CREATE DATABASE support_ticket_system;
```

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=support_ticket_system
DB_USERNAME=root
DB_PASSWORD=
```

The defaults in `.env.example` already use the database for sessions, cache, and queues, so nothing else needs to be configured:

```dotenv
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

> Prefer SQLite for a quick local try-out? Set `DB_CONNECTION=sqlite`, create an empty `database/database.sqlite` file, and remove (or comment out) the other `DB_*` lines.

### 4. Run migrations and seeders

```bash
php artisan migrate --seed
```

This creates all tables (including the `sessions`, `cache`, and `jobs` tables used by the database drivers) and seeds the roles, permissions, and the default administrator account.

### 5. Link public storage

Ticket attachments are stored on the `public` disk, so create the storage symlink:

```bash
php artisan storage:link
```

### 6. Run the application

**Option A — everything in one command** (web server, queue worker, log viewer, and Vite):

```bash
composer dev
```

**Option B — separate terminals:**

```bash
php artisan serve        # http://localhost:8000
npm run dev              # Vite dev server (hot reload)
php artisan queue:work   # processes queued jobs (notifications, mail)
php artisan schedule:work # runs the SLA escalation schedule
```

Then open <http://localhost:8000> — it redirects to the dashboard login.

#### Default administrator (from the seeder)

- Email: `administrator@gmail.com`
- Password: `12345678`

> ⚠️ Change this password (or create your own admin user) before using the app anywhere beyond your local machine.

## Useful routes

| Area | Path |
|------|------|
| Login | `/login` |
| Dashboard | `/administrative/dashboard` |
| Tickets | `/administrative/ticket` |
| Notifications | `/administrative/notifications` |
| SLA policies | `/administrative/sla-policy` |
| Business hours | `/administrative/business-hour` |
| Ticket statuses | `/administrative/ticket-status` |
| Ticket categories | `/administrative/ticket-category` |
| Users | `/administrative/user` |
| Roles | `/administrative/role` |
| Permissions | `/administrative/permission` |

## Roles & permissions seeded

Seeded roles:

| Role | Permissions |
|------|-------------|
| `administrator` | All permissions |
| `support_agent` | `ticket_list` |
| `user` | `ticket_list`, `ticket_create` |

Permissions are grouped by area: `setting_menu`, `user_*`, `role_*`, `permission_*`, `sla_policy_*`, `business_hour_*`, `ticket_status_*`, `ticket_category_*`, and `ticket_*` (`ticket_list`, `ticket_create`).

## Background jobs & scheduling

Two processes need to keep running alongside the web server:

- **Queue worker** — `php artisan queue:work` (already included in `composer dev`). In production, run it under a process manager such as Supervisor.
- **Scheduler** — drives the every-minute `sla:escalation` command. Locally use `php artisan schedule:work`; in production add the standard Laravel cron entry instead:

```cron
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## Production notes

```bash
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Also set `APP_ENV=production` and `APP_DEBUG=false` in `.env`, point `APP_URL` at your real domain, and make sure the queue worker and scheduler (above) are running.

## Tests

Tests run against in-memory SQLite (`phpunit.xml`), so no extra setup is needed:

```bash
php artisan test
# or
composer test
```
