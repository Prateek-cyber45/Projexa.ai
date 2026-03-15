"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, PlayCircle, FileText, CheckCircle2, FileDown } from "lucide-react";
import Quiz from "@/components/Quiz";
import { useParams } from "next/navigation";

// Mock course data
const COURSE_DETAILS = {
    id: "net-401",
    title: "Network Forensics & Packet Analysis",
    description: "Learn to identify and dissect anomalous network traffic using tools like Wireshark and Zeek in a simulated enterprise network environment.",
    chapters: [
        { title: "Introduction to Packet Structures", duration: "12m", completed: true },
        { title: "Filtering with Wireshark", duration: "24m", completed: true },
        { title: "Identifying C2 Traffic", duration: "35m", completed: false, active: true },
        { title: "PCAP Analysis Assessment", isQuiz: true },
    ],
};

export default function CourseViewer() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState<"video" | "notes">("video");
    const [showQuiz, setShowQuiz] = useState(false);
    const [scoreResult, setScoreResult] = useState<{ r_score: number; breakdown: any } | null>(null);

    const mockQuestions = [
        {
            id: "q1",
            type: "mcq" as const,
            question: "Which Wireshark filter syntax correctly displays only HTTP GET requests?",
            options: [
                "http.request.method == \"GET\"",
                "http.get == true",
                "tcp.port == 80 && get",
                "http.request.method = GET"
            ]
        },
        {
            id: "q2",
            type: "practical" as const,
            question: "Describe the characteristics of a beaconing C2 connection over DNS in your PCAP analysis.",
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border-default)]">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 border border-[var(--color-border-subtle)] rounded-full hover:bg-[var(--color-surface-card)] transition-colors">
                            <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </Link>
                        <div className="h-6 w-px bg-[var(--color-border-subtle)]"></div>
                        <span className="font-sans font-bold text-[var(--color-text-primary)]">
                            {COURSE_DETAILS.title}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col lg:flex-row">

                {/* Main Viewer Area */}
                <div className="flex-1 border-r border-[var(--color-border-default)] flex flex-col">

                    {showQuiz ? (
                        <div className="flex-1 bg-[var(--color-surface-card)] p-8 overflow-y-auto">
                            {scoreResult ? (
                                <div className="max-w-2xl mx-auto mt-12 bg-white rounded-[18px] p-8 shadow-[var(--shadow-modal)] border border-[var(--color-border-default)] text-center zone-purple">
                                    <div className="w-20 h-20 bg-[#F5EEFF] rounded-full mx-auto flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-[var(--color-brand-purple)]" />
                                    </div>
                                    <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2">Assessment Graded</h2>
                                    <p className="font-sans text-[var(--color-text-secondary)] mb-8">
                                        Your answers were evaluated by the AI Response Scorer.
                                    </p>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-[var(--color-surface-card)] p-4 rounded-[10px]">
                                            <div className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wide mb-1">R_Score</div>
                                            <div className="font-mono text-3xl font-bold text-[var(--color-brand-purple)]">{scoreResult.r_score}</div>
                                        </div>
                                        <div className="bg-[var(--color-surface-card)] p-4 rounded-[10px]">
                                            <div className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wide mb-1">Accuracy</div>
                                            <div className="font-mono text-xl font-bold text-[var(--color-text-primary)]">{scoreResult.breakdown.accuracy}%</div>
                                        </div>
                                        <div className="bg-[var(--color-surface-card)] p-4 rounded-[10px]">
                                            <div className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wide mb-1">Techniques</div>
                                            <div className="font-mono text-xl font-bold text-[var(--color-text-primary)]">{scoreResult.breakdown.technique_coverage}%</div>
                                        </div>
                                        <div className="bg-[var(--color-surface-card)] p-4 rounded-[10px]">
                                            <div className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wide mb-1">Completeness</div>
                                            <div className="font-mono text-xl font-bold text-[var(--color-text-primary)]">{scoreResult.breakdown.completeness}%</div>
                                        </div>
                                    </div>

                                    <button className="bg-[var(--color-brand-green)] text-white px-8 py-3 rounded-full font-sans font-bold hover:bg-[#2EAD4E] transition-colors shadow-sm inline-flex items-center gap-2">
                                        Claim Certificate <FileDown className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto py-8">
                                    <Quiz questions={mockQuestions} onComplete={setScoreResult} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Video Player Placeholder */}
                            <div className="w-full aspect-video bg-[#1D1D1F] relative flex items-center justify-center border-b border-[var(--color-border-subtle)]">
                                <div className="text-center">
                                    <PlayCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                                    <p className="font-mono text-sm text-[var(--color-text-tertiary)] uppercase tracking-wider">Video Embedded Player</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-[var(--color-border-default)] px-6">
                                <button
                                    onClick={() => setActiveTab("video")}
                                    className={`px-6 py-4 font-sans font-semibold text-sm border-b-2 transition-colors ${activeTab === 'video' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    Lesson Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab("notes")}
                                    className={`px-6 py-4 font-sans font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    <FileText className="w-4 h-4" /> My Notes
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 flex-1 bg-[var(--color-surface-main)]">
                                {activeTab === "video" ? (
                                    <div className="prose max-w-none font-sans text-[var(--color-text-primary)]">
                                        <h2 className="font-display text-2xl font-bold mb-4">Identifying C2 Traffic</h2>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                            {COURSE_DETAILS.description}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <textarea
                                            placeholder="Type your notes here. They are auto-saved per lesson..."
                                            className="flex-1 w-full bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[14px] p-6 focus:outline-none focus:border-[var(--color-brand-green)] font-sans text-[var(--color-text-primary)] resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 bg-[var(--color-surface-card)] flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
                    <div className="p-6 border-b border-[var(--color-border-subtle)]">
                        <h3 className="font-sans font-bold text-lg text-[var(--color-text-primary)] mb-1">Chapters</h3>
                        <p className="font-sans text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">
                            {COURSE_DETAILS.chapters.filter(c => c.completed).length} / {COURSE_DETAILS.chapters.length} Completed
                        </p>
                    </div>

                    <div className="p-4 space-y-2">
                        {COURSE_DETAILS.chapters.map((ch, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (ch.isQuiz) setShowQuiz(true);
                                    else setShowQuiz(false);
                                }}
                                className={`w-full text-left p-4 rounded-[12px] flex items-start gap-4 transition-colors ${ch.active || (ch.isQuiz && showQuiz)
                                        ? "bg-white border border-[var(--color-brand-green)] shadow-sm"
                                        : "hover:bg-[var(--color-border-subtle)]"
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {ch.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-green)]" />
                                    ) : ch.isQuiz ? (
                                        <FileText className={`w-5 h-5 ${showQuiz ? 'text-[var(--color-brand-purple)]' : 'text-[var(--color-text-tertiary)]'}`} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-[var(--color-text-tertiary)] flex items-center justify-center">
                                            {ch.active && <div className="w-2 h-2 rounded-full bg-[var(--color-brand-green)]" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-sans font-semibold text-sm leading-tight ${ch.active || (ch.isQuiz && showQuiz) ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                                        }`}>
                                        {ch.title}
                                    </p>
                                    {ch.duration && (
                                        <p className="font-sans text-xs text-[var(--color-text-tertiary)] mt-1">
                                            {ch.duration}
                                        </p>
                                    )}
                                    {ch.isQuiz && (
                                        <span className="badge badge-ai mt-2 !text-[10px]">ASSESSMENT</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
