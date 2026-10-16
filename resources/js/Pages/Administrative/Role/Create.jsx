import { useForm, usePage } from "@inertiajs/react";
import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import FormField from "@/components/reusable/FormField";
import PermissionCards from "@/components/reusable/PermissionCards";
import { useAdminT } from "@/contexts/AdminI18nContext";

export default function Create() {
    const { t } = useAdminT();
    const title = "Create Role";
    const [open, setOpen] = useState(false);
    const { permission } = usePage().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: "",
        label: "",
        permissions: [],
    });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = () => {
        post(route("administrative.role.store"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const options = Array.isArray(permission) ? permission : [];
    const allPermissionValues = options.flatMap((group) =>
        group?.options ? group.options.map((opt) => Number(opt.value)) : [],
    );
    const isAllSelected =
        allPermissionValues.length > 0 &&
        allPermissionValues.every((v) => data.permissions.some((p) => Number(p) === v));

    const handleSelectAll = (checked) => setData("permissions", checked ? allPermissionValues : []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="brand" className="h-10 rounded-full px-5">
                    <Plus className="h-4 w-4" />
                    New Role
                </Button>
            </DialogTrigger>
            <DialogContent side="right" size="xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Name the role and choose the permissions it can use.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    {(errors?.name || errors?.permissions) && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>Please fix the errors below.</AlertDescription>
                        </Alert>
                    )}

                    <FormField label="Role name" required error={errors?.name} className="mb-4 max-w-md">
                        <Input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. editor"
                        />
                    </FormField>

                    <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                        Select all permissions
                    </label>

                    <PermissionCards
                        options={options}
                        value={data.permissions}
                        onChange={(v) => setData("permissions", v)}
                        lightHeader
                    />
                    {errors?.permissions && <p className="mt-2 text-sm text-red-500">{errors.permissions}</p>}
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button variant="brand" loading={processing} onClick={handleSubmit}>
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
