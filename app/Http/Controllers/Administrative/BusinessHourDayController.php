<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBusinessHourDayRequest;
use App\Models\BusinessHourDay;
use Inertia\Inertia;

class BusinessHourDayController extends Controller
{
    public function edit()
    {
        $days = [];
        for ($i = 0; $i <= 7; $i++) {
            $day = BusinessHourDay::where('day_of_week', $i)->first();

            if (!$day) {
                continue;
            }

            $days[] = [
                'day_of_week' => $i,
                'is_working_day' => (bool) $day->is_working_day,
                'start_time' => $day->start_time ? substr((string) $day->start_time, 0, 5) : '',
                'end_time' => $day->end_time ? substr((string) $day->end_time, 0, 5) : '',
            ];
        }
        return Inertia::render('Administrative/BusinessHourDay/Edit', [
            'days' => $days,
            'dayLabels' => $this->dayLabels(),
        ]);
    }

    public function update(UpdateBusinessHourDayRequest $request)
    {
        foreach ($request->validated('days') as $day) {
            $isWorking = (bool) $day['is_working_day'];

            BusinessHourDay::updateOrCreate(
                ['day_of_week' => $day['day_of_week']],
                [
                    'is_working_day' => $isWorking,
                    'start_time' => $isWorking ? $day['start_time'] : null,
                    'end_time' => $isWorking ? $day['end_time'] : null,
                ]
            );
        }

        return redirect()
            ->route('administrative.business-hour.edit')
            ->with('success', 'Business hours updated successfully.');
    }

    private function dayLabels(): array
    {
        return [
            ['value' => 0, 'label' => 'Sunday'],
            ['value' => 1, 'label' => 'Monday'],
            ['value' => 2, 'label' => 'Tuesday'],
            ['value' => 3, 'label' => 'Wednesday'],
            ['value' => 4, 'label' => 'Thursday'],
            ['value' => 5, 'label' => 'Friday'],
            ['value' => 6, 'label' => 'Saturday'],
        ];
    }
}
