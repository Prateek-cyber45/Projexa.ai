'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const labs = [
  { id: 'soc-sim-alpha', name: 'SOC Simulator: Credential Stuffing Attack', level: 'Intermediate', eta: '45m' },
  { id: 'ir-ransomware', name: 'IR: Ransomware Containment', level: 'Advanced', eta: '1h 30m' },
  { id: 'forensics-pcap', name: 'Forensics: Data Exfiltration Analysis', level: 'Expert', eta: '2h 00m' },
  { id: 'hunt-av-evasion', name: 'Threat Hunting: AV Evasion Tactics', level: 'Advanced', eta: '1h 15m' },
];

const MaterialIcon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function LabsLandingPage() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' },
    );

    revealElements.forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  return (
    <div className="bg-[#131313] text-[#e2e2e2] min-h-screen noise">
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/90 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link href="http://main.com" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ADC7FF] to-[#4A8EFF] flex items-center justify-center">
              <MaterialIcon name="security" className="text-[#00285b]" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-white group-hover:text-[#ADC7FF] transition-colors">Deep Hunt</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="http://academy.main.com" className="font-medium text-sm text-[#C1C6D7] hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg">Academy</Link>
            <Link href="/" className="font-bold text-sm text-[#ADC7FF] bg-[#ADC7FF]/10 px-4 py-2 rounded-lg">Labs</Link>
            <Link href="http://main.com#ecosystem" className="font-medium text-sm text-[#C1C6D7] hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg">AI Scoring</Link>
          </div>

          <Link href="http://main.com#demo-section" className="bg-gradient-to-r from-[#ADC7FF] to-[#4A8EFF] text-[#00285b] px-5 py-2.5 font-bold text-sm rounded-lg">
            Contact
          </Link>
        </div>
      </nav>

      <main>
        <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-24">
          <div className="video-bg-container">
            <img src="/luminas_art-new-year-background-3608029.jpg" alt="labs-bg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="video-overlay"></div>
            <div className="video-overlay-radial"></div>
          </div>
          <div className="absolute inset-0 grid-bg opacity-45 z-[3]" />

          <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-10 grid grid-cols-12 gap-8 items-center">
            <div className="col-span-12 lg:col-span-8">
              <div className="reveal inline-flex items-center gap-2 bg-[#ADC7FF]/10 border border-[#ADC7FF]/20 rounded-lg px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></span>
                <span className="text-[#ADC7FF] tracking-[0.15em] font-medium uppercase text-xs">Live Environments</span>
              </div>

              <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-7 text-white">
                PRACTICE IN <br />
                <span className="text-gradient">BATTLE CONDITIONS</span>
              </h1>

              <p className="reveal reveal-delay-2 text-[#C1C6D7] max-w-2xl text-base md:text-lg leading-relaxed mb-10">
                Execute incident response, SOC triage, and threat hunting workflows inside controlled cyber ranges with AI-scored telemetry.
              </p>

              <div className="reveal reveal-delay-3 flex flex-wrap gap-4">
                <Link href="/simulator/soc-sim-alpha" className="bg-gradient-to-r from-[#ADC7FF] to-[#4A8EFF] text-[#00285b] px-8 py-3.5 font-extrabold rounded-lg">
                  DEPLOY RANGE
                </Link>
                <Link href="http://academy.main.com" className="border border-white/20 text-white px-8 py-3.5 font-bold rounded-lg hover:bg-white/5 transition-colors">
                  LEARN FIRST
                </Link>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 hidden lg:flex flex-col gap-5">
              <div className="glass-panel border border-white/10 rounded-2xl p-6 reveal reveal-delay-2">
                <p className="text-xs uppercase tracking-[0.25em] text-[#ADC7FF] mb-2">Active Nodes</p>
                <p className="text-3xl font-extrabold text-white">18</p>
              </div>
              <div className="glass-panel border border-white/10 rounded-2xl p-6 reveal reveal-delay-3">
                <p className="text-xs uppercase tracking-[0.25em] text-[#ADC7FF] mb-2">Current Accuracy</p>
                <p className="text-3xl font-extrabold text-white">97.8%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-10 max-w-screen-2xl mx-auto">
          <div className="reveal mb-14">
            <span className="text-[#ADC7FF] font-mono text-xs tracking-[0.3em] uppercase block mb-4">// Simulation Catalog</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Live Scenarios</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#ADC7FF] to-[#4A8EFF] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labs.map((lab, index) => (
              <div key={lab.id} className={`card-glow bg-[#1f1f1f] border border-white/5 rounded-2xl p-8 reveal reveal-delay-${(index % 3) + 1}`}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 px-3 py-1 rounded-md">
                    {lab.level}
                  </span>
                  <span className="text-xs text-[#C1C6D7]">{lab.eta}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{lab.name}</h3>
                <p className="text-[#C1C6D7] text-sm mb-6">Interactive terminal and timeline-driven simulation with behavior-based scoring.</p>
                <Link href={`/simulator/${lab.id}`} className="inline-flex items-center gap-2 text-[#ADC7FF] font-bold text-sm tracking-wider uppercase">
                  Launch Scenario <MaterialIcon name="arrow_forward" className="text-base" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 md:px-10 bg-[#0e0e0e]">
          <div className="max-w-screen-2xl mx-auto text-center reveal">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-6">
              READY TO <span className="text-gradient">RESPOND FAST?</span>
            </h2>
            <p className="text-[#C1C6D7] text-lg max-w-2xl mx-auto mb-10">
              Run scenarios, receive live behavior telemetry, and improve your team’s response confidence with measurable outcomes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/simulator/ir-ransomware" className="bg-white text-[#131313] px-10 py-4 font-extrabold rounded-xl hover:bg-[#ADC7FF] transition-colors">
                START INCIDENT DRILL
              </Link>
              <Link href="http://academy.main.com" className="glass-panel border border-white/15 text-white px-10 py-4 font-extrabold rounded-xl hover:bg-white/5 transition-colors">
                OPEN ACADEMY
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
