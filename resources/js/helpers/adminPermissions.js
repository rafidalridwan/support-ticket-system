export function isAdministrator(auth) {
    if (auth?.is_administrator) {
        return true;
    }

    return (auth?.user?.roles || []).some((role) => {
        const name = role?.name?.toLowerCase();
        return name === "administrator" || name === "system_admin";
    });
}

export function hasRole(auth, roleName) {
    const target = String(roleName || "").toLowerCase();

    return (auth?.user?.roles || []).some(
        (role) => String(role?.name || "").toLowerCase() === target,
    );
}

export function createPermissionChecker(auth) {
    const raw = auth?.permissions || [];
    const permissions = Array.isArray(raw) ? raw : Object.values(raw);
    const administrator = isAdministrator(auth);

    return (permission) => administrator || permissions.includes(permission);
}
