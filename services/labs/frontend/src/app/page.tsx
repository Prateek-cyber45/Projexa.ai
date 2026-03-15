"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Shield, Search, Terminal, ArrowRight, Award } from "lucide-react";

// Mock data for labs
const LABS = [
  {
    id: "soc-sim-alpha",
    title: "SOC Simulator: Credential Stuffing Attack",
    type: "SOC",
    difficulty: "Intermediate",
    duration: "45m",
    lastScore: 82,
    status: "Completed",
  },
  {
    id: "ir-ransomware",
    title: "IR: Ransomware Containment",
    type: "Incident Response",
    difficulty: "Advanced",
    duration: "1h 30m",
    lastScore: null,
    status: "Not Started",
  },
  {
    id: "forensics-pcap",
    title: "Forensics: Data Exfiltration Analysis",
    type: "Forensics",
    difficulty: "Expert",
    duration: "2h 00m",
    lastScore: 65,
    status: "Failed",
  },
  {
    id: "hunt-av-evasion",
    title: "Threat Hunting: AV Evasion Tactics",
    type: "Threat Hunting",
    difficulty: "Advanced",
    duration: "1h 15m",
    lastScore: null,
    status: "Not Started",
  },
];

export default function LabCatalogue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredLabs = LABS.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || l.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border-subtle)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--color-brand-orange)]" />
            <span className="font-display font-bold text-xl tracking-wide text-[var(--color-text-primary)]">
              Cyber Range
            </span>
            <div className="ml-4 pl-4 border-l border-[var(--color-border-subtle)] hidden md:flex items-center gap-6 font-sans font-semibold text-sm">
              <a href="http://main.com/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Dashboard</a>
              <a href="http://academy.main.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Academy</a>
              <Link href="/" className="text-[var(--color-brand-orange)] border-b-2 border-[var(--color-brand-orange)] h-16 inline-flex items-center">Labs Catalogue</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="font-sans font-bold text-[var(--color-text-primary)] text-sm">Operator</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border-default)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[var(--color-brand-blue)]" />
            </div>
          </div>
        </div>
      </nav>

      {/* Header & Controls */}
      <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-border-subtle)] py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="ping-dot ping-orange" />
            <span className="text-[var(--color-brand-orange)] font-mono text-sm font-bold tracking-wider uppercase">Live Air-Gapped Environment</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Interactive Scenarios
          </h1>
          <p className="font-sans text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl">
            Deploy secure honeypots and isolated VMs to practice your skills against live simulated threat actors. Your actions will be streamed and scored by the AI engine.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand-orange)] transition-colors" />
              <input
                type="text"
                placeholder="Search by scenario name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--color-border-default)] rounded-[10px] shadow-sm font-sans focus:outline-none focus:border-[var(--color-brand-orange)] focus:ring-4 focus:ring-[var(--color-brand-orange)]/20 transition-all text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {["All", "SOC", "Incident Response", "Forensics", "Threat Hunting"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-3 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-colors border ${filterType === type
                      ? "bg-[var(--color-brand-orange)] text-white border-[var(--color-brand-orange)] shadow-sm"
                      : "bg-white text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-surface-card)] hover:border-[var(--color-border-subtle)]"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Lab Grid */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="group bg-[var(--color-surface-card)] rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all flex flex-col overflow-hidden"
            >
              {/* Card top banner */}
              <div className="h-32 bg-[#1D1D1F] relative p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700">
                  <Terminal className="w-48 h-48 text-white" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <span className={`badge ${lab.difficulty === 'Intermediate' ? 'badge-pending' : lab.difficulty === 'Advanced' ? 'bg-[#FFF0EE] text-[#C4291C]' : lab.difficulty === 'Expert' ? 'bg-[#AF52DE] text-white border border-white/20' : 'badge-info'}`}>
                    {lab.difficulty}
                  </span>
                  {lab.lastScore !== null && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      <Award className={`w-4 h-4 ${lab.lastScore >= 80 ? 'text-[var(--color-brand-green)]' : lab.lastScore >= 60 ? 'text-[var(--color-brand-orange)]' : 'text-[#FF3B30]'}`} />
                      <span className="font-mono text-sm text-white font-bold">{lab.lastScore}</span>
                    </div>
                  )}
                </div>

                <span className="font-mono text-xs text-[var(--color-brand-orange)] uppercase tracking-wider relative z-10">{lab.type} / {lab.duration}</span>
              </div>

              {/* Card content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-sans font-bold text-xl text-[var(--color-text-primary)] mb-6 line-clamp-2">
                  {lab.title}
                </h3>

                <div className="mt-auto pt-6 border-t border-[var(--color-border-subtle)]">
                  <Link
                    href={`/simulator/${lab.id}`}
                    className="w-full py-3 rounded-full font-sans font-bold flex items-center justify-center gap-2 transition-colors bg-[var(--color-surface-main)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] shadow-sm"
                  >
                    Deploy Range <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredLabs.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[var(--color-border-subtle)]">
                <Search className="w-8 h-8 text-[var(--color-text-tertiary)]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">No scenarios found</h3>
              <p className="font-sans text-[var(--color-text-secondary)]">Adjust your filters to see more available labs.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
