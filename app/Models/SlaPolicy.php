<?php

namespace App\Models;

use App\Enums\SlaPolicyPriority;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class SlaPolicy extends Model
{
    protected $fillable = [
        'name',
        'priority',
        'resolution_minutes',
        'warning_threshold_percent',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'priority' => SlaPolicyPriority::class,
            'resolution_minutes' => 'integer',
            'warning_threshold_percent' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForPriority(Builder $query, SlaPolicyPriority|int $priority): Builder
    {
        $value = $priority instanceof SlaPolicyPriority ? $priority->value : $priority;

        return $query->where('priority', $value);
    }
}
