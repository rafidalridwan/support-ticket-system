import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function FormField({ label, required, error, hint, htmlFor, className, children }) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <Label htmlFor={htmlFor} className="text-foreground">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}
            {children}
            {error ? (
                <p className="text-xs font-medium text-red-500">{error}</p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}
