/**
 * Primary actions (buttons, links, active states, filter/export/create, pagination).
 * Soft teal (#0d9488) with white labels — comfortable system accent.
 * Values follow CSS variables so light/dark mode stay in sync.
 */
export const ADMIN_RED = "var(--admin-red)";
export const ADMIN_RED_HOVER = "var(--admin-red-hover)";
export const ADMIN_RED_ACTIVE = "var(--admin-red-hover)";

/**
 * Gradient for solid primary fills (buttons, drawer headers, active states).
 * Soft diagonal sheen keeps accents intentional without feeling harsh.
 */
export const ADMIN_RED_GRADIENT = "var(--admin-red-gradient)";

/**
 * Admin shell chrome (sidebar, header). Deep charcoal rather than a full-bleed
 * primary fill — primary color stays reserved for accents (active nav, buttons, icons).
 */
export const ADMIN_SURFACE_DARK = "#161616";
export const ADMIN_SURFACE_DARK_ELEVATED = "#212121";

/** Page background behind white content cards */
export const ADMIN_PAGE_BG = "var(--admin-page-bg)";

/** Subtle highlight on red (hover rings, accents) */
export const ADMIN_ACCENT_SOFT = "rgba(255, 255, 255, 0.18)";

/** Dashboard chart / KPI accents (red primary + warm amber secondary) */
export const ADMIN_DASHBOARD_PRIMARY = ADMIN_RED;
export const ADMIN_DASHBOARD_SECONDARY = "#d97706";
export const ADMIN_DASHBOARD_SUCCESS = "#15803d";
export const ADMIN_DASHBOARD_DANGER = "#dc2626";
export const ADMIN_DASHBOARD_INFO = "#2563eb";
export const ADMIN_DASHBOARD_MUTED = "var(--admin-chrome-text-muted)";
export const ADMIN_DASHBOARD_CARD_BORDER = "var(--admin-chrome-border)";
export const ADMIN_DASHBOARD_TRACK = "var(--admin-surface-muted)";

/**
 * Light "clean admin" shell chrome tokens (sidebar / navbar / page canvas).
 * Used by AppLayout, Sidebar, Navbar and the Administrative Dashboard to
 * match the white-shell + colored-accent-card visual style.
 */
export const ADMIN_CHROME_BG = "var(--admin-chrome-bg)";
export const ADMIN_CHROME_BORDER = "var(--admin-chrome-border)";
export const ADMIN_CHROME_TEXT = "var(--admin-chrome-text)";
export const ADMIN_CHROME_TEXT_MUTED = "var(--admin-chrome-text-muted)";
export const ADMIN_PAGE_BG_LIGHT = "var(--admin-page-bg)";
export const ADMIN_SURFACE = "var(--admin-surface)";
export const ADMIN_SURFACE_MUTED = "var(--admin-surface-muted)";
export const ADMIN_ROW_HOVER = "var(--admin-row-hover)";

/** Stat / chart card accent palette (top border + soft icon background + icon color) */
export const ADMIN_ACCENT_RED = { border: "var(--admin-red)", bg: "var(--admin-red-muted)", fg: "var(--admin-red)" };
export const ADMIN_ACCENT_BLUE = { border: "#2563eb", bg: "rgba(37, 99, 235, 0.1)", fg: "#2563eb" };
export const ADMIN_ACCENT_PURPLE = { border: "#7c3aed", bg: "rgba(124, 58, 237, 0.1)", fg: "#7c3aed" };
export const ADMIN_ACCENT_AMBER = { border: "#d97706", bg: "rgba(217, 119, 6, 0.1)", fg: "#d97706" };
