import { useForm, usePage } from "@inertiajs/react";
import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import FormField from "@/components/reusable/FormField";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const initialFormData = {
    name: "",
    priority: "",
    resolution_minutes: "1440",
    warning_threshold_percent: "80",
    is_active: "1",
};

export default function Create() {
    const { priorities = [] } = usePage().props;
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, setDefaults } =
        useForm(initialFormData);

    const resetForm = () => {
        const next = { ...initialFormData };
        setDefaults(next);
        setData(next);
        clearErrors();
    };

    useEffect(() => {
        if (!open) resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route("administrative.sla-policy.store"), {
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="brand" className="h-10 rounded-full px-5">
                    <Plus className="h-4 w-4" />
                    New SLA Policy
                </Button>
            </DialogTrigger>
            <DialogContent side="right" size="lg">
                <DialogHeader>
                    <DialogTitle>Create SLA Policy</DialogTitle>
                    <DialogDescription>
                        Define resolution time and warning threshold for a priority.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <DialogBody>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Name" required error={errors.name} className="md:col-span-2">
                            <Input
                                value={data.name}
                                placeholder="e.g. Critical - 2h"
                                onChange={(e) => setData("name", e.target.value)}
                            />
                        </FormField>

                        <FormField label="Priority" required error={errors.priority}>
                            <Select
                                value={data.priority || undefined}
                                onValueChange={(v) => setData("priority", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((item) => (
                                        <SelectItem key={item.value} value={String(item.value)}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField
                            label="Resolution minutes"
                            required
                            error={errors.resolution_minutes}
                        >
                            <Input
                                type="number"
                                min={1}
                                value={data.resolution_minutes}
                                onChange={(e) => setData("resolution_minutes", e.target.value)}
                            />
                        </FormField>

                        <FormField
                            label="Warning threshold %"
                            required
                            error={errors.warning_threshold_percent}
                        >
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={data.warning_threshold_percent}
                                onChange={(e) =>
                                    setData("warning_threshold_percent", e.target.value)
                                }
                            />
                        </FormField>

                        <FormField label="Active" required error={errors.is_active}>
                            <Select
                                value={data.is_active}
                                onValueChange={(v) => setData("is_active", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                    </DialogBody>
                    <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="submit" variant="brand" loading={processing}>
                        <Save className="h-4 w-4" />
                        Create
                    </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
