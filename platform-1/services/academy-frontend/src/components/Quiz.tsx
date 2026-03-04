"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

type Question = {
    id: string;
    type: "mcq" | "practical";
    question: string;
    options?: string[]; // only for mcq
};

interface QuizProps {
    questions: Question[];
    onComplete: (score: { r_score: number; breakdown: any }) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const activeQ = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;

    const handleNext = () => {
        if (!isLast) setCurrentIdx(currentIdx + 1);
    };

    const handlePrev = () => {
        if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // Simulate API call to AI Response Scorer
        await new Promise((r) => setTimeout(r, 1500));
        setSubmitting(false);

        // Mock completion
        onComplete({
            r_score: 85,
            breakdown: {
                accuracy: 90,
                completeness: 80,
                technique_coverage: 85,
                time_bonus: 0,
            }
        });
    };

    return (
        <div className="bg-[var(--color-surface-card)] rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-elevated)] overflow-hidden">

            {/* Quiz Header */}
            <div className="bg-[#1D1D1F] text-white p-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                    <h3 className="font-display font-bold text-xl mb-1">Module Assessment</h3>
                    <p className="font-sans text-sm text-[var(--color-text-tertiary)] flex items-center gap-2">
                        <span className="ping-dot ping-purple" />
                        AI Graded (R_score)
                    </p>
                </div>
                <div className="font-mono text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    Question {currentIdx + 1} / {questions.length}
                </div>
            </div>

            {/* Question Body */}
            <div className="p-8">
                <h4 className="font-sans font-semibold text-[var(--color-text-primary)] text-lg mb-6">
                    {activeQ.question}
                </h4>

                {activeQ.type === "mcq" && activeQ.options && (
                    <div className="space-y-3">
                        {activeQ.options.map((opt, i) => (
                            <label
                                key={i}
                                className={`flex items-start gap-3 p-4 border rounded-[10px] cursor-pointer transition-all ${answers[activeQ.id] === opt
                                        ? "border-[var(--color-brand-purple)] bg-[#F5EEFF] shadow-[var(--shadow-focus)]"
                                        : "border-[var(--color-border-default)] bg-[var(--color-surface-main)] hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-card)]"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={activeQ.id}
                                    value={opt}
                                    checked={answers[activeQ.id] === opt}
                                    onChange={(e) => setAnswers({ ...answers, [activeQ.id]: e.target.value })}
                                    className="mt-1 w-4 h-4 text-[var(--color-brand-purple)] border-[var(--color-border-default)] focus:ring-[var(--color-brand-purple)]"
                                />
                                <span className="font-sans text-[var(--color-text-primary)] leading-snug">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}

                {activeQ.type === "practical" && (
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[var(--color-brand-purple)] text-sm font-sans font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Free Text / Practical Answer</span>
                        </div>
                        <textarea
                            rows={5}
                            placeholder="Provide a detailed explanation or command sequence..."
                            value={answers[activeQ.id] || ""}
                            onChange={(e) => setAnswers({ ...answers, [activeQ.id]: e.target.value })}
                            className="w-full bg-[var(--color-surface-main)] border border-[var(--color-border-default)] rounded-[10px] p-4 text-[var(--color-text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--color-brand-purple)] focus:ring-4 focus:ring-[var(--color-brand-purple)]/30 transition-all resize-none shadow-sm"
                        />
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            <div className="bg-[var(--color-surface-main)] p-6 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="px-5 py-2 font-sans font-semibold text-[var(--color-text-secondary)] rounded-full hover:bg-[var(--color-surface-card)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {isLast ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !answers[activeQ.id]}
                        className="px-6 py-2.5 font-sans font-bold bg-[var(--color-brand-purple)] text-white gap-2 flex items-center justify-center rounded-full hover:bg-[#9B41C5] transition-colors shadow-sm disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Scoring"}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!answers[activeQ.id]}
                        className="px-6 py-2.5 font-sans font-bold bg-[var(--color-text-primary)] text-white flex items-center gap-2 rounded-full hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>

        </div>
    );
}
