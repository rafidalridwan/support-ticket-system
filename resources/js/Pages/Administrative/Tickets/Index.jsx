import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Eye, Plus, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { createPermissionChecker, isAdministrator } from "../../../helpers/adminPermissions";
import { DEFAULT_PER_PAGE, resolvePagination } from "../../../helpers/pagination";
import { formatDateTime } from "@/helpers/utils";
import FormField from "@/components/reusable/FormField";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const emptyTicket = {
    subject: "",
    description: "",
    category_id: "",
    priority: "2",
};

const STATUS_BADGE = {
    open: "info",
    in_progress: "default",
    waiting_for_customer: "warning",
    resolved: "success",
    closed: "secondary",
};

const PRIORITY_BADGE = {
    1: "secondary",
    2: "info",
    3: "warning",
    4: "destructive",
};

const priorityValue = (priority) => Number(priority?.value ?? priority);

const SUBJECT_WORD_LIMIT = 8;

/** Limit subject to N words and append "..." when truncated. */
function limitWords(text, limit = SUBJECT_WORD_LIMIT) {
    const value = String(text || "").trim();
    if (!value) return "-";
    const words = value.split(/\s+/);
    if (words.length <= limit) return value;
    return `${words.slice(0, limit).join(" ")}...`;
}

const cleanParams = (params) =>
    Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );

export default function Index() {
    const {
        tickets,
        categories = [],
        statuses = [],
        priorities = [],
        agents = [],
        filters = {},
        pagination,
        auth,
    } = usePage().props;
    const can = createPermissionChecker(auth);
    const isAdmin = isAdministrator(auth);
    const { options } = resolvePagination(pagination);
    const [currentPage, setCurrentPage] = useState(tickets?.current_page || 1);
    const [pageSize, setPageSize] = useState(tickets?.per_page || DEFAULT_PER_PAGE);
    const [open, setOpen] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const form = useForm(emptyTicket);
    const [filterData, setFilterData] = useState({
        search: filters.search || "",
        status_id: filters.status_id ? String(filters.status_id) : "",
        priority: filters.priority ? String(filters.priority) : "",
        category_id: filters.category_id ? String(filters.category_id) : "",
        assigned_to: filters.assigned_to ? String(filters.assigned_to) : "",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });
    const searchTimer = useRef(null);

    useEffect(() => {
        setFilterData({
            search: filters.search || "",
            status_id: filters.status_id ? String(filters.status_id) : "",
            priority: filters.priority ? String(filters.priority) : "",
            category_id: filters.category_id ? String(filters.category_id) : "",
            assigned_to: filters.assigned_to ? String(filters.assigned_to) : "",
            date_from: filters.date_from || "",
            date_to: filters.date_to || "",
        });
        setCurrentPage(tickets?.current_page || 1);
        setPageSize(tickets?.per_page || DEFAULT_PER_PAGE);
    }, [filters, tickets?.current_page, tickets?.per_page]);

    const visitTickets = (overrides = {}) => {
        router.get(
            route("administrative.ticket.index"),
            cleanParams({
                ...filterData,
                page: currentPage,
                per_page: pageSize,
                ...overrides,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const updateFilter = (key, value, debounce = false) => {
        const next = { ...filterData, [key]: value };
        setFilterData(next);
        setCurrentPage(1);

        if (debounce) {
            clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
                visitTickets({ ...next, page: 1 });
            }, 300);
            return;
        }

        visitTickets({ ...next, page: 1 });
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route("administrative.ticket.store"), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const reassignTicket = (ticket, assignedTo) => {
        if (!isAdmin || !ticket?.id) return;

        const nextValue = assignedTo === "unassigned" ? null : Number(assignedTo);
        const currentValue = ticket.assigned_to ?? null;
        if (nextValue === currentValue || (nextValue === null && currentValue === null)) {
            return;
        }

        setAssigningId(ticket.id);
        router.post(
            route("administrative.ticket.assign", ticket.unique_key),
            { assigned_to: nextValue },
            {
                preserveScroll: true,
                onFinish: () => setAssigningId(null),
            },
        );
    };

    return (
        <AppLayout title="Tickets">
            <Head title="Tickets" />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold sm:text-2xl">Tickets</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and manage support tickets.
                        </p>
                    </div>
                    {can("ticket_create") && (
                        <Button
                            variant="brand"
                            onClick={() => {
                                form.setData(emptyTicket);
                                form.clearErrors();
                                setOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            New Ticket
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-7">
                    <Input
                        placeholder="Search tickets..."
                        value={filterData.search}
                        onChange={(event) => updateFilter("search", event.target.value, true)}
                    />
                    <Select
                        value={filterData.status_id || "all"}
                        onValueChange={(value) => updateFilter("status_id", value === "all" ? "" : value)}
                    >
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status.id} value={String(status.id)}>{status.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterData.priority || "all"}
                        onValueChange={(value) => updateFilter("priority", value === "all" ? "" : value)}
                    >
                        <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All priorities</SelectItem>
                            {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={String(priority.value)}>{priority.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterData.category_id || "all"}
                        onValueChange={(value) => updateFilter("category_id", value === "all" ? "" : value)}
                    >
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filterData.assigned_to || "all"}
                        onValueChange={(value) => updateFilter("assigned_to", value === "all" ? "" : value)}
                    >
                        <SelectTrigger><SelectValue placeholder="Agent" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All agents</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={String(agent.id)}>{agent.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        value={filterData.date_from}
                        onChange={(e) => updateFilter("date_from", e.target.value)}
                    />
                    <Input
                        type="date"
                        value={filterData.date_to}
                        onChange={(e) => updateFilter("date_to", e.target.value)}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(tickets?.data || []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {(tickets?.data || []).map((ticket) => {
                                const priority = priorityValue(ticket.priority);
                                const priorityLabel =
                                    priorities.find((item) => item.value === priority)?.label || priority || "-";
                                const statusValue = ticket.status?.value || "";

                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">
                                            <div>{ticket.ticket_number}</div>
                                            {ticket.unique_key && (
                                                <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                                                    #{ticket.unique_key}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[280px]" title={ticket.subject || ""}>
                                            {limitWords(ticket.subject)}
                                        </TableCell>
                                        <TableCell>{ticket.category?.name || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={PRIORITY_BADGE[priority] || "outline"}>
                                                {priorityLabel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_BADGE[statusValue] || "outline"}>
                                                {ticket.status?.name || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="min-w-[180px]">
                                            {isAdmin ? (
                                                <Select
                                                    value={
                                                        ticket.assigned_to
                                                            ? String(ticket.assigned_to)
                                                            : "unassigned"
                                                    }
                                                    disabled={assigningId === ticket.id}
                                                    onValueChange={(value) => reassignTicket(ticket, value)}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Assign agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {agents.map((agent) => (
                                                            <SelectItem key={agent.id} value={String(agent.id)}>
                                                                {agent.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                ticket.assignee?.name || "Unassigned"
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDateTime(ticket.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={route("administrative.ticket.show", ticket.unique_key)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View Details</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <DataPagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={tickets?.total || 0}
                        pageSizeOptions={options}
                        className="border-0 bg-transparent px-0"
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            visitTickets({ page, per_page: pageSize });
                        }}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                            visitTickets({ page: 1, per_page: size });
                        }}
                    />
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent side="right" size="lg">
                    <DialogHeader>
                        <DialogTitle>Create Ticket</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <DialogBody className="space-y-4">
                            <FormField label="Subject" required error={form.errors.subject}>
                                <Input value={form.data.subject} onChange={(e) => form.setData("subject", e.target.value)} />
                            </FormField>
                            <FormField label="Description" required error={form.errors.description}>
                                <textarea
                                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                />
                            </FormField>
                            <FormField label="Category" required error={form.errors.category_id}>
                                <Select value={form.data.category_id || undefined} onValueChange={(value) => form.setData("category_id", value)}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Priority" required error={form.errors.priority}>
                                <Select value={form.data.priority} onValueChange={(value) => form.setData("priority", value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{priorities.map((priority) => <SelectItem key={priority.value} value={String(priority.value)}>{priority.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormField>
                        </DialogBody>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}><X className="h-4 w-4" /> Cancel</Button>
                            <Button type="submit" variant="brand" loading={form.processing}><Save className="h-4 w-4" /> Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
