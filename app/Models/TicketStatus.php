<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketStatus extends Model
{
    use SoftDeletes;
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
