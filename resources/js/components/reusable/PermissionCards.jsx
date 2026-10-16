import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function PermissionGroupCard({ group, value, onToggle, lightHeader = false }) {
    return (
        <div className="overflow-hidden rounded-lg border border-primary/10 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div
                className="px-4 py-3 text-sm font-semibold"
                style={
                    lightHeader
                        ? {
                              background: "var(--admin-red-muted)",
                              color: "var(--admin-red)",
                          }
                        : {
                              background: "var(--admin-red-gradient)",
                              color: "#ffffff",
                          }
                }
            >
                {group.label}
            </div>
            <div className="flex flex-col gap-1 bg-[var(--admin-surface-muted)] p-4">
                {group.options.map((option) => (
                    <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                        <Checkbox
                            checked={value.some((v) => Number(v) === Number(option.value))}
                            onCheckedChange={() => onToggle(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

/**
 * Two independent columns so shorter cards pack tightly
 * (no row-gap under shorter groups like Permission Management).
 */
export default function PermissionCards({
    options,
    value = [],
    onChange,
    lightHeader = false,
}) {
    const left = (options || []).filter((_, index) => index % 2 === 0);
    const right = (options || []).filter((_, index) => index % 2 === 1);

    const handleToggle = (optionValue) => {
        const id = Number(optionValue);
        if (value.some((v) => Number(v) === id)) {
            onChange(value.filter((v) => Number(v) !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <div className="flex w-full items-start gap-4 max-md:flex-col">
            <div className="flex flex-1 flex-col gap-4">
                {left.map((group) => (
                    <PermissionGroupCard
                        key={group.label}
                        group={group}
                        value={value}
                        onToggle={handleToggle}
                        lightHeader={lightHeader}
                    />
                ))}
            </div>
            <div className="flex flex-1 flex-col gap-4">
                {right.map((group) => (
                    <PermissionGroupCard
                        key={group.label}
                        group={group}
                        value={value}
                        onToggle={handleToggle}
                        lightHeader={lightHeader}
                    />
                ))}
            </div>
        </div>
    );
}
