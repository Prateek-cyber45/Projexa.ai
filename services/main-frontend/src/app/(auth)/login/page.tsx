"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Simplified auth handler pointing to main-api
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://api.main.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Invalid credentials");
            }

            const { access_token } = await res.json();

            // Store token in a cookie that is shared across domain
            document.cookie = `token=${access_token}; path=/; domain=.main.com; max-age=86400; SameSite=Lax`;

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col items-center justify-center p-6">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
                <Shield className="w-8 h-8 text-[var(--color-brand-blue)] group-hover:scale-110 transition-transform" />
                <span className="font-display font-bold text-2xl tracking-wide text-[var(--color-text-primary)]">
                    CyberPlatform
                </span>
            </Link>

            <div className="w-full max-w-md bg-[var(--color-surface-card)] rounded-[18px] p-8 shadow-[var(--shadow-card)] border border-[var(--color-border-default)] zone-blue">
                <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
                    Terminal Access
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm mb-8 text-center font-sans">
                    Enter your credentials to access the secure network.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-[#FFF0EE] text-[#C4291C] rounded-[10px] text-sm font-sans border border-[#FF3B30]/20 flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2 font-sans">
                            USERNAME / OPERATOR ID
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] px-4 py-3 text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/30 transition-all"
                            placeholder="e.g. op_alpha"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2 font-sans">
                            PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] px-4 py-3 text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/30 transition-all text-xl tracking-[0.2em]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-brand-blue)] text-white rounded-full py-3.5 px-6 font-sans font-bold hover:bg-[var(--color-brand-blue-hover)] transition-colors active:bg-[#006ACC] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Initiate Handshake <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] text-center text-sm font-sans text-[var(--color-text-secondary)]">
                    Don&apos;t have authorization?{" "}
                    <Link href="/register" className="text-[var(--color-brand-blue)] font-semibold hover:underline">
                        Request Access
                    </Link>
                </div>
            </div>
        </div>
    );
}
