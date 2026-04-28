-- ================================================================
-- DeepHunt Platform — Database Initialization Script
-- Runs automatically when Postgres container starts for the first time
-- via Docker volume mount to /docker-entrypoint-initdb.d/
-- ================================================================

-- ────────────────────────────────────────
-- Core User Tables
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    tier VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    fullname VARCHAR(255),
    country VARCHAR(255),
    timezone VARCHAR(255),
    callingcode VARCHAR(50),
    phone VARCHAR(50),
    website VARCHAR(255)
);

-- ────────────────────────────────────────
-- Scoring & Lab Data
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score REAL NOT NULL,
    lab_id VARCHAR(100) DEFAULT 'soc-sim-alpha',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);

-- ────────────────────────────────────────
-- Academy Module Tables
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50),
    duration VARCHAR(50),
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'enrolled',
    score REAL DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);

CREATE TABLE IF NOT EXISTS user_certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    certificate_hash VARCHAR(255) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────
-- Audit Log (Security & Observability)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    actor_ip VARCHAR(45),
    actor_id INTEGER,
    detail JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ────────────────────────────────────────
-- AI Assistant History
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_created ON ai_chats(created_at ASC);

-- ────────────────────────────────────────
-- Seed Data — Academy Courses
-- ────────────────────────────────────────
INSERT INTO courses (id, title, description, level, duration, category) VALUES
    ('deep-hunt-osint-foundation', 'Open Source Intelligence (OSINT) Foundation', 'Master techniques to gather intelligence from publicly available sources to profile attackers.', 'Beginner', '2 Hours', 'intelligence'),
    ('ai-red-team', 'Offensive AI: Automated Red Teaming', 'Utilize autonomous agents and LLMs to uncover vulnerabilities at scale.', 'Advanced', '4 Hours', 'offensive'),
    ('scada-defense', 'ICS/SCADA Cyber Defense', 'Learn to monitor and defend electrical grids and critical infrastructure from state-sponsored attacks.', 'Intermediate', '6 Hours', 'defensive'),
    ('soc-fundamentals', 'SOC Analyst Fundamentals', 'Build foundational skills in alert triage, SIEM usage, and incident classification.', 'Beginner', '3 Hours', 'defensive'),
    ('threat-hunting-101', 'Proactive Threat Hunting', 'Learn hypothesis-driven hunting using MITRE ATT&CK and behavioral telemetry.', 'Intermediate', '4 Hours', 'intelligence'),
    ('malware-analysis', 'Malware Analysis & Reverse Engineering', 'Static and dynamic analysis of malicious binaries in a sandboxed environment.', 'Advanced', '8 Hours', 'offensive')
ON CONFLICT (id) DO NOTHING;
