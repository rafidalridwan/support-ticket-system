import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Ban, Filter, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import Create from "./Create";
import Edit from "./Edit";
import FilterDialog from "./FilterDialog";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import TableActionGroup from "@/components/reusable/TableActionGroup";
import { SortableTableHead } from "@/components/reusable/SortableTableHead";
import formatRoleLabel from "@/helpers/formatRoleLabel";
import { formatDateTime } from "@/helpers/utils";
import { createPermissionChecker } from "@/helpers/adminPermissions";
import { DEFAULT_PER_PAGE, DEFAULT_PER_PAGE_OPTIONS } from "@/helpers/pagination";
import { useAdminT } from "@/contexts/AdminI18nContext";
import {
    ADMIN_CHROME_BORDER,
    ADMIN_CHROME_TEXT,
    ADMIN_CHROME_TEXT_MUTED,
    ADMIN_RED,
} from "@/theme/adminColors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const getRoleDisplayLabel = (role) => {
    if (role?.label) return role.label;
    return formatRoleLabel(role?.name || "") || "--";
};

const STATUS_PILL = {
    active: { bg: "#ecfdf5", fg: "#15803d", labelKey: "common.active" },
    inactive: { bg: "#fef2f2", fg: "#b91c1c", labelKey: "common.inactive" },
};

const emptyFilters = {
    role_id: null,
    status: null,
    registration_date_from: null,
    registration_date_to: null,
};

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.userList");
    const { users, auth, filterRoles = [], filters: serverFilters = {} } = usePage().props;
    const { delete: destroy } = useForm();

    const hasPermission = createPermissionChecker(auth);

    const paginator = users && !Array.isArray(users) ? users : null;
    const pagedUsers = Array.isArray(paginator?.data)
        ? paginator.data
        : Array.isArray(users)
          ? users
          : [];
    const currentPage = paginator?.current_page || 1;
    const pageSize = paginator?.per_page || DEFAULT_PER_PAGE;
    const totalFiltered = paginator?.total ?? pagedUsers.length;
    const pageSizeOptions = DEFAULT_PER_PAGE_OPTIONS;

    const [searchText, setSearchText] = useState(serverFilters.search || "");
    const [statusUpdating, setStatusUpdating] = useState({});
    const [filterOpen, setFilterOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [sortDir, setSortDir] = useState(serverFilters.sort_dir || "desc");
    const [filters, setFilters] = useState({
        ...emptyFilters,
        role_id: serverFilters.role_id ? Number(serverFilters.role_id) : null,
        status: serverFilters.status ?? null,
        registration_date_from: serverFilters.registration_date_from || null,
        registration_date_to: serverFilters.registration_date_to || null,
    });

    const canView = hasPermission("user_list");
    const canEdit = hasPermission("user_edit");
    const canDelete = hasPermission("user_delete");

    const visitUsers = (overrides = {}) => {
        const merged = {
            search: searchText,
            role_id: filters.role_id,
            status: filters.status,
            registration_date_from: filters.registration_date_from,
            registration_date_to: filters.registration_date_to,
            sort_dir: sortDir,
            per_page: pageSize,
            page: currentPage,
            ...overrides,
        };

        const params = {};
        Object.entries(merged).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            params[key] = value;
        });

        router.get(route("administrative.user.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if ((serverFilters.search || "") === searchText) return;
            visitUsers({ search: searchText || undefined, page: 1 });
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    const handleStatusChange = (record, nextStatus) => {
        if (!record?.id || !canEdit) return;
        setStatusUpdating((prev) => ({ ...prev, [record.id]: true }));
        router.post(
            route("administrative.user.status", record.id),
            { status: nextStatus === 1 || nextStatus === "active" ? "active" : "inactive" },
            {
                preserveScroll: true,
                onFinish: () =>
                    setStatusUpdating((prev) => {
                        const next = { ...prev };
                        delete next[record.id];
                        return next;
                    }),
            },
        );
    };

    const handleResetFilters = () => {
        setFilters(emptyFilters);
        setFilterOpen(false);
        visitUsers({
            ...emptyFilters,
            role_id: undefined,
            status: undefined,
            registration_date_from: undefined,
            registration_date_to: undefined,
            page: 1,
        });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.role_id) count++;
        if (filters.status !== null && filters.status !== undefined) count++;
        if (filters.registration_date_from || filters.registration_date_to) count++;
        return count;
    }, [filters]);

    const uniqueRoles = filterRoles;

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
                        <p
                            className="mt-1 text-sm"
                            style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                        >
                            Manage staff accounts and access across the service
                            platform
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {hasPermission("user_create") && <Create />}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                            style={{ color: ADMIN_CHROME_TEXT_MUTED }}
                        />
                        <Input
                            placeholder={t("common.searchUser")}
                            className="h-11 rounded-full border-0 bg-[var(--admin-surface-muted)] pl-9 shadow-none focus-visible:ring-1"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
                        <Select
                            value={
                                filters.role_id
                                    ? String(filters.role_id)
                                    : "all"
                            }
                            onValueChange={(value) => {
                                const role_id = value === "all" ? null : Number(value);
                                setFilters((prev) => ({ ...prev, role_id }));
                                visitUsers({ role_id: role_id || undefined, page: 1 });
                            }}
                        >
                            <SelectTrigger className="h-11 w-full min-w-[8rem] flex-1 rounded-full border-0 bg-[var(--admin-surface-muted)] shadow-none sm:w-[180px] sm:flex-none">
                                <SelectValue
                                    placeholder={t("user.filterRolePh")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {uniqueRoles.map((role) => (
                                    <SelectItem
                                        key={role.value}
                                        value={String(role.value)}
                                    >
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className="relative h-11 w-11 rounded-full"
                            onClick={() => setFilterOpen(true)}
                        >
                            <Filter className="h-4 w-4" />
                            {activeFilterCount > 0 && (
                                <span
                                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                                    style={{ background: ADMIN_RED }}
                                >
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {canView ? (
                    <div className="flex min-h-[280px] min-w-0 flex-1 flex-col">
                        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead
                                            className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                            style={{
                                                color: ADMIN_CHROME_TEXT_MUTED,
                                            }}
                                        >
                                            {t("user.colUser")}
                                        </TableHead>
                                        <TableHead
                                            className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                            style={{
                                                color: ADMIN_CHROME_TEXT_MUTED,
                                            }}
                                        >
                                            {t("user.colRole")}
                                        </TableHead>
                                        <TableHead
                                            className="h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                            style={{
                                                color: ADMIN_CHROME_TEXT_MUTED,
                                            }}
                                        >
                                            {t("user.colStatus")}
                                        </TableHead>
                                        <SortableTableHead
                                            label={t("user.colRegistration")}
                                            column="created_at"
                                            sortKey="created_at"
                                            sortDir={sortDir}
                                            onSort={(_column, dir) => {
                                                setSortDir(dir);
                                                visitUsers({ sort_dir: dir, page: 1 });
                                            }}
                                        />
                                        <TableHead
                                            className="h-10 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                                            style={{
                                                color: ADMIN_CHROME_TEXT_MUTED,
                                            }}
                                        >
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagedUsers.length === 0 && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                                style={{
                                                    color: ADMIN_CHROME_TEXT_MUTED,
                                                }}
                                            >
                                                {t("table.noData")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {pagedUsers.map((record) => {
                                        const role = record?.roles?.[0];
                                        const isActive =
                                            record.status === "active" ||
                                            record.status === true ||
                                            record.status === 1 ||
                                            record.status === "1";
                                        const statusPill = isActive
                                            ? STATUS_PILL.active
                                            : STATUS_PILL.inactive;

                                        return (
                                            <TableRow
                                                key={record.id}
                                                className="border-b last:border-0 hover:bg-[var(--admin-row-hover)]"
                                                style={{
                                                    borderColor:
                                                        ADMIN_CHROME_BORDER,
                                                }}
                                            >
                                                <TableCell className="px-3 py-4">
                                                    <button
                                                        type="button"
                                                        className="text-left"
                                                        onClick={() =>
                                                            canEdit &&
                                                            setEditUser(record)
                                                        }
                                                    >
                                                        <div
                                                            className="font-semibold"
                                                            style={{
                                                                color: ADMIN_RED,
                                                            }}
                                                        >
                                                            {record.name ||
                                                                "--"}
                                                        </div>
                                                        <div
                                                            className="mt-0.5 text-xs"
                                                            style={{
                                                                color: ADMIN_CHROME_TEXT_MUTED,
                                                            }}
                                                        >
                                                            {record.email ||
                                                                "--"}
                                                        </div>
                                                    </button>
                                                </TableCell>
                                                <TableCell
                                                    className="px-3 py-4 text-sm"
                                                    style={{
                                                        color: ADMIN_CHROME_TEXT,
                                                    }}
                                                >
                                                    {role?.name
                                                        ? getRoleDisplayLabel(
                                                              role,
                                                          )
                                                        : "--"}
                                                </TableCell>
                                                <TableCell className="px-3 py-4">
                                                    <span
                                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{
                                                            background:
                                                                statusPill.bg,
                                                            color: statusPill.fg,
                                                        }}
                                                    >
                                                        {t(statusPill.labelKey)}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    className="px-3 py-4 text-sm"
                                                    style={{
                                                        color: ADMIN_CHROME_TEXT_MUTED,
                                                    }}
                                                >
                                                    {record.created_at
                                                        ? formatDateTime(
                                                              record.created_at,
                                                          )
                                                        : "--"}
                                                </TableCell>
                                                <TableCell className="px-3 py-4">
                                                    <TableActionGroup>
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:bg-slate-100"
                                                                title={t(
                                                                    "user.editTitle",
                                                                )}
                                                                onClick={() =>
                                                                    setEditUser(
                                                                        record,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                                                                title={
                                                                    isActive
                                                                        ? t(
                                                                              "common.inactive",
                                                                          )
                                                                        : t(
                                                                              "common.active",
                                                                          )
                                                                }
                                                                disabled={Boolean(
                                                                    statusUpdating[
                                                                        record
                                                                            .id
                                                                    ],
                                                                )}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        record,
                                                                        isActive
                                                                            ? "inactive"
                                                                            : "active",
                                                                    )
                                                                }
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                                title={t(
                                                                    "user.deleteBtnTitle",
                                                                )}
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        record,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableActionGroup>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <DataPagination
                            currentPage={currentPage}
                            pageSize={pageSize}
                            total={totalFiltered}
                            pageSizeOptions={pageSizeOptions}
                            className="border-0 bg-transparent px-0"
                            onPageChange={(page) => visitUsers({ page })}
                            onPageSizeChange={(size) =>
                                visitUsers({ per_page: size, page: 1 })
                            }
                        />
                    </div>
                ) : null}
            </div>

            {editUser ? (
                <Edit
                    user={editUser}
                    open={Boolean(editUser)}
                    hideTrigger
                    onOpenChange={(next) => {
                        if (!next) setEditUser(null);
                    }}
                />
            ) : null}

            <FilterDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                onApply={(applied) => {
                    setFilters(applied);
                    setFilterOpen(false);
                    visitUsers({
                        role_id: applied.role_id || undefined,
                        status:
                            applied.status === null || applied.status === undefined
                                ? undefined
                                : applied.status,
                        registration_date_from: applied.registration_date_from || undefined,
                        registration_date_to: applied.registration_date_to || undefined,
                        page: 1,
                    });
                }}
                onReset={handleResetFilters}
                roles={uniqueRoles}
                initialFilters={filters}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                title={t("user.deleteTitle")}
                description={t("user.deleteContent")}
                confirmText={t("common.yes")}
                cancelText={t("common.no")}
                onConfirm={() =>
                    deleteTarget &&
                    destroy(
                        route("administrative.user.destroy", deleteTarget.id),
                    )
                }
            />
        </AppLayout>
    );
}
