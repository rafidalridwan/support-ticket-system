import FormField from "@/components/reusable/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function DaysEditor({ days, dayLabels = [], errors = {}, onChange, disabled = false }) {
    const labelFor = (dayOfWeek) =>
        dayLabels.find((d) => Number(d.value) === Number(dayOfWeek))?.label || `Day ${dayOfWeek}`;

    const updateDay = (index, patch) => {
        if (disabled) return;
        const next = days.map((day, i) => (i === index ? { ...day, ...patch } : day));
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {days.map((day, index) => (
                <div
                    key={day.day_of_week}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 md:grid-cols-4"
                >
                    <div className="flex items-center gap-2 md:col-span-1">
                        <Checkbox
                            checked={Boolean(day.is_working_day)}
                            disabled={disabled}
                            onCheckedChange={(checked) =>
                                updateDay(index, {
                                    is_working_day: Boolean(checked),
                                    start_time: checked ? day.start_time || "09:00" : "",
                                    end_time: checked ? day.end_time || "18:00" : "",
                                })
                            }
                        />
                        <span className="text-sm font-medium">{labelFor(day.day_of_week)}</span>
                    </div>

                    <FormField
                        label="Start"
                        error={errors[`days.${index}.start_time`]}
                        className="md:col-span-1"
                    >
                        <Input
                            type="time"
                            disabled={disabled || !day.is_working_day}
                            value={day.start_time || ""}
                            onChange={(e) => updateDay(index, { start_time: e.target.value })}
                        />
                    </FormField>

                    <FormField
                        label="End"
                        error={errors[`days.${index}.end_time`]}
                        className="md:col-span-1"
                    >
                        <Input
                            type="time"
                            disabled={disabled || !day.is_working_day}
                            value={day.end_time || ""}
                            onChange={(e) => updateDay(index, { end_time: e.target.value })}
                        />
                    </FormField>

                    <div className="flex items-end text-xs text-muted-foreground md:col-span-1">
                        {day.is_working_day ? "Working day" : "Non-working day"}
                    </div>
                </div>
            ))}
            {errors.days && <p className="text-sm text-red-500">{errors.days}</p>}
        </div>
    );
}
