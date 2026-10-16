<?php

namespace App\Services;

use App\Models\User;

class AccountLockoutService
{
    public function maxAttempts(): int
    {
        return max(1, (int) config('auth.lockout.max_attempts', 5));
    }

    public function lockoutMinutes(): int
    {
        return max(1, (int) config('auth.lockout.minutes', 15));
    }

    /**
     * Clear an expired lock so the account gets a fresh attempt count.
     */
    public function releaseIfExpired(User $user): void
    {
        if ($user->locked_until === null || $user->locked_until->isFuture()) {
            return;
        }

        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ])->save();
    }

    public function lockMessage(User $user): ?string
    {
        $this->releaseIfExpired($user);

        if ($user->locked_until === null || ! $user->locked_until->isFuture()) {
            return null;
        }

        $seconds = max(1, $user->locked_until->getTimestamp() - now()->getTimestamp());
        $minutes = (int) ceil($seconds / 60);
        $unit = $minutes === 1 ? 'minute' : 'minutes';

        return "Your account is locked. Please try again in {$minutes} {$unit}.";
    }

    public function recordFailure(User $user): void
    {
        $this->releaseIfExpired($user);

        $attempts = (int) $user->failed_login_attempts + 1;
        $attributes = [
            'failed_login_attempts' => $attempts,
        ];

        if ($attempts >= $this->maxAttempts()) {
            $attributes['locked_until'] = now()->addMinutes($this->lockoutMinutes());
        }

        $user->forceFill($attributes)->save();
    }

    public function clear(User $user): void
    {
        if ((int) $user->failed_login_attempts === 0 && $user->locked_until === null) {
            return;
        }

        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ])->save();
    }
}
