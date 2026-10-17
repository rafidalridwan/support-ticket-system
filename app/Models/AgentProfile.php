<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentProfile extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'is_available',
        'max_active_tickets',
        'last_assigned_at',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'max_active_tickets' => 'integer',
            'last_assigned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
