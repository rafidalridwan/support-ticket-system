<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessHourDay extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'day_of_week',
        'is_working_day',
        'start_time',
        'end_time',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'is_working_day' => 'boolean',
        ];
    }
}
