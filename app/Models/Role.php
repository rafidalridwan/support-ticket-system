<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    public const Administrator = 'administrator';
    public const SupportAgent = 'support_agent';
    public const User = 'user';

    protected $fillable = [
        'name',
        'guard_name',
        'label',
    ];
}
