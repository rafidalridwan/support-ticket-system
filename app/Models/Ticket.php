<?php

namespace App\Models;

use App\Enums\SlaPolicyPriority;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

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
