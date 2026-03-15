"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import LiveScoreWidget from "@/components/LiveScoreWidget";
import { Copy, FileDown, ShieldAlert, ArrowLeft, Loader2, PlayCircle, Minimize2, Maximize2 } from "lucide-react";

export default function SOCSimulator() {
    const router = useRouter();
    const params = useParams();
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm.js
        const fitAddon = new FitAddon();
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: 15,
            theme: {
                background: '#1D1D1F',
                foreground: '#F5F5F7',
                cursor: '#FF6B00',
                selectionBackground: 'rgba(255, 107, 0, 0.3)',
            },
            allowProposedApi: true,
        });

        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current = term;

        // Mock connection
        term.writeln('\x1b[38;5;214m[SYSTEM]\x1b[0m Establishing secure connection to Honeypot (Cowrie)...');

        setTimeout(() => {
            term.writeln('\x1b[38;5;46m[SYSTEM]\x1b[0m Connection established.');
            term.writeln('');
            term.writeln('Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-53-generic x86_64)');
            term.writeln('');
            term.writeln(' * Documentation:  https://help.ubuntu.com');
            term.writeln(' * Management:     https://landscape.canonical.com');
            term.writeln(' * Support:        https://ubuntu.com/advantage');
            term.writeln('');
            term.write('operator@lab-env:~$ ');
            setIsConnected(true);
        }, 1500);

        // Basic local echo for MVP
        let input = "";
        term.onData((data: string) => {
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                term.writeln('');
                // Mock simple command responses
                if (input.trim() === "ls") {
                    term.writeln('\x1b[38;5;33msystem_logs\x1b[0m  auth.log  \x1b[38;5;196msuspicious_binary.elf\x1b[0m');
                } else if (input.trim() === "whoami") {
                    term.writeln('operator');
                } else if (input.trim() !== "") {
                    term.writeln(`bash: ${input}: command not found`);
                }
                term.write('operator@lab-env:~$ ');
                input = "";
            } else if (code === 127 || code === 8) { // Backspace
                if (input.length > 0) {
                    term.write('\b \b');
                    input = input.slice(0, -1);
                }
            } else {
                input += data;
                term.write(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col font-sans">

            {/* Header */}
            <nav className="bg-[#1D1D1F] text-white border-b border-white/10 shrink-0">
                <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white/70" />
                        </button>
                        <div className="h-5 w-px bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-[var(--color-brand-orange)]" />
                            <span className="font-bold tracking-wide">SOC Simulator</span>
                            <span className="badge badge-info ml-2 border-white/20 text-[10px] px-2 py-0.5 text-white">Advanced</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 font-mono text-xs text-white/80">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#32D74B] shadow-[0_0_8px_#32D74B]' : 'bg-[var(--color-brand-orange)] animate-pulse'}`}></span>
                            {isConnected ? '172.16.4.10 (Connected)' : 'Connecting...'}
                        </div>
                        <button className="bg-[var(--color-brand-orange)] hover:bg-[#E05E00] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors">
                            Submit Report
                        </button>
                    </div>
                </div>
            </nav>

            {/* Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Playbook / Tasks Sidebar */}
                <div className="w-full lg:w-80 bg-[var(--color-surface-card)] border-r border-[var(--color-border-default)] flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-5 border-b border-[var(--color-border-subtle)]">
                        <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-1">Playbook Tasks</h2>
                        <p className="font-sans text-xs text-[var(--color-text-secondary)]">Complete these objectives to investigate the alert.</p>
                    </div>

                    <div className="flex-1 p-5 space-y-4">

                        <div className="border border-[var(--color-border-subtle)] rounded-[12px] p-4 bg-white shadow-sm">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-[var(--color-brand-orange)] border-[var(--color-border-subtle)] focus:ring-[var(--color-brand-orange)] rounded-sm" />
                                <div>
                                    <h4 className="font-sans font-bold text-[var(--color-text-primary)] text-sm mb-1">Analyze auth.log</h4>
                                    <p className="font-sans text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                        Identify the source IP responsible for the SSH brute force attack in /var/log/auth.log.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[var(--color-border-subtle)] rounded-[12px] p-4 bg-white shadow-sm">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-[var(--color-brand-orange)] border-[var(--color-border-subtle)] focus:ring-[var(--color-brand-orange)] rounded-sm" />
                                <div>
                                    <h4 className="font-sans font-bold text-[var(--color-text-primary)] text-sm mb-1">Identify dropped payload</h4>
                                    <p className="font-sans text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                        Locate exactly which binary was downloaded by the attacker post-compromise.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[var(--color-border-subtle)] rounded-[12px] p-4 bg-[var(--color-surface-main)] shadow-sm">
                            <h4 className="font-sans font-bold text-[var(--color-text-primary)] text-xs uppercase tracking-wider mb-2 text-center text-[var(--color-text-tertiary)]">Clipboard</h4>
                            <button className="w-full text-left bg-white border border-[var(--color-border-subtle)] rounded-lg p-3 text-xs font-mono text-[var(--color-text-secondary)] hover:border-[var(--color-brand-orange)] transition-colors flex justify-between items-center group">
                                <span className="truncate mr-2">grep "Failed password" auth.log</span>
                                <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-[var(--color-brand-orange)]" />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Terminal Area */}
                <div className={`flex-1 flex flex-col bg-[#000000] relative ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

                    {/* Terminal Toolbar */}
                    <div className="bg-[#1D1D1F] border-b border-white/10 h-10 flex items-center justify-between px-4 text-white/50 z-10">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                                <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
                            </div>
                            <span className="font-mono text-xs">operator@lab-env: ~</span>
                        </div>

                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="hover:text-white transition-colors p-1 rounded"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Xterm Container */}
                    <div
                        className="flex-1 w-full p-4 overflow-hidden relative"
                        ref={terminalRef}
                        style={{ minHeight: isFullscreen ? '100vh' : '400px' }}
                    >
                        {/* Terminal attaches here */}
                        {!isConnected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#1D1D1F]/80 backdrop-blur-sm z-20">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 text-[var(--color-brand-orange)] animate-spin mx-auto mb-4" />
                                    <p className="font-mono text-white/70 tracking-wider">PROVISIONING CONTAINER</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Score Sidebar */}
                <div className="w-full lg:w-72 bg-[var(--color-surface-main)] border-l border-[var(--color-border-default)] p-6 shrink-0 flex flex-col overflow-y-auto">
                    <LiveScoreWidget sessionId={params.id as string} />

                    <div className="mt-6">
                        <h3 className="font-sans font-bold text-sm text-[var(--color-text-primary)] mb-3">Session Metadata</h3>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-2">
                                <span className="text-[var(--color-text-tertiary)] uppercase tracking-wider">Duration</span>
                                <span className="text-[var(--color-text-primary)] font-bold">14:02</span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-2">
                                <span className="text-[var(--color-text-tertiary)] uppercase tracking-wider">Keystrokes</span>
                                <span className="text-[var(--color-text-primary)] font-bold">1,204</span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-2">
                                <span className="text-[var(--color-text-tertiary)] uppercase tracking-wider">Events</span>
                                <span className="text-[var(--color-text-primary)] font-bold">84</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
