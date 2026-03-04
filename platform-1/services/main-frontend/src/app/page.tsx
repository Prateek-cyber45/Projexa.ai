import Link from "next/link";
import { ArrowRight, Shield, Activity, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-main)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border-subtle)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--color-brand-blue)]" />
            <span className="font-display font-bold text-xl tracking-wide text-[var(--color-text-primary)]">
              CyberPlatform
            </span>
          </div>
          <div className="flex items-center gap-6 font-sans font-semibold text-sm">
            <Link href="#features" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Features</Link>
            <Link href="#labs" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Labs</Link>
            <Link href="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Sign In</Link>
            <Link
              href="/register"
              className="bg-[var(--color-brand-blue)] text-white px-5 py-2 rounded-full hover:bg-[var(--color-brand-blue-hover)] transition-all shadow-[var(--shadow-card)] font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[var(--color-surface-dark)] text-white pt-32 pb-40 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-sans font-semibold mb-8 text-[var(--color-text-inverted)] border border-white/20">
            <span className="ping-dot bg-[var(--color-brand-blue)]" />
            <span>Delta Node 5 Now Live</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Advanced Cybersecurity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-purple)]">
              Training Platform
            </span>
          </h1>

          <p className="font-sans text-xl text-[var(--color-text-tertiary)] mb-10 max-w-2xl mx-auto">
            Combines a structured Learning Management System, a hands-on Cyber Range, and an AI-powered dual scoring engine.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-[var(--color-brand-blue)] text-white px-8 py-3.5 rounded-full font-sans font-bold text-lg hover:bg-[var(--color-brand-blue-hover)] transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              Start Learning <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#platform"
              className="bg-white/10 text-white px-8 py-3.5 rounded-full font-sans font-semibold text-lg hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 bg-[var(--color-surface-main)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-wide text-[var(--color-text-primary)]">Unified Architecture</h2>
            <p className="text-[var(--color-text-secondary)] font-sans text-lg mt-4 max-w-2xl mx-auto">
              Everything you need to master cybersecurity, isolated in dedicated subdomains but unified by a single AI engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--color-surface-card)] p-8 rounded-[18px] border-l-4 border-[var(--color-brand-green)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Target className="w-6 h-6 text-[var(--color-brand-green)]" />
              </div>
              <h3 className="font-sans font-bold text-xl mb-3 text-[var(--color-text-primary)] relative">
                Academy LMS
              </h3>
              <p className="text-[var(--color-text-secondary)] font-sans leading-relaxed mb-6">
                Structured learning modules, video lessons, and interactive quizzes. Track your progress dynamically as you tackle complex concepts.
              </p>
              <Link href="/academy" className="text-[var(--color-brand-green)] font-semibold font-sans inline-flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--color-surface-card)] p-8 rounded-[18px] border-l-4 border-[var(--color-brand-orange)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Activity className="w-6 h-6 text-[var(--color-brand-orange)]" />
              </div>
              <h3 className="font-sans font-bold text-xl mb-3 text-[var(--color-text-primary)]">
                Live Cyber Range
              </h3>
              <p className="text-[var(--color-text-secondary)] font-sans leading-relaxed mb-6">
                Interactive browser-based terminal connected to an isolated honeypot. Practice threat hunting and incident response in real-time.
              </p>
              <Link href="/labs" className="text-[var(--color-brand-orange)] font-semibold font-sans inline-flex items-center gap-1 hover:gap-2 transition-all">
                Explore Labs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--color-surface-card)] p-8 rounded-[18px] border-l-4 border-[var(--color-brand-purple)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Target className="w-6 h-6 text-[var(--color-brand-purple)]" />
              </div>
              <h3 className="font-sans font-bold text-xl mb-3 text-[var(--color-text-primary)]">
                AI Dual Scoring
              </h3>
              <p className="text-[var(--color-text-secondary)] font-sans leading-relaxed mb-6">
                Real-time behavior tracking + NLP response evaluation. We score not just what you submit, but exactly how you execute it.
              </p>
              <Link href="/ai-engine" className="text-[var(--color-brand-purple)] font-semibold font-sans inline-flex items-center gap-1 hover:gap-2 transition-all">
                See how it works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-main)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between text-[var(--color-text-tertiary)] font-sans text-sm">
          <p>© {new Date().getFullYear()} CyberPlatform. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}