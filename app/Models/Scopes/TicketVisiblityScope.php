<?php

namespace App\Models\Scopes;

use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TicketVisiblityScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = request()->user();

        if (! $user || $user->isAdministrator()) {
            return;
        }

        if ($user->hasRole(Role::SupportAgent)) {
            $builder->where('assigned_to', $user->id);
            return;
        }

        if ($user->hasRole(Role::User)) {
            $builder->where('created_by', $user->id);
            return;
        }

    }
}