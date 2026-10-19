<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Services\AccountLockoutService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Decay for the unknown-identifier IP rate limiter, in seconds.
     */
    private const UNKNOWN_DECAY_SECONDS = 60;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'max:255',
                $this->emailOrPhoneRule(),
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Please enter your email or phone number.',
            'email.max' => 'The email or phone may not be greater than 255 characters.',
        ];
    }

    protected function emailOrPhoneRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            $value = (string) $value;

            if (str_contains($value, '@')) {
                if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $fail('Please enter a valid email address.');
                }

                return;
            }

            $digits = preg_replace('/\D+/', '', $value) ?? '';

            if (strlen($digits) < 6 || strlen($digits) > 15) {
                $fail('Please enter a valid email address or phone number.');
            }
        };
    }

    /**
     * Prepare the data for validation.
     * Strip control characters; credentials are bound via Eloquent (not concatenated into SQL).
     */
    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $password = $this->input('password');

        if ($email !== null) {
            $email = trim(preg_replace('/[\x00-\x1F\x7F]/', '', (string) $email) ?? '');
        }

        $this->merge([
            'email' => $email,
            'password' => is_string($password) ? $password : '',
        ]);
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $lockouts = app(AccountLockoutService::class);
        $user = $this->findUser();

        if ($user) {
            $this->ensureAccountIsUnlocked($user, $lockouts);
        }

        $credentials = [
            'email' => $user?->email ?? $this->input('email'),
            'password' => $this->input('password'),
        ];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey(), self::UNKNOWN_DECAY_SECONDS);

            if ($user) {
                $lockouts->recordFailure($user);
            }

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        /** @var User|null $user */
        $user = Auth::user();

        if ($user && ! $this->accountIsActive($user)) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Your account is inactive.',
            ]);
        }

        if ($user && $user->roles->isEmpty()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'You do not have permission to access this panel.',
            ]);
        }

        if ($user) {
            $lockouts->clear($user);
            $user->update(['last_login_at' => now()]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), app(AccountLockoutService::class)->maxAttempts())) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     * Uses both email and IP address to prevent brute force attacks.
     */
    public function throttleKey(): string
    {
        $email = Str::transliterate(Str::lower($this->string('email')));
        $ip = $this->ip();

        // Create a unique key combining email and IP
        return Str::lower($email) . '|' . $ip . '|login';
    }

    private function findUser(): ?User
    {
        $contact = trim((string) $this->input('email'));

        if ($contact === '') {
            return null;
        }

        // Always bind user input as query parameters — never interpolate into SQL strings.
        if (str_contains($contact, '@')) {
            return User::query()
                ->whereRaw('LOWER(email) = ?', [Str::lower($contact)])
                ->first();
        }

        $digits = preg_replace('/\D+/', '', $contact) ?? '';

        if ($digits === '' || strlen($digits) < 6 || strlen($digits) > 15) {
            return null;
        }

        return User::query()
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->where(function ($query) use ($contact, $digits) {
                $query->where('phone', $contact)
                    ->orWhereRaw(
                        "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), '(', ''), ')', '') = ?",
                        [$digits]
                    );
            })
            ->first();
    }

    private function ensureAccountIsUnlocked(User $user, AccountLockoutService $lockouts): void
    {
        $message = $lockouts->lockMessage($user);

        if ($message === null) {
            return;
        }

        event(new Lockout($this));

        throw ValidationException::withMessages([
            'email' => $message,
        ]);
    }

    private function accountIsActive(User $user): bool
    {
        $rawStatus = $user->getRawOriginal('status');
        $status = $rawStatus !== null ? $rawStatus : $user->status;

        return $status === User::STATUS_ACTIVE
            || $status === 1
            || $status === true
            || $status === '1'
            || $status === 'active';
    }
}
