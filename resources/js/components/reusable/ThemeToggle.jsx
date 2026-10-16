import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useAdminT } from "@/contexts/AdminI18nContext";

export default function ThemeToggle({ className }) {
    const { isDark, toggleMode } = useThemeMode();
    const { t } = useAdminT();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className ?? "h-10 w-10 rounded-full text-foreground hover:bg-[var(--admin-surface-muted)]"}
            onClick={toggleMode}
            title={isDark ? t("navbar.lightMode") : t("navbar.darkMode")}
            aria-label={isDark ? t("navbar.lightMode") : t("navbar.darkMode")}
        >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>
    );
}
