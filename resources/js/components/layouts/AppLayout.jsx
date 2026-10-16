import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AdminShell from "./AdminShell";
import AppFooter from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarBrandLogo from "./SidebarBrandLogo";
import { ADMIN_CHROME_BG, ADMIN_CHROME_BORDER, ADMIN_PAGE_BG_LIGHT, ADMIN_SURFACE } from "../../theme/adminColors";

const AppLayout = ({ title, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMenu = () => {
        if (window.innerWidth < 768) {
            setMobileOpen((open) => !open);
            return;
        }
        setCollapsed((value) => !value);
    };

    return (
        <AdminShell>
            <div
                className="flex h-screen max-h-screen overflow-hidden"
                style={{ backgroundColor: ADMIN_PAGE_BG_LIGHT }}
            >
                {/* Sidebar */}
                {mobileOpen && (
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-20 bg-black/40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                <aside
                    className={cn(
                        "z-30 flex h-full shrink-0 flex-col overflow-hidden transition-transform duration-200 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(280px,88vw)] max-md:shadow-2xl md:sticky md:left-0 md:top-0",
                        collapsed ? "md:w-[60px]" : "md:w-[280px]",
                        mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
                    )}
                    style={{
                        backgroundColor: ADMIN_CHROME_BG,
                        borderRight: `1px solid ${ADMIN_CHROME_BORDER}`,
                    }}
                >
                    <div className="shrink-0 border-b" style={{ borderColor: ADMIN_CHROME_BORDER }}>
                        <SidebarBrandLogo collapsed={!mobileOpen && collapsed} />
                    </div>
                    <div className="theme-scroll min-h-0 flex-1 overflow-y-auto">
                        <Sidebar
                            collapsed={!mobileOpen && collapsed}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                </aside>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <Navbar title={title} onToggle={toggleMenu} />

                    <motion.div
                        className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <main
                            className="theme-scroll mx-2 mb-2 mt-2 box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-auto rounded-xl p-3 shadow-lg sm:mx-4 sm:mb-4 sm:p-5"
                            style={{
                                backgroundColor: ADMIN_SURFACE,
                                boxShadow: "var(--admin-shadow)",
                            }}
                        >
                            {children}
                        </main>
                    </motion.div>

                    <AppFooter />
                </div>
            </div>
        </AdminShell>
    );
};

export default AppLayout;
