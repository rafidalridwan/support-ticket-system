<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketStatus extends Model
{
    protected $fillable = [
        'name',
        'value',
        'is_close',
    ];

    protected function casts(): array
    {
        return [
            'is_close' => 'boolean',
        ];
    }
}
