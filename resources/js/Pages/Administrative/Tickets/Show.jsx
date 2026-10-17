import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import AppLayout from "../../../components/layouts/AppLayout";
import { hasRole, isAdministrator } from "../../../helpers/adminPermissions";
import { formatDateTime } from "@/helpers/utils";
import { storagePublicUrl } from "@/components/reusable/SingleImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

function InfoRow({ label, children }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className="text-sm text-foreground">{children}</div>
        </div>
    );
}

function formatBytes(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSlaMinutes(minutes) {
    const total = Number(minutes);
    if (!Number.isFinite(total) || total <= 0) return "-";

    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
}

function ChatBubble({ mine, name, time, body, attachments = [], internal = false }) {
    const bubbleClass = internal
        ? "rounded-bl-md border border-amber-200 bg-amber-50 text-amber-950"
        : mine
          ? "rounded-br-md bg-primary text-primary-foreground"
          : "rounded-bl-md bg-[var(--admin-surface-muted)] text-foreground";

    const nameClass = internal
        ? "text-amber-950"
        : mine
          ? "text-white"
          : "text-foreground";

    const timeClass = internal
        ? "text-amber-800/70"
        : mine
          ? "text-white/70"
          : "text-muted-foreground";

    return (
        <div className={`flex w-full ${mine && !internal ? "justify-end" : "justify-start"}`}>
            <article className={`w-fit max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${bubbleClass}`}>
                <div className={`mb-1 flex flex-wrap items-center gap-2 ${mine && !internal ? "flex-row-reverse" : ""}`}>
                    <p className={`text-xs font-semibold ${nameClass}`}>{name}</p>
                    {internal && (
                        <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                            Internal
                        </Badge>
                    )}
                    <span className={`text-[11px] ${timeClass}`}>{time}</span>
                </div>

                {body && body !== "(attachment)" && (
                    <p className="whitespace-pre-wrap text-sm leading-6">{body}</p>
                )}

                {attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                        {attachments.map((file) => (
                            <a
                                key={file.id}
                                href={storagePublicUrl(file.path)}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                                    mine && !internal
                                        ? "bg-white/15 hover:bg-white/25"
                                        : "bg-white hover:bg-slate-50"
                                }`}
                            >
                                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate font-medium">{file.original_name}</span>
                                <span className="ml-auto shrink-0 opacity-70">{formatBytes(file.size_bytes)}</span>
                            </a>
                        ))}
                    </div>
                )}
            </article>
        </div>
    );
}

export default function Show() {
    const {
        ticket,
        priorities = [],
        statuses = [],
        canUseInternalNote = false,
        auth,
    } = usePage().props;
    const currentUserId = Number(auth?.user?.id);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const isClosed = Boolean(ticket?.status?.is_close);
    const isAdmin = isAdministrator(auth);
    const isAssignedAgent =
        hasRole(auth, "support_agent") && Number(ticket?.assigned_to) === currentUserId;
    const isStaff = isAdmin || hasRole(auth, "support_agent");
    const canUpdateStatus = !isClosed && (isAdmin || isAssignedAgent);

    const priorityValue = Number(ticket?.priority?.value ?? ticket?.priority);
    const priorityLabel =
        priorities.find((item) => item.value === priorityValue)?.label || priorityValue || "-";

    const chatItems = useMemo(() => {
        const opening = {
            key: "opening",
            userId: Number(ticket?.created_by ?? ticket?.creator?.id),
            name: ticket?.creator?.name || "Requester",
            time: formatDateTime(ticket?.created_at),
            body: ticket?.description || "",
            attachments: [],
            createdAt: ticket?.created_at,
            internal: false,
        };

        const replies = (ticket?.messages || []).map((message) => ({
            key: `message-${message.id}`,
            userId: Number(message.user_id ?? message.user?.id),
            name: message.user?.name || "User",
            time: formatDateTime(message.created_at),
            body: message.body || "",
            attachments: message.attachments || [],
            createdAt: message.created_at,
            internal: message.type === "internal_note",
        }));

        return [opening, ...replies].sort(
            (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
        );
    }, [ticket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [chatItems.length]);

    const form = useForm({
        type: "reply",
        body: "",
        attachments: [],
    });

    const selectedFiles = useMemo(
        () => (Array.isArray(form.data.attachments) ? form.data.attachments : []),
        [form.data.attachments],
    );

    const isInternalNote = form.data.type === "internal_note";

    const submitReply = (event) => {
        event.preventDefault();
        form.post(route("administrative.ticket.reply", ticket.unique_key), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const addFiles = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        form.setData("attachments", [...selectedFiles, ...files].slice(0, 5));
        event.target.value = "";
    };

    const removeFile = (index) => {
        form.setData(
            "attachments",
            selectedFiles.filter((_, i) => i !== index),
        );
    };

    const updateStatus = (statusId) => {
        if (updatingStatus || !statusId) return;
        if (String(statusId) === String(ticket.status_id)) return;

        setUpdatingStatus(true);
        router.post(
            route("administrative.ticket.status", ticket.unique_key),
            { status_id: Number(statusId) },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatus(false),
            },
        );
    };

    return (
        <AppLayout title={ticket.ticket_number}>
            <Head title={ticket.ticket_number} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-full">
                            <Link href={route("administrative.ticket.index")}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    {ticket.ticket_number}
                                </h1>
                                {ticket.unique_key && (
                                    <span className="rounded-md bg-[var(--admin-surface-muted)] px-2 py-0.5 text-xs font-semibold tracking-wider text-muted-foreground">
                                        #{ticket.unique_key}
                                    </span>
                                )}
                                <Badge variant={STATUS_BADGE[ticket.status?.value] || "outline"}>
                                    {ticket.status?.name || "-"}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{ticket.subject}</p>
                        </div>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--admin-chrome-border)] bg-[var(--admin-surface)]">
                        <div className="border-b border-[var(--admin-chrome-border)] px-5 py-4">
                            <h2 className="text-base font-semibold">Conversation</h2>
                            <p className="text-sm text-muted-foreground">
                                Replies from the requester, agents, and admins appear here.
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-5">
                            {chatItems.map((item) => (
                                <ChatBubble
                                    key={item.key}
                                    mine={item.userId === currentUserId}
                                    name={item.name}
                                    time={item.time}
                                    body={item.body}
                                    attachments={item.attachments}
                                    internal={item.internal}
                                />
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form
                            onSubmit={submitReply}
                            className="border-t border-[var(--admin-chrome-border)] bg-[var(--admin-surface)] px-5 py-4"
                        >
                            {isClosed ? (
                                <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-muted-foreground">
                                    This ticket is closed. New replies are disabled.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <Textarea
                                        rows={3}
                                        value={form.data.body}
                                        placeholder={
                                            isInternalNote
                                                ? "Write an internal note..."
                                                : "Write a reply..."
                                        }
                                        onChange={(e) => form.setData("body", e.target.value)}
                                    />
                                    {form.errors.body && (
                                        <p className="text-xs font-medium text-red-500">{form.errors.body}</p>
                                    )}
                                    {form.errors.type && (
                                        <p className="text-xs font-medium text-red-500">{form.errors.type}</p>
                                    )}
                                    {form.errors.attachments && (
                                        <p className="text-xs font-medium text-red-500">{form.errors.attachments}</p>
                                    )}

                                    {selectedFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFiles.map((file, index) => (
                                                <span
                                                    key={`${file.name}-${index}`}
                                                    className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-surface-muted)] px-3 py-1.5 text-xs"
                                                >
                                                    <Paperclip className="h-3.5 w-3.5" />
                                                    <span className="max-w-[160px] truncate">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={addFiles}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                Attach files
                                            </Button>
                                            {canUseInternalNote && (
                                                <Select
                                                    value={form.data.type}
                                                    onValueChange={(value) => form.setData("type", value)}
                                                >
                                                    <SelectTrigger className="h-9 w-[160px]">
                                                        <SelectValue placeholder="Message type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="reply">Reply</SelectItem>
                                                        <SelectItem value="internal_note">
                                                            Internal note
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <p className="basis-full text-xs text-muted-foreground">
                                                {isInternalNote
                                                    ? "Only agents and admins can see this."
                                                    : "Up to 5 files, 5MB each."}
                                            </p>
                                        </div>
                                        <Button type="submit" variant="brand" loading={form.processing}>
                                            <Send className="h-4 w-4" />
                                            {isInternalNote ? "Add note" : "Send reply"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </section>

                    <aside className="h-fit space-y-4 rounded-2xl border border-[var(--admin-chrome-border)] bg-[var(--admin-surface)] p-5">
                        <h2 className="text-base font-semibold">Ticket details</h2>
                        <div className="space-y-4">
                            <InfoRow label="Status">
                                {canUpdateStatus ? (
                                    <Select
                                        value={ticket.status_id ? String(ticket.status_id) : undefined}
                                        disabled={updatingStatus}
                                        onValueChange={updateStatus}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem key={status.id} value={String(status.id)}>
                                                    {status.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="space-y-1">
                                        <Badge variant={STATUS_BADGE[ticket.status?.value] || "outline"}>
                                            {ticket.status?.name || "-"}
                                        </Badge>
                                        {isClosed && (
                                            <p className="text-xs text-muted-foreground">
                                                Closed tickets cannot be reopened.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </InfoRow>
                            <InfoRow label="Priority">
                                <Badge variant={PRIORITY_BADGE[priorityValue] || "outline"}>
                                    {priorityLabel}
                                </Badge>
                            </InfoRow>
                            <InfoRow label="Category">{ticket.category?.name || "-"}</InfoRow>
                            <InfoRow label="Requester">{ticket.creator?.name || "-"}</InfoRow>
                            <InfoRow label="Assigned to">{ticket.assignee?.name || "Unassigned"}</InfoRow>
                            <InfoRow label="Created">{formatDateTime(ticket.created_at)}</InfoRow>
                            {ticket.assigned_at && (
                                <InfoRow label="Assigned at">{formatDateTime(ticket.assigned_at)}</InfoRow>
                            )}
                            {isStaff ? (
                                <>
                                    <InfoRow label="Total time">
                                        {formatSlaMinutes(ticket.sla_minutes)}
                                    </InfoRow>
                                    <InfoRow label="Resolve time">
                                        {ticket.sla_due_at ? (
                                            <Badge
                                                variant={
                                                    !isClosed &&
                                                    new Date(ticket.sla_due_at).getTime() < Date.now()
                                                        ? "destructive"
                                                        : !isClosed &&
                                                            ticket.sla_warning_at &&
                                                            new Date(ticket.sla_warning_at).getTime() <
                                                                Date.now()
                                                          ? "warning"
                                                          : "info"
                                                }
                                            >
                                                {formatDateTime(ticket.sla_due_at)}
                                            </Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </InfoRow>
                                </>
                            ) : (
                                <InfoRow label="Close time">
                                    {ticket.closed_at ? formatDateTime(ticket.closed_at) : "-"}
                                </InfoRow>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
