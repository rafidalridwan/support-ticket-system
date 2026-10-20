<?php

namespace App\Services;

use App\Models\BusinessHourDay;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BusinessHoursSlaCalculator
{
    private Collection $days;

    public function __construct()
    {
        $this->days = BusinessHourDay::query()
            ->get()
            ->keyBy('day_of_week');
    }

    public function startAt(Carbon $from): Carbon
    {
        $cursor = $from->copy();

        for ($i = 0; $i < config('sla.start_search_days'); $i++) {
            $day = $this->day($cursor->dayOfWeek);

            if (! $day || ! $day->is_working_day || ! $day->start_time || ! $day->end_time) {
                $cursor = $cursor->copy()->addDay()->startOfDay();
                continue;
            }

            $start = $this->atTime($cursor, $day->start_time);
            $end = $this->atTime($cursor, $day->end_time);

            if ($cursor->lt($start)) {
                return $start;
            }

            if ($cursor->lt($end)) {
                return $cursor;
            }

            $cursor = $cursor->copy()->addDay()->startOfDay();
        }

        return $from->copy();
    }

    public function addMinutes(Carbon $from, int $minutes): Carbon
    {
        if ($minutes <= 0) {
            return $from->copy();
        }

        $cursor = $this->startAt($from);
        $remaining = $minutes;

        for ($i = 0; $i < config('sla.max_search_days') && $remaining > 0; $i++) {
            $day = $this->day($cursor->dayOfWeek);

            if (! $day || ! $day->is_working_day || ! $day->start_time || ! $day->end_time) {
                $cursor = $cursor->copy()->addDay()->startOfDay();
                continue;
            }

            $start = $this->atTime($cursor, $day->start_time);
            $end = $this->atTime($cursor, $day->end_time);

            if ($cursor->lt($start)) {
                $cursor = $start;
            }

            if ($cursor->gte($end)) {
                $cursor = $cursor->copy()->addDay()->startOfDay();
                continue;
            }

            $available = $cursor->diffInMinutes($end);

            if ($remaining <= $available) {
                return $cursor->copy()->addMinutes($remaining);
            }

            $remaining -= $available;
            $cursor = $cursor->copy()->addDay()->startOfDay();
        }

        return $cursor;
    }

    private function day(int $dayOfWeek): ?BusinessHourDay
    {
        return $this->days->get($dayOfWeek);
    }

    private function atTime(Carbon $date, string $time): Carbon
    {
        [$hour, $minute] = array_map('intval', explode(':', substr($time, 0, 5)));

        return $date->copy()->setTime($hour, $minute, 0);
    }
}
