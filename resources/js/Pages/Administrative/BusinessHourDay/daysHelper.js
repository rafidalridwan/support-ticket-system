// Docs default: Sunday–Thursday, 09:00–18:00
export const defaultDays = () =>
    [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
        const isWorking = dayOfWeek >= 0 && dayOfWeek <= 4;
        return {
            day_of_week: dayOfWeek,
            is_working_day: isWorking,
            start_time: isWorking ? "09:00" : "",
            end_time: isWorking ? "18:00" : "",
        };
    });

export const normalizeDays = (days = []) => {
    const byWeek = Object.fromEntries((days || []).map((d) => [d.day_of_week, d]));

    return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
        const day = byWeek[dayOfWeek];
        return {
            day_of_week: dayOfWeek,
            is_working_day: Boolean(day?.is_working_day),
            start_time: day?.start_time || "",
            end_time: day?.end_time || "",
        };
    });
};
