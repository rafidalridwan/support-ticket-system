import { Head, Link, usePage } from "@inertiajs/react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FolderOpen,
    ShieldAlert,
    UserX,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import AppLayout from "../../components/layouts/AppLayout";
import { formatAdminInteger } from "../../helpers/adminNumberFormat";
import {
    ADMIN_ACCENT_AMBER,
    ADMIN_ACCENT_BLUE,
    ADMIN_ACCENT_PURPLE,
    ADMIN_ACCENT_RED,
    ADMIN_CHROME_BORDER,
    ADMIN_CHROME_TEXT,
    ADMIN_CHROME_TEXT_MUTED,
    ADMIN_DASHBOARD_DANGER,
    ADMIN_DASHBOARD_INFO,
    ADMIN_DASHBOARD_PRIMARY,
    ADMIN_DASHBOARD_SECONDARY,
    ADMIN_DASHBOARD_SUCCESS,
    ADMIN_SURFACE_MUTED,
} from "../../theme/adminColors";

const PRIORITY_COLORS = {
    1: ADMIN_DASHBOARD_INFO,
    2: ADMIN_DASHBOARD_SECONDARY,
    3: ADMIN_DASHBOARD_DANGER,
    4: ADMIN_DASHBOARD_PRIMARY,
};

function StatCard({ label, value, icon: Icon, accent, href }) {
    const content = (
        <div
            className="rounded-xl bg-[var(--admin-surface)] p-4 transition hover:opacity-95"
            style={{
                border: `1px solid ${ADMIN_CHROME_BORDER}`,
                borderTop: `3px solid ${accent.border}`,
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="m-0 text-xs font-medium uppercase tracking-wide" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: ADMIN_CHROME_TEXT }}>
                        {value}
                    </p>
                </div>
                <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: accent.bg, color: accent.fg }}
                >
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </div>
    );

    if (!href) return content;

    return (
        <Link href={href} className="block no-underline">
            {content}
        </Link>
    );
}

function ChartCard({ title, children, empty }) {
    return (
        <div
            className="rounded-xl bg-[var(--admin-surface)] p-5"
            style={{
                border: `1px solid ${ADMIN_CHROME_BORDER}`,
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
            }}
        >
            <h3 className="m-0 mb-4 text-base font-semibold" style={{ color: ADMIN_CHROME_TEXT }}>
                {title}
            </h3>
            {empty ? (
                <p className="m-0 py-10 text-center text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                    No open tickets to chart.
                </p>
            ) : (
                <div className="h-64 w-full">{children}</div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { auth, stats = {}, byPriority = [], byAgent = [], resolvedStatusId, isStaff } = usePage().props;
    const userName = auth?.user?.name || "Admin";
    const locale = auth?.locale || "en";
    const n = (value) => formatAdminInteger(value ?? 0, locale);

    const ticketsIndex = (params = {}) => {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
        ).toString();
        const base = route("administrative.ticket.index");
        return query ? `${base}?${query}` : base;
    };

    const kpiCards = [
        {
            key: "open",
            label: "Total open tickets",
            value: n(stats.open),
            icon: FolderOpen,
            accent: ADMIN_ACCENT_BLUE,
            href: ticketsIndex(),
        },
        {
            key: "unassigned",
            label: "Unassigned tickets",
            value: n(stats.unassigned),
            icon: UserX,
            accent: ADMIN_ACCENT_AMBER,
            href: ticketsIndex({ assigned_to: "unassigned" }),
        },
        {
            key: "critical",
            label: "Critical tickets",
            value: n(stats.critical),
            icon: ShieldAlert,
            accent: ADMIN_ACCENT_RED,
            href: ticketsIndex({ priority: 4 }),
        },
        {
            key: "sla_breached",
            label: "SLA breached",
            value: n(stats.sla_breached),
            icon: AlertTriangle,
            accent: ADMIN_ACCENT_RED,
            href: ticketsIndex({ sla_status: "sla_breached" }),
        },
        {
            key: "approaching_sla",
            label: "Approaching SLA breach",
            value: n(stats.approaching_sla),
            icon: Clock,
            accent: ADMIN_ACCENT_AMBER,
            href: ticketsIndex({ sla_status: "approaching_sla_breach" }),
        },
        {
            key: "resolved",
            label: "Resolved tickets",
            value: n(stats.resolved),
            icon: CheckCircle2,
            accent: ADMIN_ACCENT_PURPLE,
            href: ticketsIndex(resolvedStatusId ? { status_id: resolvedStatusId } : {}),
        },
    ];

    const priorityTotal = byPriority.reduce((sum, row) => sum + Number(row.count || 0), 0);
    const agentTotal = byAgent.reduce((sum, row) => sum + Number(row.count || 0), 0);

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-5">
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
                    {isStaff && (
                    <p className="mt-2 text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                        Ticket overview — open work, SLA risk, and agent load at a glance.
                    </p>
                    )}
                </div>

                {isStaff && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {kpiCards.map((card) => (
                        <StatCard key={card.key} {...card} />
                    ))}
                </div>
                )}

                {isStaff && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartCard title="Tickets by priority" empty={priorityTotal === 0}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byPriority} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={ADMIN_SURFACE_MUTED} vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: ADMIN_CHROME_TEXT_MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fill: ADMIN_CHROME_TEXT_MUTED, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip
                                    cursor={{ fill: "rgba(16, 24, 40, 0.04)" }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: `1px solid ${ADMIN_CHROME_BORDER}`,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                    {byPriority.map((row) => (
                                        <Cell key={row.priority} fill={PRIORITY_COLORS[row.priority] || ADMIN_DASHBOARD_PRIMARY} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Tickets by agent (top 10)" empty={agentTotal === 0}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={byAgent} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={ADMIN_SURFACE_MUTED} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    label={{
                                        value: "Agent name",
                                        position: "insideBottom",
                                        offset: -2,
                                        fill: ADMIN_CHROME_TEXT_MUTED,
                                        fontSize: 12,
                                    }}
                                    tick={{ fill: ADMIN_CHROME_TEXT_MUTED, fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    height={56}
                                />
                                <YAxis
                                    dataKey="count"
                                    allowDecimals={false}
                                    label={{
                                        value: "Count",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 8,
                                        fill: ADMIN_CHROME_TEXT_MUTED,
                                        fontSize: 12,
                                    }}
                                    tick={{ fill: ADMIN_CHROME_TEXT_MUTED, fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={48}
                                />
                                <Tooltip
                                    formatter={(value) => [value, "Count"]}
                                    labelFormatter={(name) => `Agent: ${name}`}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: `1px solid ${ADMIN_CHROME_BORDER}`,
                                        fontSize: 12,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Count"
                                    stroke={ADMIN_DASHBOARD_INFO}
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: ADMIN_DASHBOARD_INFO, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                )}
            </div>
        </AppLayout>
    );
}
