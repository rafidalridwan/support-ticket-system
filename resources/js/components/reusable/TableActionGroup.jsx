import { cn } from "@/lib/utils";

export default function TableActionGroup({ className, children }) {
    return (
        <div
            className={cn(
                "inline-flex items-stretch divide-x divide-[#e6e8ee] overflow-hidden rounded-lg border border-[#e6e8ee] bg-white shadow-sm",
                "[&_button]:h-8 [&_button]:w-8 [&_button]:rounded-none [&_button]:border-0 [&_button]:shadow-none",
                className,
            )}
        >
            {children}
        </div>
    );
}
