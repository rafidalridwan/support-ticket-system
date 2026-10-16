import { AdminI18nProvider } from "../../contexts/AdminI18nContext";

export default function AdminShell({ children }) {
    return <AdminI18nProvider>{children}</AdminI18nProvider>;
}
