import ThemeToggle from "@/components/reusable/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { router, usePage } from "@inertiajs/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAdminT } from "../../contexts/AdminI18nContext";
import { ADMIN_CHROME_BORDER, ADMIN_CHROME_TEXT, ADMIN_CHROME_TEXT_MUTED } from "../../theme/adminColors";
import ConfirmDialog from "../reusable/ConfirmDialog";
import NotificationBell from "./NotificationBell";

const MenuButton = ({ onClick }) => {
    return (
        <button
            type="button"
            aria-label="Toggle menu"
            className="navbar-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors"
            onClick={onClick}
            style={{ color: ADMIN_CHROME_TEXT }}
        >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="24" height="3" rx="1.5" fill="currentColor" />
                <rect x="4" y="14.5" width="24" height="3" rx="1.5" fill="currentColor" />
                <rect x="4" y="21" width="24" height="3" rx="1.5" fill="currentColor" />
            </svg>
        </button>
    );
};

const Navbar = ({ title, onToggle }) => {
    const { t } = useAdminT();
    const { auth } = usePage().props;
    const [logoutOpen, setLogoutOpen] = useState(false);

    const userName = auth?.user?.name || "";
    const initials = userName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <>
            <header
                className="mx-2 mt-2 flex h-14 min-w-0 shrink-0 items-center rounded-xl px-2 sm:mx-4 sm:mt-4 sm:h-16 sm:px-4"
                style={{
                    backgroundColor: "var(--admin-chrome-bg)",
                    border: `1px solid ${ADMIN_CHROME_BORDER}`,
                    boxShadow: "var(--admin-shadow)",
                }}
            >
                <div className="flex w-full min-w-0 items-center gap-2 sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <MenuButton onClick={onToggle} />
                        {title ? (
                            <p
                                className="min-w-0 truncate text-sm font-semibold sm:text-base"
                                style={{ color: ADMIN_CHROME_TEXT }}
                            >
                                {title}
                            </p>
                        ) : null}
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <ThemeToggle />
                        <NotificationBell />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-[var(--admin-surface-muted)]"
                                >
                                    <Avatar className="h-9 w-9 rounded-lg">
                                        <AvatarFallback
                                            className="rounded-lg font-semibold text-white"
                                            style={{ background: "var(--admin-red-gradient)" }}
                                        >
                                            {initials || <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden text-left sm:block">
                                        <div
                                            className="text-sm font-semibold leading-tight"
                                            style={{ color: ADMIN_CHROME_TEXT }}
                                        >
                                            {userName}
                                        </div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0" style={{ color: ADMIN_CHROME_TEXT_MUTED }} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-1.5rem)]">
                                <DropdownMenuItem
                                    onClick={() => setLogoutOpen(true)}
                                    className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/40"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {t("navbar.logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <ConfirmDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
                title={t("navbar.logoutConfirmTitle")}
                description={t("navbar.logoutConfirmContent")}
                confirmText={t("navbar.yesLogout")}
                cancelText={t("navbar.cancel")}
                onConfirm={() => router.visit(route("administrative.logout"))}
            />

            <style>{`
                .navbar-toggle:hover {
                    background-color: var(--admin-surface-muted);
                }
            `}</style>
        </>
    );
};

export default Navbar;
