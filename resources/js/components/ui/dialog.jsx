import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-300 data-[state=open]:duration-300 dark:bg-black/70",
            className,
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
    (
        {
            className,
            children,
            hideClose = false,
            size = "default",
            side = "center",
            height = "full",
            overlayClassName,
            ...props
        },
        ref,
    ) => (
        <DialogPortal>
            <DialogOverlay className={overlayClassName} />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed z-50 flex w-full flex-col gap-0 overflow-hidden border border-border bg-background text-foreground p-0 shadow-2xl duration-200",
                    side === "center" &&
                        "left-1/2 top-1/2 w-[calc(100vw-1.5rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:w-full",
                    side === "right" &&
                        "right-0 rounded-none border-y-0 border-r-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-300 ease-out",
                    side === "right" && height === "full" && "inset-y-0 h-full max-h-screen",
                    side === "right" && height === "auto" && "top-0 h-auto max-h-screen",
                    side === "center" && size === "sm" && "max-w-md",
                    side === "center" && size === "default" && "max-w-lg",
                    side === "center" && size === "lg" && "max-w-2xl",
                    side === "center" && size === "xl" && "max-w-4xl",
                    side === "right" && size === "sm" && "sm:max-w-sm",
                    side === "right" && size === "default" && "sm:max-w-md",
                    side === "right" && size === "lg" && "sm:max-w-2xl",
                    side === "right" && size === "xl" && "sm:max-w-3xl",
                    side === "right" && size === "2xl" && "sm:max-w-5xl",
                    className,
                )}
                {...props}
            >
                {children}
                {!hideClose && (
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-muted-foreground ring-offset-background transition-opacity hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn(
            "flex shrink-0 flex-col gap-1 border-b border-border bg-background px-4 py-4 pr-12 text-foreground sm:px-6 sm:py-5",
            className,
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogBody = ({ className, ...props }) => (
    <div
        className={cn(
            "theme-scroll flex-1 overflow-y-auto bg-[var(--admin-surface-muted)]/70 px-4 py-4 sm:px-6 sm:py-5",
            className,
        )}
        {...props}
    />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4 [&_button]:w-full sm:[&_button]:w-auto",
            className,
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
