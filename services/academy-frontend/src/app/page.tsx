"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Shield, Search, Filter, Clock, ArrowRight } from "lucide-react";

// Mock data for courses
const COURSES = [
  {
    id: "net-401",
    title: "Network Forensics & Packet Analysis",
    category: "Forensics",
    difficulty: "Advanced",
    duration: "4h 30m",
    progress: 80,
    status: "In Progress",
  },
  {
    id: "soc-101",
    title: "SOC Analyst Fundamentals",
    category: "SOC",
    difficulty: "Beginner",
    duration: "2h 15m",
    progress: 100,
    status: "Completed",
  },
  {
    id: "ir-202",
    title: "Ransomware Incident Response",
    category: "Incident Response",
    difficulty: "Intermediate",
    duration: "5h 00m",
    progress: 0,
    status: "Not Started",
  },
  {
    id: "soc-305",
    title: "Threat Hunting with ELK Stack",
    category: "Threat Hunting",
    difficulty: "Intermediate",
    duration: "3h 45m",
    progress: 0,
    status: "Not Started",
  },
  {
    id: "mal-501",
    title: "Advanced Malware Reverse Engineering",
    category: "Reverse Engineering",
    difficulty: "Expert",
    duration: "8h 00m",
    progress: 15,
    status: "In Progress",
  },
];

export default function CoursePortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const filteredCourses = COURSES.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === "All" || c.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface-main)] flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border-subtle)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[var(--color-brand-green)]" />
            <span className="font-display font-bold text-xl tracking-wide text-[var(--color-text-primary)]">
              Academy
            </span>
            <div className="ml-4 pl-4 border-l border-[var(--color-border-subtle)] hidden md:flex items-center gap-6 font-sans font-semibold text-sm">
              <a href="http://main.com/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Dashboard</a>
              <Link href="/" className="text-[var(--color-brand-green)] border-b-2 border-[var(--color-brand-green)] h-16 inline-flex items-center">Course Portal</Link>
              <a href="http://labs.main.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-16 inline-flex items-center">Labs</a>
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
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Training Modules
          </h1>
          <p className="font-sans text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl">
            Master the necessary skills through interactive videos, quizzes, and structured learning paths before deploying to the cyber range.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand-green)] transition-colors" />
              <input
                type="text"
                placeholder="Search by module name or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--color-border-default)] rounded-[10px] shadow-sm font-sans focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/20 transition-all text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {["All", "Beginner", "Intermediate", "Advanced", "Expert"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-5 py-3 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-colors border ${filterDifficulty === diff
                      ? "bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)] shadow-sm"
                      : "bg-white text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-surface-card)] hover:border-[var(--color-border-subtle)]"
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Course Grid */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group bg-[var(--color-surface-card)] rounded-[18px] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all flex flex-col overflow-hidden"
            >
              {/* Card top banner */}
              <div className="h-32 bg-[var(--color-surface-main)] border-b border-[var(--color-border-subtle)] relative p-6 flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-green)] opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start">
                  <span className={`badge ${course.difficulty === 'Beginner' ? 'badge-info' : course.difficulty === 'Intermediate' ? 'badge-pending' : course.difficulty === 'Advanced' ? 'bg-[#FFF0EE] text-[#C4291C]' : 'bg-[#1D1D1F] text-white'}`}>
                    {course.difficulty}
                  </span>
                  <span className="text-[var(--color-text-secondary)] font-sans font-semibold text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {course.duration}
                  </span>
                </div>

                <span className="font-mono text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">{course.category}</span>
              </div>

              {/* Card content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-sans font-bold text-xl text-[var(--color-text-primary)] mb-6 line-clamp-2">
                  {course.title}
                </h3>

                <div className="mt-auto">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center mb-2 font-sans text-xs font-semibold">
                    <span className={course.status === 'Completed' ? 'text-[var(--color-brand-green)]' : 'text-[var(--color-text-secondary)]'}>
                      {course.status}
                    </span>
                    <span className="text-[var(--color-text-primary)]">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-border-subtle)] rounded-full h-2 mb-6 overflow-hidden">
                    <div
                      className="bg-[var(--color-brand-green)] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/course/${course.id}`}
                    className={`w-full py-3 rounded-full font-sans font-bold flex items-center justify-center gap-2 transition-colors ${course.progress === 100
                        ? 'bg-[var(--color-surface-main)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]'
                        : 'bg-[var(--color-brand-green)] text-white hover:bg-[#2EAD4E] shadow-sm'
                      }`}
                  >
                    {course.progress === 0 ? "Start Module" : course.progress === 100 ? "Review Module" : "Resume Module"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[var(--color-border-subtle)]">
                <Search className="w-8 h-8 text-[var(--color-text-tertiary)]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">No modules found</h3>
              <p className="font-sans text-[var(--color-text-secondary)]">Adjust your search or active filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
