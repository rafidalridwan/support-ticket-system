import "../css/app.css";
import "../css/notifications.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createElement, Fragment } from "react";
import { createRoot } from "react-dom/client";
import FlashToasts from "./components/FlashToasts";
import { Toaster } from "./components/ui/sonner";
import { AdminI18nProvider } from "./contexts/AdminI18nContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const appName = import.meta.env.VITE_APP_NAME || "Support Ticket System";

/** Mirrors Inertia's default layout resolution, then wraps the page tree in AdminI18nProvider so useAdminT works in page components (not only inside AppLayout). */
function wrapPageWithAdminI18n({ Component, props, key }) {
    const page = createElement(Component, { key, ...props });
    let tree;
    if (typeof Component.layout === "function") {
        tree = Component.layout(page);
    } else if (Array.isArray(Component.layout)) {
        tree = Component.layout
            .concat(page)
            .reverse()
            .reduce((children, Layout) =>
                createElement(Layout, { children, ...props }),
            );
    } else {
        tree = page;
    }
    return createElement(
        ThemeProvider,
        null,
        createElement(
            AdminI18nProvider,
            null,
            createElement(
                Fragment,
                null,
                tree,
                createElement(FlashToasts),
                createElement(Toaster),
            ),
        ),
    );
}

createInertiaApp({
    title: (title) => `${title} - ${window.__websiteName || appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props}>{wrapPageWithAdminI18n}</App>);
    },
    progress: {
        color: "var(--admin-red)",
        delay: 250,
        includeCSS: true,
        showSpinner: false,
    },
});
