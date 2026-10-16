import { Check, Circle } from "lucide-react";
import { useAdminT } from "@/contexts/AdminI18nContext";

const RULES = [
    ["minLength", "user.passwordRuleMinLength"],
    ["hasLowerCase", "user.passwordRuleLower"],
    ["hasUpperCase", "user.passwordRuleUpper"],
    ["hasNumber", "user.passwordRuleNumber"],
    ["hasSpecialChar", "user.passwordRuleSpecial"],
    ["notContainsName", "user.passwordRuleNoName"],
];

export default function PasswordStrengthChecklist({ validation, hideName = false }) {
    const { t } = useAdminT();
    const rules = hideName ? RULES.filter(([key]) => key !== "notContainsName") : RULES;

    return (
        <div className="mt-2 flex flex-col gap-1">
            {rules.map(([key, labelKey]) => {
                const ok = Boolean(validation?.[key]);
                return (
                    <div
                        key={key}
                        className={`flex items-center gap-1.5 text-xs ${ok ? "text-primary" : "text-muted-foreground"}`}
                    >
                        {ok ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {t(labelKey)}
                    </div>
                );
            })}
        </div>
    );
}
