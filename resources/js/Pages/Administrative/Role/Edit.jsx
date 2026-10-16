import { useForm, usePage } from "@inertiajs/react";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function Edit({ role }) {
    const title = "Edit Role";
    const [open, setOpen] = useState(false);
    const { permission } = usePage().props;

    const rolePermissions = role.permissions ? role.permissions.map((p) => p.id) : [];

    const { data, setData, put, processing, errors, reset } = useForm({
        name: role.name ?? "",
        label: role.label ?? role.name ?? "",
        permissions: rolePermissions.map(Number),
    });

    useEffect(() => {
        if (!open) reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = () => {
        put(route("administrative.role.update", role.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const filteredPermissions = permission
        ? permission.filter((group) => {
              const label = (group.label?.toLowerCase() || "").trim();
              return label !== "marital status management" && label !== "gender management";
          })
        : [];

    const groupedPermissions = filteredPermissions.reduce((acc, group) => {
        if (!acc[group.label]) acc[group.label] = { label: group.label, options: [] };
        if (Array.isArray(group.options)) acc[group.label].options.push(...group.options);
        return acc;
    }, {});

    const options = Object.values(groupedPermissions);
    const allPermissionValues = options.flatMap((group) =>
        group.options ? group.options.map((opt) => Number(opt.value)) : [],
    );
    const isAllSelected =
        allPermissionValues.length > 0 &&
        allPermissionValues.every((v) => data.permissions.some((p) => Number(p) === v));

    const handleSelectAll = (checked) => setData("permissions", checked ? allPermissionValues : []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100" title="Edit Role">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent side="right" size="xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Update the role name and the permissions assigned to it.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    <FormField label="Role Name" required error={errors.name} className="mb-4 max-w-md">
                        <Input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Enter Role Name" />
                    </FormField>

                    {errors.permissions && <p className="mb-3 text-sm text-red-500">{errors.permissions}</p>}

                    <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                        Select All Permissions
                    </label>

                    <PermissionCards
                        options={options}
                        value={data.permissions}
                        onChange={(v) => setData("permissions", v)}
                        lightHeader
                    />
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button variant="brand" loading={processing} onClick={handleSubmit}>
                        <Save className="h-4 w-4" />
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
