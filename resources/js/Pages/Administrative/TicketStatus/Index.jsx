import { Head, useForm, usePage } from "@inertiajs/react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker } from "../../../helpers/adminPermissions";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import FormField from "@/components/reusable/FormField";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const emptyStatus = { name: "", value: "", is_close: false };

export default function Index() {
    const { statuses = [], auth } = usePage().props;
    const can = createPermissionChecker(auth);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const form = useForm(emptyStatus);
    const { delete: destroy } = useForm();

    const showCreate = () => {
        setEditing(null);
        form.setData(emptyStatus);
        form.clearErrors();
        setOpen(true);
    };

    const showEdit = (status) => {
        setEditing(status);
        form.setData({
            name: status.name,
            value: status.value,
            is_close: status.is_close,
        });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(route("administrative.ticket-status.update", editing.id), options);
        } else {
            form.post(route("administrative.ticket-status.store"), options);
        }
    };

    return (
        <AppLayout title="Ticket Statuses">
            <Head title="Ticket Statuses" />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold sm:text-2xl">Ticket Statuses</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage the statuses available for tickets.
                        </p>
                    </div>
                    {can("ticket_status_create") && (
                        <Button variant="brand" onClick={showCreate}>
                            <Plus className="h-4 w-4" />
                            New Status
                        </Button>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Closed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statuses.map((status) => (
                            <TableRow key={status.id}>
                                <TableCell className="font-medium">{status.name}</TableCell>
                                <TableCell>{status.value}</TableCell>
                                <TableCell>{status.is_close ? "Yes" : "No"}</TableCell>
                                <TableCell className="text-right">
                                    {can("ticket_status_edit") && (
                                        <Button variant="ghost" size="icon" onClick={() => showEdit(status)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can("ticket_status_delete") && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600"
                                            onClick={() => setDeleting(status)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent side="right" size="default">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Ticket Status" : "Create Ticket Status"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody className="space-y-4">
                            <FormField label="Name" required error={form.errors.name}>
                                <Input value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
                            </FormField>
                            <FormField label="Value" required error={form.errors.value}>
                                <Input value={form.data.value} onChange={(e) => form.setData("value", e.target.value)} />
                            </FormField>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={form.data.is_close}
                                    onCheckedChange={(value) => form.setData("is_close", Boolean(value))}
                                />
                                Closing status
                            </label>
                        </DialogBody>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" variant="brand" loading={form.processing}>
                                <Save className="h-4 w-4" /> {editing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(value) => !value && setDeleting(null)}
                title="Delete ticket status?"
                description="This will permanently remove the selected status."
                onConfirm={() =>
                    deleting &&
                    destroy(route("administrative.ticket-status.destroy", deleting.id), {
                        onSuccess: () => setDeleting(null),
                    })
                }
            />
        </AppLayout>
    );
}
