import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
    RiHomeOfficeLine,
    RiKey2Line,
    RiListCheck,
    RiSettings3Line,
    RiShieldUserLine,
    RiTimeLine,
    RiTicket2Line,
    RiTimerFlashLine,
    RiUser3Line,
} from "react-icons/ri";
import { route } from "ziggy-js";
import { cn } from "@/lib/utils";
import {
    createPermissionChecker,
    isAdministrator,
} from "../../helpers/adminPermissions";

function NavLink({ href, icon: Icon, label, active, collapsed, onNavigate }) {
    return (
        <Link
            preserveScroll
            href={href}
            title={collapsed ? label : undefined}
            onClick={onNavigate}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center",
                active
                    ? "text-white shadow-sm"
                    : "text-[var(--admin-chrome-text-muted)] hover:bg-[var(--admin-surface-muted)] hover:text-[var(--admin-chrome-text)]",
            )}
            style={active ? { background: "var(--admin-red-gradient)" } : undefined}
        >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

function NavGroup({
    icon: Icon,
    label,
    open,
    onToggle,
    active,
    collapsed,
    children,
}) {
    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                title={collapsed ? label : undefined}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center",
                    active
                        ? "text-[var(--admin-chrome-text)]"
                        : "text-[var(--admin-chrome-text-muted)] hover:bg-[var(--admin-surface-muted)] hover:text-[var(--admin-chrome-text)]",
                )}
            >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && (
                    <>
                        <span className="flex-1 truncate text-left">{label}</span>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 shrink-0 transition-transform",
                                open && "rotate-180",
                            )}
                        />
                    </>
                )}
            </button>

            {open && !collapsed && (
                <div
                    className="mt-1 flex flex-col gap-1 rounded-lg py-1 pl-4"
                    style={{ background: "var(--admin-row-hover)" }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

const Sidebar = ({ collapsed = false, onNavigate }) => {
    const {
        url,
        props: { auth },
    } = usePage();
    const hasPermission = createPermissionChecker(auth);
    const systemAdmin = isAdministrator(auth);

    let selectedKey = "dashboard";
    if (url.includes("/user")) selectedKey = "users";
    else if (url.includes("/role")) selectedKey = "roles";
    else if (url.includes("/permission")) selectedKey = "permissions";
    else if (url.includes("/sla-policy")) selectedKey = "sla-policies";
    else if (url.includes("/business-hour")) selectedKey = "business-hours";
    else if (url.includes("/ticket-status")) selectedKey = "ticket-statuses";
    else if (url.includes("/ticket-category")) selectedKey = "ticket-categories";
    else if (url.includes("/ticket")) selectedKey = "tickets";

    const isSettingsKey = [
        "users",
        "roles",
        "permissions",
        "sla-policies",
        "business-hours",
        "ticket-statuses",
        "ticket-categories",
        "tickets",
    ].includes(selectedKey);
    const [settingsOpen, setSettingsOpen] = useState(isSettingsKey);

    useEffect(() => {
        if (isSettingsKey) setSettingsOpen(true);
    }, [isSettingsKey]);

    const showSettings =
        systemAdmin ||
        hasPermission("setting_menu") ||
        hasPermission("user_list") ||
        hasPermission("role_list") ||
        hasPermission("permission_list") ||
        hasPermission("sla_policy_list") ||
        hasPermission("business_hour_list") ||
        hasPermission("business_hour_edit") ||
        hasPermission("ticket_status_list") ||
        hasPermission("ticket_category_list") ||
        hasPermission("ticket_list");

    return (
        <nav className="flex flex-col gap-1 px-2 py-2">
            <NavLink
                href={route("administrative.dashboard")}
                icon={RiHomeOfficeLine}
                label="Dashboard"
                active={selectedKey === "dashboard"}
                collapsed={collapsed}
                onNavigate={onNavigate}
            />

            {(systemAdmin || hasPermission("ticket_list")) && (
                <NavLink
                    href={route("administrative.ticket.index")}
                    icon={RiTicket2Line}
                    label="Tickets"
                    active={selectedKey === "tickets"}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            )}

            {showSettings && (
                <NavGroup
                    icon={RiSettings3Line}
                    label="Settings"
                    open={settingsOpen}
                    onToggle={() => setSettingsOpen((v) => !v)}
                    active={isSettingsKey}
                    collapsed={collapsed}
                >
                    {(systemAdmin || hasPermission("user_list") || hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.user.index")}
                            icon={RiUser3Line}
                            label="Users"
                            active={selectedKey === "users"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin || hasPermission("role_list") || hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.role.index")}
                            icon={RiShieldUserLine}
                            label="Roles"
                            active={selectedKey === "roles"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin ||
                        hasPermission("permission_list") ||
                        hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.permission.index")}
                            icon={RiKey2Line}
                            label="Permissions"
                            active={selectedKey === "permissions"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin ||
                        hasPermission("sla_policy_list") ||
                        hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.sla-policy.index")}
                            icon={RiTimerFlashLine}
                            label="SLA Policies"
                            active={selectedKey === "sla-policies"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin ||
                        hasPermission("business_hour_list") ||
                        hasPermission("business_hour_edit") ||
                        hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.business-hour.edit")}
                            icon={RiTimeLine}
                            label="Business Hours"
                            active={selectedKey === "business-hours"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin ||
                        hasPermission("ticket_status_list") ||
                        hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.ticket-status.index")}
                            icon={RiListCheck}
                            label="Ticket Statuses"
                            active={selectedKey === "ticket-statuses"}
                            onNavigate={onNavigate}
                        />
                    )}
                    {(systemAdmin ||
                        hasPermission("ticket_category_list") ||
                        hasPermission("setting_menu")) && (
                        <NavLink
                            href={route("administrative.ticket-category.index")}
                            icon={RiListCheck}
                            label="Ticket Categories"
                            active={selectedKey === "ticket-categories"}
                            onNavigate={onNavigate}
                        />
                    )}
                </NavGroup>
            )}
        </nav>
    );
};

export default Sidebar;
