import { useAdminT } from "@/contexts/AdminI18nContext";
import { usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows session flash once per visit. Kept at the app root so page changes
 * do not remount the toaster or replay the same flash.
 */
export default function FlashToasts() {
    const { flash } = usePage().props;
    const { t } = useAdminT();
    const seenRef = useRef(new Set());

    useEffect(() => {
        const resolve = (value) => {
            if (value == null || typeof value !== "string") return value;
            return t(value);
        };

        const show = (type, value) => {
            if (!value) return;

            const key = `${type}:${value}`;
            if (seenRef.current.has(key)) return;

            seenRef.current.add(key);

            const text = resolve(value);
            if (type === "success") toast.success(text);
            else if (type === "error") toast.error(text);
            else if (type === "info") toast.info(text);
            else if (type === "warning") toast.warning(text);

            window.setTimeout(() => {
                seenRef.current.delete(key);
            }, 8000);
        };

        show("success", flash?.success);
        show("error", flash?.error);
        show("info", flash?.info);
        show("warning", flash?.warning);
    }, [flash?.success, flash?.error, flash?.info, flash?.warning, t]);

    return null;
}
