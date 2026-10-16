import { useForm } from "@inertiajs/react";
import { Pencil, Save, X } from "lucide-react";
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

export default function Edit({ permission }) {
    const title = "Edit Permission";
    const [open, setOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: permission.name ?? "",
        label: permission.label ?? "",
    });

    useEffect(() => {
        if (!open) reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = () => {
        put(route("administrative.permission.update", permission.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const allErrors = Object.values(errors || {}).filter((v) => typeof v === "string");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100" title="Edit Permission">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent side="right">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Update the permission name and its group label.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    {allErrors.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>
                                <ul className="list-disc pl-4">
                                    {allErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Label Name" required error={errors?.label}>
                            <Input
                                value={data.label}
                                onChange={(e) => setData("label", e.target.value)}
                                placeholder="Enter Permission Label"
                            />
                        </FormField>
                        <FormField label="Permission Name" required error={errors?.name}>
                            <Input
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Enter Permission Name"
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
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
