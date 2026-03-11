-- init.sql

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rolling_score NUMERIC(5, 2) DEFAULT 0.00,
    skill_vector_soc NUMERIC(5, 2) DEFAULT 0.00,
    skill_vector_forensics NUMERIC(5, 2) DEFAULT 0.00,
    skill_vector_network NUMERIC(5, 2) DEFAULT 0.00
);

-- Sessions Table (for tracking active logins)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table (Academy MVP)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    module_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scores Table (Prepared for Phase 3 AI Engine, but needed for Academy MVP progress tracking)
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- e.g., 'quiz', 'lab_flag'
    r_score NUMERIC(5, 2), -- Response Score
    b_score NUMERIC(5, 2), -- Behaviour Score
    final_score NUMERIC(5, 2),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for AI Scoring Engine windowing queries
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_created_at ON scores(completed_at);
CREATE INDEX idx_scores_user_created ON scores(user_id, completed_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
