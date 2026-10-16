import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Build browser URL for a stored media path (`public` disk or `uploads/` under public). */
export function storagePublicUrl(path) {
    if (path == null || path === "") return "";
    const s = String(path).trim().replace(/\\/g, "/");
    if (!s) return "";
    if (/^https?:\/\//i.test(s) || s.startsWith("blob:") || s.startsWith("data:")) {
        return s;
    }
    if (s.startsWith("/storage/") || s.startsWith("/uploads/")) return s;
    const noLead = s.replace(/^\/+/, "");
    if (noLead.startsWith("storage/")) return `/${noLead}`;
    if (noLead.startsWith("uploads/")) return `/${noLead}`;
    return `/storage/${noLead}`;
}

function isBrowserFile(value) {
    return typeof File !== "undefined" && value instanceof File;
}

/**
 * Minimal single-image upload control.
 * `value` may be a stored path string, a `File`, or null/empty.
 * `onChange` receives a `File` on new upload, or `null` when removed.
 */
export default function SingleImageUpload({ value = null, onChange, accept = "image/*" }) {
    const inputRef = useRef(null);
    const objectUrlRef = useRef("");
    const [previewUrl, setPreviewUrl] = useState("");

    const clearObjectUrl = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = "";
        }
    };

    const showFilePreview = (file) => {
        clearObjectUrl();
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreviewUrl(url);
    };

    useEffect(() => {
        if (!value) {
            clearObjectUrl();
            setPreviewUrl("");
            return;
        }

        if (isBrowserFile(value)) {
            showFilePreview(value);
            return;
        }

        if (typeof value === "string") {
            clearObjectUrl();
            setPreviewUrl(storagePublicUrl(value));
            return;
        }

        clearObjectUrl();
        setPreviewUrl("");
    }, [value]);

    useEffect(() => () => clearObjectUrl(), []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        showFilePreview(file);
        onChange?.(file);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        clearObjectUrl();
        setPreviewUrl("");
        onChange?.(null);
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
            />
            <div
                onClick={() => inputRef.current?.click()}
                className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-[var(--admin-surface-muted)] transition-colors hover:border-primary"
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs">Upload</span>
                    </div>
                )}
            </div>
        </div>
    );
}
