import { Head, useForm, usePage } from "@inertiajs/react";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker } from "../../../helpers/adminPermissions";
import { DEFAULT_PER_PAGE, resolvePagination } from "../../../helpers/pagination";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import TableActionGroup from "@/components/reusable/TableActionGroup";
import Create from "./Create";
import Edit from "./Edit";
import { ADMIN_CHROME_BORDER, ADMIN_CHROME_TEXT, ADMIN_CHROME_TEXT_MUTED } from "@/theme/adminColors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Index() {
    const title = "SLA Policies";
    const { policies, auth, pagination } = usePage().props;
    const { options } = resolvePagination(pagination);
    const { delete: destroy } = useForm();
    const hasPermission = createPermissionChecker(auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PER_PAGE);
    const [searchText, setSearchText] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtered = useMemo(() => {
        const search = searchText.toLowerCase();
        return (policies || []).filter((policy) => {
            if (!search) return true;
            return (
                (policy.name || "").toLowerCase().includes(search) ||
                (policy.priority_label || "").toLowerCase().includes(search)
            );
        });
    }, [policies, searchText]);

    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <AppLayout title={title}>
            <Head title={title} />

            <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2
                            className="m-0 text-xl font-bold tracking-tight sm:text-2xl"
                            style={{ color: ADMIN_CHROME_TEXT }}
                        >
                            {title}
                        </h2>
                        <p className="mt-1 text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                            One active resolution policy per ticket priority
                        </p>
                    </div>
                    {hasPermission("sla_policy_create") && <Create />}
                </div>

                <div className="relative min-w-0">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                    />
                    <Input
                        placeholder="Search by name or priority"
                        className="h-11 rounded-full border-0 bg-[var(--admin-surface-muted)] pl-9 shadow-none focus-visible:ring-1"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex min-h-[280px] min-w-0 flex-1 flex-col">
                    <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    {["Name", "Priority", "Minutes", "Warning %", "Status", "Actions"].map(
                                        (label) => (
                                            <TableHead
                                                key={label}
                                                className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                                style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                                            >
                                                {label}
                                            </TableHead>
                                        ),
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paged.length === 0 && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center"
                                            style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                                        >
                                            No SLA policies found
                                        </TableCell>
                                    </TableRow>
                                )}
                                {paged.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        className="border-b last:border-0 hover:bg-[var(--admin-row-hover)]"
                                        style={{ borderColor: ADMIN_CHROME_BORDER }}
                                    >
                                        <TableCell className="px-3 py-4 font-semibold" style={{ color: "var(--admin-red)" }}>
                                            {record.name}
                                        </TableCell>
                                        <TableCell className="px-3 py-4" style={{ color: ADMIN_CHROME_TEXT }}>
                                            {record.priority_label}
                                        </TableCell>
                                        <TableCell className="px-3 py-4" style={{ color: ADMIN_CHROME_TEXT }}>
                                            {record.resolution_minutes}
                                        </TableCell>
                                        <TableCell className="px-3 py-4" style={{ color: ADMIN_CHROME_TEXT }}>
                                            {record.warning_threshold_percent}%
                                        </TableCell>
                                        <TableCell className="px-3 py-4" style={{ color: ADMIN_CHROME_TEXT }}>
                                            {record.is_active ? "Active" : "Inactive"}
                                        </TableCell>
                                        <TableCell className="px-3 py-4">
                                            <TableActionGroup>
                                                {hasPermission("sla_policy_edit") && <Edit policy={record} />}
                                                {hasPermission("sla_policy_delete") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                        title="Delete SLA Policy"
                                                        onClick={() => setDeleteTarget(record)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableActionGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DataPagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={filtered.length}
                        pageSizeOptions={options}
                        className="border-0 bg-transparent px-0"
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                title="Delete SLA policy?"
                description="This will permanently remove the selected SLA policy."
                confirmText="Yes"
                cancelText="No"
                onConfirm={() =>
                    deleteTarget &&
                    destroy(route("administrative.sla-policy.destroy", deleteTarget.id))
                }
            />
        </AppLayout>
    );
}
