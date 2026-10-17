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
import { DataPagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const emptyCategory = { name: "", value: "" };

/** "Abc Abc" / "Hardware Issue" → "abc_abc" / "hardware_issue" */
function toCategoryValue(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
}

export default function Index() {
    const { categories, auth, pagination } = usePage().props;
    const can = createPermissionChecker(auth);
    const { options } = resolvePagination(pagination);
    const categoryRows = categories?.data || [];
    const [currentPage, setCurrentPage] = useState(categories?.current_page || 1);
    const [pageSize, setPageSize] = useState(categories?.per_page || DEFAULT_PER_PAGE);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const form = useForm(emptyCategory);
    const { delete: destroy } = useForm();

    const showCreate = () => {
        setEditing(null);
        form.setData(emptyCategory);
        form.clearErrors();
        setOpen(true);
    };

    const showEdit = (category) => {
        setEditing(category);
        form.setData({ name: category.name, value: category.value });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(route("administrative.ticket-category.update", editing.id), options);
        } else {
            form.post(route("administrative.ticket-category.store"), options);
        }
    };

    return (
        <AppLayout title="Ticket Categories">
            <Head title="Ticket Categories" />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold sm:text-2xl">Ticket Categories</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage the categories available for tickets.
                        </p>
                    </div>
                    {can("ticket_category_create") && (
                        <Button variant="brand" onClick={showCreate}>
                            <Plus className="h-4 w-4" />
                            New Category
                        </Button>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoryRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No ticket categories found.
                                </TableCell>
                            </TableRow>
                        )}
                        {categoryRows.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.value}</TableCell>
                                <TableCell className="text-right">
                                    {can("ticket_category_edit") && (
                                        <Button variant="ghost" size="icon" onClick={() => showEdit(category)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can("ticket_category_delete") && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600"
                                            onClick={() => setDeleting(category)}
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
                    total={categories?.total || 0}
                    pageSizeOptions={options}
                    className="border-0 bg-transparent px-0"
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        router.get(route("administrative.ticket-category.index"), {
                            page,
                            per_page: pageSize,
                        }, { preserveState: true, preserveScroll: true, replace: true });
                    }}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                        router.get(route("administrative.ticket-category.index"), {
                            page: 1,
                            per_page: size,
                        }, { preserveState: true, preserveScroll: true, replace: true });
                    }}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent side="right" size="default">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Ticket Category" : "Create Ticket Category"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody className="space-y-4">
                            <FormField label="Name" required error={form.errors.name}>
                                <Input
                                    value={form.data.name}
                                    placeholder="e.g. Hardware Issue"
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        if (editing) {
                                            form.setData("name", name);
                                            return;
                                        }
                                        form.setData({
                                            ...form.data,
                                            name,
                                            value: toCategoryValue(name),
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
                                    placeholder="hardware_issue"
                                />
                            </FormField>
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
                title="Delete ticket category?"
                description="This will remove the selected category."
                onConfirm={() =>
                    deleting &&
                    destroy(route("administrative.ticket-category.destroy", deleting.id), {
                        onSuccess: () => setDeleting(null),
                    })
                }
            />
        </AppLayout>
    );
}
