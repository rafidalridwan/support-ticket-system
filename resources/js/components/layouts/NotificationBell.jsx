import { router, usePage } from "@inertiajs/react";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_CHROME_TEXT, ADMIN_CHROME_TEXT_MUTED } from "@/theme/adminColors";

function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function NotificationBell() {
    const { unreadNotificationsCount = 0 } = usePage().props;
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(unreadNotificationsCount);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUnreadCount(unreadNotificationsCount);
    }, [unreadNotificationsCount]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(route("administrative.notifications.index"));
            setItems(data.notifications || []);
            setUnreadCount(data.unread_count ?? 0);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const onOpenChange = (next) => {
        setOpen(next);
        if (next) loadNotifications();
    };

    const openNotification = async (item) => {
        if (!item.read_at) {
            try {
                const { data } = await axios.post(route("administrative.notifications.read", item.id));
                setUnreadCount(data.unread_count ?? Math.max(0, unreadCount - 1));
                setItems((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)),
                );
            } catch {
                // ignore
            }
        }

        if (item.url) {
            setOpen(false);
            router.visit(item.url);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post(route("administrative.notifications.read-all"));
            setUnreadCount(0);
            setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch {
            // ignore
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--admin-surface-muted)]"
                    style={{ color: ADMIN_CHROME_TEXT }}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 ? (
                        <span
                            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                            style={{ background: "var(--admin-red)" }}
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : null}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1.5rem)] p-0">
                <div className="flex items-center justify-between px-3 py-2.5">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-medium hover:underline"
                            style={{ color: "var(--admin-red)" }}
                        >
                            Mark all read
                        </button>
                    ) : null}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <p className="px-3 py-6 text-center text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                            Loading…
                        </p>
                    ) : items.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                            No notifications yet.
                        </p>
                    ) : (
                        items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    openNotification(item);
                                }}
                                className="cursor-pointer items-start gap-2 rounded-none border-b border-border/60 px-3 py-2.5 last:border-b-0"
                            >
                                <span
                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read_at ? "bg-transparent" : ""}`}
                                    style={item.read_at ? undefined : { background: "var(--admin-red)" }}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p
                                            className={`m-0 truncate text-sm ${item.read_at ? "font-medium" : "font-semibold"}`}
                                            style={{ color: ADMIN_CHROME_TEXT }}
                                        >
                                            {item.title}
                                        </p>
                                        <span className="shrink-0 text-[11px]" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                                            {timeAgo(item.created_at)}
                                        </span>
                                    </div>
                                    <p className="m-0 mt-0.5 line-clamp-2 text-xs" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                                        {item.message}
                                    </p>
                                    {item.ticket_number ? (
                                        <p className="m-0 mt-1 text-[11px] font-medium" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                                            {item.ticket_number}
                                        </p>
                                    ) : null}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
