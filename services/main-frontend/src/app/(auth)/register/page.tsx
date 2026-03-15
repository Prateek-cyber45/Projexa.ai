"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passphrases do not match.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://api.main.com/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Registration failed");
            }

            // Automatically redirect to login upon successful registration
            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col items-center justify-center p-6 py-12">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
                <Shield className="w-8 h-8 text-[var(--color-brand-blue)] group-hover:scale-110 transition-transform" />
                <span className="font-display font-bold text-2xl tracking-wide text-[var(--color-text-primary)]">
                    CyberPlatform
                </span>
            </Link>

            <div className="w-full max-w-md bg-[var(--color-surface-card)] rounded-[18px] p-8 shadow-[var(--shadow-card)] border border-[var(--color-border-default)] zone-blue">
                <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
                    Request Access
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm mb-8 text-center font-sans tracking-wide">
                    Provision a new operator profile on the network.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-[#FFF0EE] text-[#C4291C] rounded-[10px] text-sm font-sans border border-[#FF3B30]/20 flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2 font-sans tracking-wide">
                            OPERATOR ID (USERNAME)
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] px-4 py-3 text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/30 transition-all"
                            placeholder="e.g. delta_seven"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2 font-sans tracking-wide">
                            PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] px-4 py-3 text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/30 transition-all font-mono tracking-widest text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2 font-sans tracking-wide">
                            CONFIRM PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] px-4 py-3 text-[var(--color-text-primary)] font-sans focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/30 transition-all font-mono tracking-widest text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-brand-blue)] text-white rounded-full py-3.5 px-6 font-sans font-bold hover:bg-[var(--color-brand-blue-hover)] transition-colors active:bg-[#006ACC] flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Confirm Provisioning <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] text-center text-sm font-sans text-[var(--color-text-secondary)]">
                    Already authorized?{" "}
                    <Link href="/login" className="text-[var(--color-brand-blue)] font-semibold hover:underline">
                        Initiate Handshake
                    </Link>
                </div>
            </div>
        </div>
    );
}
