import { Head, useForm, usePage } from "@inertiajs/react";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker } from "../../../helpers/adminPermissions";
import { DEFAULT_PER_PAGE, resolvePagination } from "../../../helpers/pagination";
import { useAdminT } from "../../../contexts/AdminI18nContext";
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
    const { t } = useAdminT();
    const title = t("pages.permissionList");
    const { permissions, auth, pagination } = usePage().props;
    const { options } = resolvePagination(pagination);
    const { delete: destroy } = useForm();
    const hasPermission = createPermissionChecker(auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PER_PAGE);
    const [searchText, setSearchText] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtered = useMemo(() => {
        const search = searchText.toLowerCase();
        return (permissions || []).filter((permission) => {
            if (!search) return true;
            const name = permission.name ? permission.name.toLowerCase() : "";
            const label = permission.label ? permission.label.toLowerCase() : "";
            return name.includes(search) || label.includes(search);
        });
    }, [permissions, searchText]);

    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <AppLayout title={title}>
            <Head title={title} />

            <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="m-0 text-xl font-bold tracking-tight sm:text-2xl" style={{ color: ADMIN_CHROME_TEXT }}>
                            {title}
                        </h2>
                        <p className="mt-1 text-sm" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                            Manage the permissions used to control access across the platform
                        </p>
                    </div>
                    {hasPermission("permission_create") && <Create />}
                </div>

                <div className="relative min-w-0">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                    />
                    <Input
                        placeholder={t("common.searchPermission")}
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
                                    <TableHead
                                        className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                        style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                                    >
                                        {t("common.labelName")}
                                    </TableHead>
                                    <TableHead
                                        className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                        style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                                    >
                                        {t("common.name")}
                                    </TableHead>
                                    <TableHead
                                        className="h-10 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                                        style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                                    >
                                        {t("common.actions")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paged.length === 0 && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={3} className="h-24 text-center" style={{ color: ADMIN_CHROME_TEXT_MUTED }}>
                                            {t("table.noData")}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {paged.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        className="border-b last:border-0 hover:bg-[var(--admin-row-hover)]"
                                        style={{ borderColor: ADMIN_CHROME_BORDER }}
                                    >
                                        <TableCell className="px-3 py-4">
                                            <span className="font-semibold" style={{ color: "var(--admin-red)" }}>
                                                {record.label || "--"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-3 py-4 text-sm" style={{ color: ADMIN_CHROME_TEXT }}>
                                            {record.name || "--"}
                                        </TableCell>
                                        <TableCell className="px-3 py-4">
                                            <TableActionGroup>
                                                {hasPermission("permission_edit") && <Edit permission={record} />}
                                                {hasPermission("permission_delete") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                        title={t("permission.deleteBtnTitle")}
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
                title={t("permission.deleteTitle")}
                description={t("permission.deleteContent")}
                confirmText={t("common.yes")}
                cancelText={t("common.no")}
                onConfirm={() => deleteTarget && destroy(route("administrative.permission.destroy", deleteTarget.id))}
            />
        </AppLayout>
    );
}
