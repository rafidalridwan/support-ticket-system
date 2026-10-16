import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyText = "No results found",
    disabled = false,
    className,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selected = useMemo(
        () => options.find((option) => String(option.value) === String(value ?? "")),
        [options, value],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return options;
        return options.filter((option) => String(option.label || "").toLowerCase().includes(query));
    }, [options, search]);

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) setSearch("");
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "h-10 w-full justify-between px-3 font-normal shadow-sm hover:bg-background",
                        !selected && "text-muted-foreground",
                        className,
                    )}
                >
                    <span className="truncate">{selected?.label || placeholder}</span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9 border-0 bg-transparent pl-8 shadow-none focus-visible:ring-0"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="max-h-56 overflow-y-auto p-1">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
                    ) : (
                        filtered.map((option) => {
                            const isSelected = String(option.value) === String(value ?? "");
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
                                        isSelected && "bg-accent",
                                    )}
                                    onClick={() => {
                                        onChange?.(option.value);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <Check className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                                    <span className="truncate">{option.label}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
