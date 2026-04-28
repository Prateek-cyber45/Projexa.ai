"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Cpu } from "lucide-react";

interface LiveScoreWidgetProps {
    sessionId: string;
}

export default function LiveScoreWidget({ sessionId }: LiveScoreWidgetProps) {
    const [bScore, setBScore] = useState(50);
    const [confidence, setConfidence] = useState(85);
    const [skillLabel, setSkillLabel] = useState("Intermediate");

    // In a real app, this would connect to a WebSocket or SSE from the AI Scoring Engine
    useEffect(() => {
        const interval = setInterval(() => {
            // Mocking live score fluctuations based on simulated telemetry
            setBScore((prev) => {
                const delta = (Math.random() - 0.4) * 3; // slight upward trend
                const newValue = Math.min(Math.max(prev + delta, 0), 100);

                // Update skill label based on mock value
                if (newValue < 20) setSkillLabel("Novice");
                else if (newValue < 40) setSkillLabel("Beginner");
                else if (newValue < 70) setSkillLabel("Intermediate");
                else if (newValue < 90) setSkillLabel("Advanced");
                else setSkillLabel("Expert");

                return Number(newValue.toFixed(1));
            });

            setConfidence((prev) => {
                const delta = (Math.random() - 0.5) * 5;
                return Number(Math.min(Math.max(prev + delta, 70), 99.9).toFixed(1));
            });
        }, 3000); // UI updates every 30s in requirements, using 3s here for visual effect in MVP

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[var(--color-surface-card)] rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[#1D1D1F] text-white">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[var(--color-brand-orange)]" />
                    <span className="font-sans font-bold text-sm tracking-wide">AI Telemetry</span>
                </div>
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-orange)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-brand-orange)]"></span>
                </span>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <p className="text-[var(--color-text-secondary)] text-xs font-sans font-bold uppercase tracking-wider mb-2">
                        Real-Time B_Score
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="font-mono text-5xl font-bold text-[var(--color-text-primary)] tracking-tighter">
                            {bScore}
                        </span>
                        <span className="font-sans text-[var(--color-text-tertiary)] font-bold mb-1">/ 100</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-sans font-semibold mb-1">
                            <span className="text-[var(--color-text-secondary)]">Skill Assessment</span>
                            <span className="text-[var(--color-brand-blue)] bg-[rgba(78,166,255,0.16)] px-2 py-0.5 rounded-full border border-[rgba(78,166,255,0.32)]">{skillLabel}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-sans font-semibold mb-1">
                            <span className="text-[var(--color-text-secondary)]">Model Confidence</span>
                            <span className="text-[var(--color-text-primary)]">{confidence}%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border-subtle)] rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-[var(--color-brand-blue)] h-1.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${confidence}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
