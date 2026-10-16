import { usePage } from "@inertiajs/react";
import { useAdminT } from "../../contexts/AdminI18nContext";

const AppFooter = () => {
    const { t } = useAdminT();
    const { website } = usePage().props;
    const name = website?.website_name || window.__websiteName || "Support Ticket System";

    return (
        <footer
            className="shrink-0 text-center"
            style={{
                padding: "12px 16px",
                background: "var(--admin-footer-bg)",
                borderTop: "1px solid var(--admin-chrome-border)",
                fontSize: "12px",
                color: "var(--admin-chrome-text-muted)",
            }}
        >
            <span>
                {t("footer.copyright", {
                    year: new Date().getFullYear(),
                    name,
                })}
            </span>
        </footer>
    );
};

export default AppFooter;
