import { useForm } from "@inertiajs/react";
import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { useAdminT } from "@/contexts/AdminI18nContext";

export default function Create() {
    const { t } = useAdminT();
    const title = "Create Permission";
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: "",
        label: "",
    });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = () => {
        post(route("administrative.permission.store"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="brand" className="h-10 rounded-full px-5">
                    <Plus className="h-4 w-4" />
                    New Permission
                </Button>
            </DialogTrigger>
            <DialogContent side="right">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Add a permission name and the group it belongs to.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    {(errors?.name || errors?.label) && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>Please fix the errors below.</AlertDescription>
                        </Alert>
                    )}
                    <div className="flex flex-col gap-4">
                        <FormField label="Permission name" required error={errors?.name}>
                            <Input
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="e.g. user_list"
                            />
                        </FormField>
                        <FormField label="Label / group" required error={errors?.label}>
                            <Input
                                value={data.label}
                                onChange={(e) => setData("label", e.target.value)}
                                placeholder="e.g. User Management"
                            />
                        </FormField>
                    </div>
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
