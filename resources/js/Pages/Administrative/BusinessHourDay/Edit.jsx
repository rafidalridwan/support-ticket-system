import { Head, useForm, usePage } from "@inertiajs/react";
import { Save } from "lucide-react";
import { useEffect } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker } from "../../../helpers/adminPermissions";
import { Button } from "@/components/ui/button";
import { ADMIN_CHROME_TEXT, ADMIN_CHROME_TEXT_MUTED } from "@/theme/adminColors";
import DaysEditor from "./DaysEditor";
import { normalizeDays } from "./daysHelper";

export default function Edit() {
    const title = "Business Hours";
    const { days = [], dayLabels = [], auth } = usePage().props;
    const hasPermission = createPermissionChecker(auth);
    const canEdit = hasPermission("business_hour_edit");

    const { data, setData, put, processing, errors, setDefaults, clearErrors } = useForm({
        days: normalizeDays(days),
    });

    useEffect(() => {
        const next = { days: normalizeDays(days) };
        setDefaults(next);
        setData(next);
        clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit) return;

        put(route("administrative.business-hour.update"), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout title={title}>
            <Head title={title} />

            <form onSubmit={handleSubmit} className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2
                            className="m-0 text-xl font-bold tracking-tight sm:text-2xl"
                            style={{ color: ADMIN_CHROME_TEXT }}
                        >
                            {title}
                        </h2>
                        <p className="mt-1 text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                            Set working days and hours used for SLA calculations
                        </p>
                    </div>
                    {canEdit && (
                        <Button type="submit" variant="brand" className="h-10 rounded-full px-5" loading={processing}>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    )}
                </div>

                <DaysEditor
                    days={data.days}
                    dayLabels={dayLabels}
                    errors={errors}
                    disabled={!canEdit}
                    onChange={(nextDays) => setData("days", nextDays)}
                />
            </form>
        </AppLayout>
    );
}
