import { Toaster as Sonner } from "sonner";
import { useOptionalThemeMode } from "@/contexts/ThemeContext";

const Toaster = ({ ...props }) => {
    const theme = useOptionalThemeMode();
    const mode = theme?.mode || "light";

    return (
        <Sonner
            className="toaster group"
            position="top-right"
            richColors
            theme={mode}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
