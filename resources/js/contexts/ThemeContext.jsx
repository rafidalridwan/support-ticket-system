import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pera-color-mode";
const ThemeContext = createContext(null);

function getPreferredMode() {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "light";
}

export function applyColorMode(mode) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const isDark = mode === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    root.dataset.theme = mode;
}

export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(() => getPreferredMode());

    useEffect(() => {
        applyColorMode(mode);
        window.localStorage.setItem(STORAGE_KEY, mode);
        // Re-apply website brand tokens against the new light/dark palette.
        window.dispatchEvent(new CustomEvent("pera:color-mode-changed", { detail: { mode } }));
    }, [mode]);

    const setMode = useCallback((next) => {
        setModeState(next === "dark" ? "dark" : "light");
    }, []);

    const toggleMode = useCallback(() => {
        setModeState((current) => (current === "dark" ? "light" : "dark"));
    }, []);

    const value = useMemo(
        () => ({
            mode,
            isDark: mode === "dark",
            setMode,
            toggleMode,
        }),
        [mode, setMode, toggleMode],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useThemeMode must be used within ThemeProvider");
    }
    return ctx;
}

/** Safe variant for shared shells that may render outside ThemeProvider. */
export function useOptionalThemeMode() {
    return useContext(ThemeContext);
}
