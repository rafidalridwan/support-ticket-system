import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Builds a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function buildPageList(current, total) {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    range.forEach((i) => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push("...");
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
}

export function DataPagination({
    currentPage,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [25, 50, 100],
    className,
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);
    const pages = buildPageList(currentPage, totalPages);

    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-3 border-t bg-white px-1 py-4",
                className,
            )}
        >
            <p className="text-sm text-muted-foreground">
                {total === 0 ? "No records" : `Showing ${start}–${end} of ${total}`}
            </p>
            <div className="flex max-w-full flex-wrap items-center justify-end gap-3 sm:gap-4">
                {onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="h-9 w-[4.75rem] px-3 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top" className="z-[80]">
                                {pageSizeOptions.map((opt) => (
                                    <SelectItem key={opt} value={String(opt)}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pages.map((p, idx) =>
                        p === "..." ? (
                            <span
                                key={`dots-${idx}`}
                                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </span>
                        ) : (
                            <Button
                                key={p}
                                size="icon"
                                variant={p === currentPage ? "brand" : "outline"}
                                className="h-8 w-8"
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </Button>
                        ),
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
