import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker } from "../../../helpers/adminPermissions";
import { DEFAULT_PER_PAGE, resolvePagination } from "../../../helpers/pagination";
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
import { DataPagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const emptyStatus = { name: "", value: "", is_close: false };

function toStatusValue(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
}

export default function Index() {
    const { statuses, auth, pagination } = usePage().props;
    const can = createPermissionChecker(auth);
    const { options } = resolvePagination(pagination);
    const statusRows = statuses?.data || [];
    const [currentPage, setCurrentPage] = useState(statuses?.current_page || 1);
    const [pageSize, setPageSize] = useState(statuses?.per_page || DEFAULT_PER_PAGE);
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
                        {statusRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No ticket statuses found.
                                </TableCell>
                            </TableRow>
                        )}
                        {statusRows.map((status) => (
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
                <DataPagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    total={statuses?.total || 0}
                    pageSizeOptions={options}
                    className="border-0 bg-transparent px-0"
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        router.get(route("administrative.ticket-status.index"), {
                            page,
                            per_page: pageSize,
                        }, { preserveState: true, preserveScroll: true, replace: true });
                    }}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                        router.get(route("administrative.ticket-status.index"), {
                            page: 1,
                            per_page: size,
                        }, { preserveState: true, preserveScroll: true, replace: true });
                    }}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent side="right" size="default">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Ticket Status" : "Create Ticket Status"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody className="space-y-4">
                            <FormField label="Name" required error={form.errors.name}>
                                <Input
                                    value={form.data.name}
                                    placeholder="e.g. In Progress"
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        if (editing) {
                                            form.setData("name", name);
                                            return;
                                        }
                                        form.setData({
                                            ...form.data,
                                            name,
                                            value: toStatusValue(name),
                                        });
                                    }}
                                />
                            </FormField>
                            <FormField
                                label="Value"
                                required
                                error={form.errors.value}
                                hint={!editing ? "Auto-generated from name" : undefined}
                            >
                                <Input
                                    value={form.data.value}
                                    readOnly={!editing}
                                    className={!editing ? "bg-[var(--admin-surface-muted)]" : undefined}
                                    onChange={(e) => editing && form.setData("value", e.target.value)}
                                    placeholder="in_progress"
                                />
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
