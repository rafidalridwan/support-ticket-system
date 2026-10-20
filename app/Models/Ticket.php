<?php

namespace App\Models;

use App\Enums\SlaPolicyPriority;
use App\Models\Scopes\TicketVisiblityScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
class Ticket extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'unique_key',
        'subject',
        'description',
        'created_by',
        'assigned_to',
        'assigned_at',
        'category_id',
        'priority',
        'status_id',
        'sla_policy_id',
        'sla_started_at',
        'sla_warning_at',
        'sla_warning_sent_at',
        'sla_due_at',
        'sla_minutes',
        'sla_breached_at',
        'is_escalated',
        'escalated_at',
        'closed_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            $ticket->unique_key = Str::upper(Str::random(6));
        });
        static::addGlobalScope(new TicketVisiblityScope());
    }

    public function getRouteKeyName(): string
    {
        return 'unique_key';
    }

    protected $appends = [
        'sla_status',
    ];

    protected function casts(): array
    {
        return [
            'priority' => SlaPolicyPriority::class,
            'assigned_at' => 'datetime',
            'sla_started_at' => 'datetime',
            'sla_warning_at' => 'datetime',
            'sla_warning_sent_at' => 'datetime',
            'sla_due_at' => 'datetime',
            'sla_minutes' => 'integer',
            'sla_breached' => 'boolean',
            'sla_breached_at' => 'datetime',
            'is_escalated' => 'boolean',
            'escalated_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function scopeSearch(Builder $query, array $filters): void
    {
        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(function ($query) use ($search) {
                $query->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('unique_key', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('assignee', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if (isset($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['sla_status'])) {
            $status = $filters['sla_status'];
            $now = now();

            if ($status === 'sla_breached') {
                $query->whereNotNull('sla_due_at')
                    ->where('sla_due_at', '<', $now);
            } elseif ($status === 'approaching_sla_breach') {
                $query->whereBetween('sla_due_at', [
                    $now,
                    $now->copy()->addMinutes(30),
                ]);
            } elseif ($status === 'within_sla') {
                $query->whereNotNull('sla_due_at')
                    ->Where('sla_due_at', '>', $now->copy()->addMinutes(30));
            }
        }

        if (isset($filters['assigned_to'])) {
            $assignedTo = (string) $filters['assigned_to'];

            if ($assignedTo === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', (int) $assignedTo);
            }
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TicketStatus::class);
    }

    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SlaPolicy::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TicketAssignment::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TicketActivity::class);
    }

    public function getSlaStatusAttribute(): string
    {
        if (! $this->sla_due_at) {
            return 'within_sla';
        }

        if ($this->sla_due_at->isPast()) {
            return 'sla_breached';
        }

        if (now()->diffInMinutes($this->sla_due_at) <= 30) {
            return 'approaching_sla_breach';
        }

        return 'within_sla';
    }
}
