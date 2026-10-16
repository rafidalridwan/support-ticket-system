import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Shared confirmation dialog for destructive/important actions (replaces antd Modal.confirm). */
export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Yes",
    cancelText = "No",
    onConfirm,
    destructive = true,
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        className={!destructive ? "bg-primary hover:bg-[var(--admin-red-hover)]" : undefined}
                        onClick={() => {
                            onConfirm?.();
                            onOpenChange?.(false);
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
