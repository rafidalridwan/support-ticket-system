import { Head, usePage } from "@inertiajs/react";
import AppLayout from "../../components/layouts/AppLayout";
import {
    ADMIN_CHROME_BORDER,
    ADMIN_CHROME_TEXT,
    ADMIN_CHROME_TEXT_MUTED,
} from "../../theme/adminColors";

export default function Dashboard() {
    const { auth } = usePage().props;
    const userName = auth?.user?.name || "Admin";

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div
                className="rounded-xl bg-[var(--admin-surface)] p-5 sm:p-7"
                style={{
                    border: `1px solid ${ADMIN_CHROME_BORDER}`,
                    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                }}
            >
                <h2
                    className="m-0 text-xl font-bold tracking-tight sm:text-2xl"
                    style={{ color: ADMIN_CHROME_TEXT }}
                >
                    Welcome, {userName}
                </h2>
                <p className="mt-2 text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                    Manage users, roles, and permissions from the menu.
                </p>
            </div>
        </AppLayout>
    );
}
