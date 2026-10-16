import { usePage } from "@inertiajs/react";
import { storagePublicUrl } from "../reusable/SingleImageUpload";
import { ADMIN_CHROME_TEXT, ADMIN_CHROME_TEXT_MUTED } from "../../theme/adminColors";

const iconWrap = {
    borderRadius: 12,
    background: "var(--admin-red-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(16, 24, 40, 0.12)",
    overflow: "hidden",
};

function BrandMark({ name, logo }) {
    if (logo) {
        return (
            <img
                src={storagePublicUrl(logo)}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
        );
    }

    return (
        <span className="text-sm font-bold text-white">
            {(name || "P").trim().charAt(0).toUpperCase()}
        </span>
    );
}

const SidebarBrandLogo = ({ collapsed }) => {
    const { website } = usePage().props;
    const name = website?.website_name || "Support Ticket System";
    const logo = website?.logo;

    if (collapsed) {
        return (
            <div className="flex justify-center py-4">
                <div style={{ ...iconWrap, width: 40, height: 40, padding: logo ? 4 : 0 }}>
                    <BrandMark name={name} logo={logo} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-4">
            <div style={{ ...iconWrap, width: 40, height: 40, padding: logo ? 4 : 0 }}>
                <BrandMark name={name} logo={logo} />
            </div>
            <div className="min-w-0">
                <div
                    className="truncate text-sm font-semibold leading-tight"
                    style={{ color: ADMIN_CHROME_TEXT }}
                >
                    {name}
                </div>
                <div
                    className="truncate text-[11px] font-medium uppercase leading-tight"
                    style={{ color: ADMIN_CHROME_TEXT_MUTED, letterSpacing: "0.08em" }}
                >
                    Admin
                </div>
            </div>
        </div>
    );
};

export default SidebarBrandLogo;
