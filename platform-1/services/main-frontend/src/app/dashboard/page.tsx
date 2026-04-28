"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Activity, GraduationCap, Flame, Play, Clock, Target, LogOut, Loader2, ArrowRight } from "lucide-react";

interface UserProfile {
    username: string;
    role: string;
    rolling_score: number;
    skill_vectors: {
        soc_analysis: number;
        forensics: number;
        network_security: number;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Helper to get cookie by name
        const getCookie = (name: string) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            if (match) return match[2];
            return null;
        };

        const token = getCookie("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("http://api.main.com/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Unauthorized");
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error("Failed to load profile:", err);
                // router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-surface-main)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[var(--color-brand-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border-subtle)]">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-[var(--color-brand-blue)]" />
                        <span className="font-display font-bold text-xl tracking-wide text-[var(--color-text-primary)]">
                            CyberPlatform
                        </span>
                        <div className="ml-4 pl-4 border-l border-[var(--color-border-subtle)] hidden md:flex items-center gap-6 font-sans font-semibold text-sm">
                            <Link href="/dashboard" className="text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)] h-16 inline-flex items-center">Dashboard</Link>
                            <a href="http://academy.main.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Academy</a>
                            <a href="http://labs.main.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Labs</a>
                            <Link href="/scores" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">My Scores</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="font-sans font-bold text-[var(--color-text-primary)] text-sm">{profile?.username || "Operator"}</span>
                            <span className="font-mono text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">{profile?.role || "USER"}</span>
                        </div>
                        <button
                            onClick={() => {
                                document.cookie = 'token=; Max-Age=0; path=/; domain=.main.com;';
                                router.push('/login');
                            }}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 py-8">

                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                            Operator Dashboard
                        </h1>
                        <p className="font-sans text-[var(--color-text-secondary)]">
                            Welcome back. Your training telemetry is active.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--color-surface-card)] px-4 py-2 rounded-full border border-[var(--color-border-subtle)] shadow-sm">
                        <span className="ping-dot ping-blue" />
                        <span className="font-mono text-xs text-[var(--color-brand-blue)] font-bold tracking-wide">SYSTEM ONLINE</span>
                    </div>
                </header>

                {/* 4 Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                    <div className="bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] zone-purple">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Target className="w-5 h-5 text-[var(--color-brand-purple)]" />
                            </div>
                            <span className="badge badge-ai">Global Rank: #402</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs font-sans font-bold uppercase tracking-wider mb-1">Overall Skill Score</p>
                        <p className="font-mono text-4xl text-[var(--color-text-primary)] font-bold">{profile?.rolling_score || "82.4"}</p>
                    </div>

                    <div className="bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] zone-orange">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Activity className="w-5 h-5 text-[var(--color-brand-orange)]" />
                            </div>
                            <span className="badge badge-pending">+2 this month</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs font-sans font-bold uppercase tracking-wider mb-1">Labs Completed</p>
                        <p className="font-mono text-4xl text-[var(--color-text-primary)] font-bold">14</p>
                    </div>

                    <div className="bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] zone-green">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <GraduationCap className="w-5 h-5 text-[var(--color-brand-green)]" />
                            </div>
                            <span className="badge badge-success">80% Progress</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs font-sans font-bold uppercase tracking-wider mb-1">Courses Completed</p>
                        <p className="font-mono text-4xl text-[var(--color-text-primary)] font-bold">5</p>
                    </div>

                    <div className="bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Flame className="w-5 h-5 text-[#FF3B30]" />
                            </div>
                            <span className="badge badge-info">Active</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs font-sans font-bold uppercase tracking-wider mb-1">Current Streak</p>
                        <div className="flex items-baseline gap-1">
                            <p className="font-mono text-4xl text-[var(--color-text-primary)] font-bold">4</p>
                            <span className="font-sans font-bold text-[var(--color-text-secondary)]">Days</span>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Quick Actions / Active Work */}
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="font-sans text-xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2">
                            Quick Actions
                        </h2>

                        <a href="http://labs.main.com" className="block bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-orange)] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 ml-1" />
                                </div>
                                <div>
                                    <h3 className="font-sans font-bold text-[var(--color-text-primary)]">Resume Last Lab</h3>
                                    <p className="text-[var(--color-text-secondary)] text-sm font-sans mt-0.5">Advanced Evasion Techniques</p>
                                </div>
                            </div>
                        </a>

                        <a href="http://academy.main.com" className="block bg-[var(--color-surface-card)] p-6 rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-green)] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 ml-1" />
                                </div>
                                <div>
                                    <h3 className="font-sans font-bold text-[var(--color-text-primary)]">Resume Last Course</h3>
                                    <p className="text-[var(--color-text-secondary)] text-sm font-sans mt-0.5">Network Forensics 101</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="font-sans text-xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2 flex items-center justify-between">
                            <span>Recent Activity Feed</span>
                            <span className="text-xs font-mono text-[var(--color-text-tertiary)] uppercase">Last 7 Days</span>
                        </h2>

                        <div className="bg-white border border-[var(--color-border-default)] rounded-[18px] overflow-hidden shadow-[var(--shadow-card)]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--color-surface-card)] border-b border-[var(--color-border-default)]">
                                    <tr>
                                        <th className="py-3 px-5 text-[var(--color-text-secondary)] font-sans font-semibold text-xs tracking-wider uppercase">Event</th>
                                        <th className="py-3 px-5 text-[var(--color-text-secondary)] font-sans font-semibold text-xs tracking-wider uppercase">Type</th>
                                        <th className="py-3 px-5 text-[var(--color-text-secondary)] font-sans font-semibold text-xs tracking-wider uppercase">Date</th>
                                        <th className="py-3 px-5 text-[var(--color-text-secondary)] font-sans font-semibold text-xs tracking-wider uppercase text-right">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border-subtle)] font-sans text-sm">
                                    <tr className="hover:bg-[var(--color-surface-card)] transition-colors">
                                        <td className="py-4 px-5 font-bold text-[var(--color-text-primary)]">Ransomware Investigation</td>
                                        <td className="py-4 px-5"><span className="badge badge-pending border border-orange-200">Lab Sim</span></td>
                                        <td className="py-4 px-5 text-[var(--color-text-secondary)]"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2h ago</span></td>
                                        <td className="py-4 px-5 text-right font-mono font-bold text-[var(--color-brand-purple)]">88/100</td>
                                    </tr>
                                    <tr className="hover:bg-[var(--color-surface-card)] transition-colors">
                                        <td className="py-4 px-5 font-bold text-[var(--color-text-primary)]">Network Forensics Quiz</td>
                                        <td className="py-4 px-5"><span className="badge badge-success border border-green-200">Academy</span></td>
                                        <td className="py-4 px-5 text-[var(--color-text-secondary)]"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Yesterday</span></td>
                                        <td className="py-4 px-5 text-right font-mono font-bold text-[var(--color-text-primary)]">95/100</td>
                                    </tr>
                                    <tr className="hover:bg-[var(--color-surface-card)] transition-colors">
                                        <td className="py-4 px-5 font-bold text-[var(--color-text-primary)]">Credential Harvesting Hunt</td>
                                        <td className="py-4 px-5"><span className="badge badge-pending border border-orange-200">Lab Sim</span></td>
                                        <td className="py-4 px-5 text-[var(--color-text-secondary)]"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 3 days ago</span></td>
                                        <td className="py-4 px-5 text-right font-mono font-bold text-[var(--color-brand-purple)]">72/100</td>
                                    </tr>
                                    <tr className="hover:bg-[var(--color-surface-card)] transition-colors">
                                        <td className="py-4 px-5 font-bold text-[var(--color-text-primary)]">Completed: SOC Analyst Track</td>
                                        <td className="py-4 px-5"><span className="badge badge-success border border-green-200">Academy</span></td>
                                        <td className="py-4 px-5 text-[var(--color-text-secondary)]"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 4 days ago</span></td>
                                        <td className="py-4 px-5 text-right text-[var(--color-brand-green)] font-bold flex items-center justify-end gap-1"><Shield className="w-4 h-4" /> Certified</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="text-right">
                            <Link href="/scores" className="text-[var(--color-brand-blue)] font-sans font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
                                View Full History <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
