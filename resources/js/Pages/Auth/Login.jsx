import { Head, useForm, usePage } from "@inertiajs/react";
import AdminShell from "../../components/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const REMEMBER_ME_KEY = "remember_me_credentials";

function getSavedCredentials() {
    try {
        const saved = localStorage.getItem(REMEMBER_ME_KEY);
        if (saved) {
            const credentials = JSON.parse(saved);
            return {
                email: credentials.email || "",
                password: credentials.password || "",
                remember: true,
            };
        }
    } catch (error) {
        console.error("Error loading saved credentials:", error);
    }

    return {
        email: "",
        password: "",
        remember: false,
    };
}

function saveCredentials(email, password) {
    try {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ email, password }));
    } catch (error) {
        console.error("Error saving credentials:", error);
    }
}

function clearSavedCredentials() {
    try {
        localStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
        console.error("Error clearing credentials:", error);
    }
}

function BrandMark({ name, logo }) {
    if (logo) {
        return <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white object-contain p-1.5" />;
    }

    return (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-semibold text-white">
            {(name || "P").trim().charAt(0).toUpperCase()}
        </span>
    );
}

function LoginContent() {
    const { website } = usePage().props;
    const siteName = website?.website_name || "Support Ticket System";
    const logo = website?.logo || "";

    const savedCredentials = getSavedCredentials();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: savedCredentials.email,
        password: savedCredentials.password,
        remember: savedCredentials.remember,
    });

    const handleRememberChange = (checked) => {
        setData("remember", checked);
        if (!checked) {
            clearSavedCredentials();
        }
    };

    const onFinish = () => {
        post(route("login"), {
            onSuccess: () => {
                if (data.remember) {
                    saveCredentials(data.email, data.password);
                } else {
                    clearSavedCredentials();
                }
                reset("password");
            },
        });
    };

    return (
        <>
            <Head title="Sign in" />
            <div className="grid min-h-screen md:grid-cols-2">
                <aside
                    className="relative flex flex-col justify-between overflow-hidden px-6 py-6 text-white md:px-12 md:py-12"
                    style={{ background: "var(--admin-red-gradient)" }}
                >
                    <div
                        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/20"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-32 -left-16 hidden h-80 w-80 rounded-full border border-white/15 md:block"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute bottom-16 right-10 hidden h-28 w-28 rounded-full bg-white/10 md:block"
                        aria-hidden="true"
                    />

                    <div className="relative flex items-center gap-3">
                        <BrandMark name={siteName} logo={logo} />
                        <span className="text-lg font-semibold tracking-tight">{siteName.trim()}</span>
                    </div>

                    <div className="relative mt-6 hidden max-w-md md:mt-0 md:block">
                        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">Admin panel</p>
                        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                            Sign in to manage {siteName.trim()}.
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                            Users, roles, permissions, and audit logs in one place.
                        </p>
                    </div>

                    <p className="relative mt-8 hidden text-xs text-white/60 md:mt-0 md:block">
                        © {new Date().getFullYear()} {siteName.trim()}
                    </p>
                </aside>

                <main className="login-panel flex items-center justify-center bg-[#f4f7f7] px-6 py-10 md:py-12">
                    <div className="w-full max-w-[420px]">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
                        <p className="mt-1 text-sm text-slate-600">Enter your email and password to continue.</p>

                        <form
                            id="submitForm"
                            className="mt-8"
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                onFinish();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Email/Phone
                                    <span className="ml-1 text-teal-600">*</span>
                                </label>
                                <Input
                                    id="email"
                                    placeholder="Enter your email or phone"
                                    value={data.email}
                                    autoComplete="email"
                                    className="mt-1.5 h-11 border-slate-200 bg-white text-slate-900 caret-slate-900 placeholder:text-slate-400"
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Password
                                    <span className="ml-1 text-teal-600">*</span>
                                </label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Enter your password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    className="mt-1.5 h-11 border-slate-200 bg-white text-slate-900 caret-slate-900 placeholder:text-slate-400"
                                    onChange={(e) => setData("password", e.target.value)}
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="flex cursor-pointer items-center gap-2.5">
                                    <Checkbox
                                        checked={data.remember}
                                        onCheckedChange={(checked) => handleRememberChange(Boolean(checked))}
                                        className="border-slate-300 data-[state=checked]:border-[var(--admin-red)] data-[state=checked]:bg-[var(--admin-red)]"
                                    />
                                    <span className="text-[13px] text-slate-600">Remember me</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                variant="brand"
                                size="lg"
                                loading={processing}
                                className="w-full"
                            >
                                Sign in
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

export default function Login() {
    return (
        <AdminShell>
            <LoginContent />
        </AdminShell>
    );
}
