import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/reusable/FormField";
import { useAdminT } from "@/contexts/AdminI18nContext";

const emptyFilters = {
    role_id: null,
    status: null,
    registration_date_from: null,
    registration_date_to: null,
};

export default function FilterDialog({
    open,
    onOpenChange,
    onApply,
    onReset,
    roles = [],
    initialFilters = {},
}) {
    const { t } = useAdminT();
    const [form, setForm] = useState({ ...emptyFilters, ...initialFilters });

    useEffect(() => {
        if (open) setForm({ ...emptyFilters, ...initialFilters });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="lg">
                <DialogHeader>
                    <DialogTitle>{t("user.filterTitle")}</DialogTitle>
                    <DialogDescription>{t("user.filterSubtitle")}</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label={t("user.filterRole")}>
                            <Select
                                value={form.role_id ? String(form.role_id) : undefined}
                                onValueChange={(v) => set("role_id", Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("user.filterRolePh")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={String(role.value)}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t("user.filterStatus")}>
                            <Select
                                value={form.status !== null && form.status !== undefined ? String(form.status) : undefined}
                                onValueChange={(v) => set("status", Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("user.filterStatusPh")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">{t("common.active")}</SelectItem>
                                    <SelectItem value="0">{t("common.inactive")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="md:col-span-2">
                            <p className="mb-1 text-sm font-medium text-foreground">
                                {t("user.registrationDateSection")}
                            </p>
                        </div>
                        <FormField label={t("user.filterFrom")}>
                            <Input
                                type="date"
                                value={form.registration_date_from || ""}
                                onChange={(e) => set("registration_date_from", e.target.value || null)}
                            />
                        </FormField>
                        <FormField label={t("user.filterTo")}>
                            <Input
                                type="date"
                                value={form.registration_date_to || ""}
                                onChange={(e) => set("registration_date_to", e.target.value || null)}
                            />
                        </FormField>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="outlineBrand"
                        onClick={() => {
                            setForm(emptyFilters);
                            onReset?.();
                        }}
                    >
                        <RotateCcw className="h-4 w-4" />
                        {t("common.reset")}
                    </Button>
                    <Button variant="brand" onClick={() => onApply(form)}>
                        {t("user.filterApply")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
