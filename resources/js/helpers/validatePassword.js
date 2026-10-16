export function getPasswordValidation(password, userName = "") {
    return {
        hasLowerCase: /[a-z]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password),
        minLength: password.length >= 8,
        notContainsName: userName
            ? !password.toLowerCase().includes(userName.toLowerCase())
            : true,
    };
}

export const PASSWORD_VALIDATION_MESSAGES = {
    minLength: "Password must be at least 8 characters",
    hasLowerCase: "Password must contain at least one lowercase letter",
    hasUpperCase: "Password must contain at least one uppercase letter",
    hasNumber: "Password must contain at least one number",
    hasSpecialChar:
        "Password must contain at least one special character (@$!%*?&)",
    notContainsName: "Password must not contain any part of your name",
};

export const PASSWORD_RULE_LABELS = {
    minLength: "At least 8 characters",
    hasLowerCase: "One lowercase letter",
    hasUpperCase: "One uppercase letter",
    hasNumber: "One number",
    hasSpecialChar: "One special character (@$!%*?&)",
    notContainsName: "Must not contain your name",
};

export function getFirstPasswordValidationError(password, userName = "") {
    const validation = getPasswordValidation(password, userName);

    if (!validation.minLength) {
        return PASSWORD_VALIDATION_MESSAGES.minLength;
    }
    if (!validation.hasLowerCase) {
        return PASSWORD_VALIDATION_MESSAGES.hasLowerCase;
    }
    if (!validation.hasUpperCase) {
        return PASSWORD_VALIDATION_MESSAGES.hasUpperCase;
    }
    if (!validation.hasNumber) {
        return PASSWORD_VALIDATION_MESSAGES.hasNumber;
    }
    if (!validation.hasSpecialChar) {
        return PASSWORD_VALIDATION_MESSAGES.hasSpecialChar;
    }
    if (!validation.notContainsName) {
        return PASSWORD_VALIDATION_MESSAGES.notContainsName;
    }

    return null;
}
