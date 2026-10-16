import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ADMIN_CHROME_TEXT_MUTED, ADMIN_RED } from "@/theme/adminColors";

export function SortableTableHead({
    label,
    column,
    sortKey,
    sortDir,
    onSort,
    className = "",
    align = "left",
}) {
    const active = sortKey === column;
    const nextDir = active && sortDir === "asc" ? "desc" : "asc";

    return (
        <TableHead
            className={cn(
                "h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]",
                align === "center" && "text-center",
                className,
            )}
            style={{ color: ADMIN_CHROME_TEXT_MUTED }}
        >
            <button
                type="button"
                className={cn(
                    "inline-flex items-center gap-1 transition-colors hover:text-[var(--admin-chrome-text)]",
                    align === "center" && "justify-center",
                    active && "text-[var(--admin-chrome-text)]",
                )}
                onClick={() => onSort(column, nextDir)}
            >
                <span>{label}</span>
                {active ? (
                    sortDir === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" style={{ color: ADMIN_RED }} />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" style={{ color: ADMIN_RED }} />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-45" />
                )}
            </button>
        </TableHead>
    );
}

export function compareSortValues(a, b, dir = "asc") {
    const left = a ?? "";
    const right = b ?? "";
    let result = 0;

    if (typeof left === "number" && typeof right === "number") {
        result = left - right;
    } else if (typeof left === "boolean" && typeof right === "boolean") {
        result = Number(left) - Number(right);
    } else {
        result = String(left).localeCompare(String(right), undefined, { sensitivity: "base", numeric: true });
    }

    return dir === "desc" ? -result : result;
}
