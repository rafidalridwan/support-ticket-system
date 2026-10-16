import SingleImageUpload from "@/components/reusable/SingleImageUpload";
import FormField from "@/components/reusable/FormField";
import PasswordStrengthChecklist from "@/components/reusable/PasswordStrengthChecklist";
import { useAdminT } from "@/contexts/AdminI18nContext";
import { useForm, usePage } from "@inertiajs/react";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Edit({ user, open: controlledOpen, onOpenChange, hideTrigger = false }) {
    const { t } = useAdminT();
    const title = t("user.editTitle");
    const { roles } = usePage().props;
    const roleOptions = useMemo(
        () => (roles || []).map((role) => ({ value: role.value, label: role.label || role.value })),
        [roles],
    );

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const isValidUser = user && user.id;

    const currentRoleName = useMemo(() => {
        if (!isValidUser || !user?.roles?.length) return "";
        return user.roles[0]?.name || "";
    }, [user?.roles, isValidUser]);

    const buildInitialData = () => ({
        name: isValidUser ? (user?.name ?? "") : "",
        phone: isValidUser ? (user?.phone ?? "") : "",
        email: isValidUser ? (user?.email ?? "") : "",
        password: "",
        password_confirmation: "",
        image: isValidUser ? (user?.image ?? null) : null,
        role: currentRoleName,
        status:
            isValidUser && user?.status !== undefined
                ? user.status === true || user.status === 1 || user.status === "1"
                    ? "active"
                    : user.status === false || user.status === 0 || user.status === "0"
                      ? "inactive"
                      : String(user.status)
                : "active",
    });

    const { data, setData, post, processing, errors, reset, clearErrors, transform } =
        useForm(buildInitialData());
    const [passwordValidation, setPasswordValidation] = useState({
        hasLowerCase: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        minLength: false,
        notContainsName: true,
    });

    useEffect(() => {
        reset(buildInitialData());
        if (!open) {
            clearErrors();
            setPasswordValidation({
                hasLowerCase: false,
                hasUpperCase: false,
                hasNumber: false,
                hasSpecialChar: false,
                minLength: false,
                notContainsName: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!isValidUser) return null;

    const validatePassword = (password, userName) => {
        if (!password) {
            const empty = {
                hasLowerCase: false,
                hasUpperCase: false,
                hasNumber: false,
                hasSpecialChar: false,
                minLength: false,
                notContainsName: true,
            };
            setPasswordValidation(empty);
            return empty;
        }
        const validation = {
            hasLowerCase: /[a-z]/.test(password),
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[@$!%*?&]/.test(password),
            minLength: password.length >= 8,
            notContainsName: userName
                ? !password.toLowerCase().includes(userName.toLowerCase())
                : true,
        };
        setPasswordValidation(validation);
        return validation;
    };

    const handleSubmit = () => {
        transform((form) => {
            const next = { ...form };
            if (next.image instanceof File) {
                // keep uploaded file
            } else if (next.image == null || next.image === "") {
                next.clear_image = true;
                delete next.image;
            } else {
                delete next.image;
            }
            return next;
        });

        post(route("administrative.user.update", user.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outlineBrand" size="icon" title={t("user.editTitle")}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent side="right" size="lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{t("user.editSubtitle")}</DialogDescription>
                </DialogHeader>
                <DialogBody>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            label={t("user.fullName")}
                            required
                            error={errors.name}
                            className="md:col-span-2"
                        >
                            <Input
                                value={data.name}
                                placeholder={t("user.fullNamePh")}
                                onChange={(e) => {
                                    setData("name", e.target.value);
                                    if (data.password) {
                                        validatePassword(data.password, e.target.value);
                                    }
                                }}
                            />
                        </FormField>

                        <FormField label={t("user.email")} required error={errors.email}>
                            <Input
                                type="email"
                                value={data.email}
                                placeholder={t("user.emailPh")}
                                autoComplete="email"
                                onChange={(e) => setData("email", e.target.value)}
                            />
                        </FormField>

                        <FormField label={t("user.phone")} error={errors.phone}>
                            <Input
                                value={data.phone}
                                placeholder={t("user.phonePh")}
                                onChange={(e) => setData("phone", e.target.value)}
                            />
                        </FormField>

                        <FormField label={t("user.role")} required error={errors.role}>
                            <Select value={data.role || undefined} onValueChange={(v) => setData("role", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("user.rolePh")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t("user.status")} required error={errors.status}>
                            <Select
                                value={data.status}
                                onValueChange={(v) => setData("status", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t("common.active")}</SelectItem>
                                    <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t("user.password")} error={errors.password}>
                            <PasswordInput
                                value={data.password}
                                placeholder={t("user.passwordPh")}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    setData("password", e.target.value);
                                    validatePassword(e.target.value, data.name);
                                }}
                            />
                            {data.password ? (
                                <PasswordStrengthChecklist validation={passwordValidation} />
                            ) : null}
                        </FormField>

                        <FormField
                            label={t("user.confirmPassword")}
                            error={
                                errors.password_confirmation ||
                                (data.password &&
                                data.password_confirmation &&
                                data.password_confirmation !== data.password
                                    ? t("user.passwordsNoMatch")
                                    : undefined)
                            }
                        >
                            <PasswordInput
                                value={data.password_confirmation}
                                placeholder={t("user.confirmPasswordPh")}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData("password_confirmation", e.target.value)
                                }
                            />
                        </FormField>

                        <FormField
                            label={t("user.image")}
                            hint={t("user.imageFormats")}
                            error={errors.image}
                            className="md:col-span-2"
                        >
                            <SingleImageUpload
                                value={data.image}
                                onChange={(file) => setData("image", file ?? null)}
                            />
                        </FormField>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                        {t("user.formCancel")}
                    </Button>
                    <Button variant="brand" loading={processing} onClick={handleSubmit}>
                        <Save className="h-4 w-4" />
                        {t("user.formSubmit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
