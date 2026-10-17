import { useForm, usePage } from "@inertiajs/react";
import { Pencil, Save, X } from "lucide-react";
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

export default function Edit({ policy }) {
    const { priorities = [] } = usePage().props;
    const [open, setOpen] = useState(false);

    const buildInitial = () => ({
        name: policy?.name ?? "",
        priority: policy?.priority != null ? String(policy.priority) : "",
        resolution_minutes: String(policy?.resolution_minutes ?? 1440),
        warning_threshold_percent: String(policy?.warning_threshold_percent ?? 80),
        is_active: policy?.is_active === false ? "0" : "1",
    });

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm(buildInitial());

    useEffect(() => {
        reset(buildInitial());
        if (!open) clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, policy?.id]);

    const handleSubmit = (event) => {
        event.preventDefault();

        put(route("administrative.sla-policy.update", policy.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-slate-100"
                    title="Edit SLA Policy"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent side="right" size="lg">
                <DialogHeader>
                    <DialogTitle>Edit SLA Policy</DialogTitle>
                    <DialogDescription>Update resolution rules for this priority.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <DialogBody>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Name" required error={errors.name} className="md:col-span-2">
                            <Input
                                value={data.name}
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
                        Update
                    </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
