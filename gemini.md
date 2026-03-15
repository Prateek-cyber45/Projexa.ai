# System Instructions: CyberPlatform

## Project Overview

Build a **full-stack cybersecurity training platform** that combines a Learning Management System (Academy), a hands-on Cyber Range (Labs), and an AI-powered dual scoring engine. Users log in, learn through structured courses, practice real-world SOC and Incident Response scenarios in isolated lab environments, and receive AI-generated skill scores based on both their answers and their working behaviour.

Deployment is **Docker Compose only**. All services run as containers behind a single Nginx reverse proxy.

---

## Domain & Navigation Structure

### Subdomains
- `main.com` — Landing page, login/signup, user dashboard
- `academy.main.com` — Learning Management System (LMS)
- `labs.main.com` — Cyber Range / Honeypot environment
- `auth.main.com` — SSO authentication (shared across all subdomains)
- `api.main.com` — Cross-domain API gateway
- `kibana.main.com` — Admin SIEM dashboards (auth-gated)
- `metrics.main.com` — Admin Grafana monitoring (auth-gated)

### Top Navigation (main.com — Logged-in User)
- Dashboard (default view)
- Academy
- Labs
- My Scores
- Profile / Settings

### Admin Navigation
- User Management
- Platform Analytics
- SIEM Dashboard (Kibana)
- Infrastructure Metrics (Grafana)

---

## Main Site (main.com)

### Landing Page (unauthenticated)
- Hero section with platform description
- Feature highlights: Academy, Labs, AI Scoring
- Call-to-action: Sign Up / Log In
- Pricing or access tiers (if applicable)

### Auth Pages
- Login form (email + password)
- Register form (name, email, password, confirm password)
- Forgot password flow
- OAuth2 social login (optional)

### User Dashboard (post-login)
**Key Metrics (4 Cards)**
- Overall Skill Score (rolling AI score across all sessions)
- Labs Completed (count + % change this month)
- Courses Completed (count + progress %)
- Current Streak (consecutive active days)

**Recent Activity Feed**
- Last 5 Labs sessions with scores
- Last 5 Academy completions
- Timestamps and scores shown

**Quick Actions**
- Continue last Lab session
- Resume last Course
- View full score history

---

## Academy Page (academy.main.com)

### Course Portal
- Grid or list of available courses
- Filter by: Category, Difficulty (Beginner / Intermediate / Advanced), Status (Not Started / In Progress / Completed)
- Search by course name or topic
- Each course card shows: title, category, difficulty badge, estimated duration, progress bar (if started)

### Course Viewer
- Video lessons with chapter navigation
- Embedded quizzes between chapters
- Progress auto-saved
- Notes section (per lesson)
- Download resources (PDFs, cheatsheets)

### Quiz & Assessment Engine
- Multiple choice questions (MCQ)
- Practical answer submissions (free text, graded by AI Response Scorer)
- Timer per question (optional, configurable per course)
- On completion: show score breakdown from AI engine
- Retry allowed (configurable per assessment)

### Certificates
- Auto-generated PDF on course completion
- Shows: user name, course name, completion date, final score
- Optional blockchain verification flag

### Progress Dashboard (per user)
- Courses in progress
- Completed courses with scores
- Badges earned
- Time spent learning (weekly/monthly)

---

## Labs Page (labs.main.com)

### Lab Catalogue
- List of available lab scenarios
- Filter by: Type (SOC / Incident Response / Forensics), Difficulty, Status
- Each lab card shows: scenario name, type badge, estimated duration, last score (if attempted)

### SOC Simulator
- Alert triage interface (SIEM-style UI)
- Real-time alerts fed from the honeypot engine
- User actions: Acknowledge, Escalate, Dismiss, Investigate
- Built-in threat hunting tasks with guided prompts
- All user interactions streamed to AI scoring engine via Redis Streams

### Incident Response Simulator
- Scenario-based playbook execution
- Step-by-step guided or free-form investigation
- Forensics challenges: log analysis, artefact examination
- Chain-of-custody tracking per action
- Submit incident report at the end (graded by AI Response Scorer)

### Honeypot Engine (backend, isolated)
- Fake vulnerable services: SSH (Cowrie), HTTP, SMB, FTP (Dionaea)
- Full packet capture per session
- Runs in isolated Docker network (`honeypot-net`) with egress firewall rules
- All events forwarded to Elasticsearch

### Live Score Widget (Labs sidebar)
- Shows real-time Behaviour Score as user works
- Updates every 30 seconds
- Displays: current B_score, confidence level, skill label (Novice → Expert)
- Cheating risk flag indicator (shown to admins only)

### Session End Screen
- Final dual score: R_score + B_score + Final Score
- Per-component breakdown (accuracy, completeness, technique coverage, confidence, efficiency)
- Comparison to previous attempt
- Recommendations: suggested courses, areas to improve

---

## AI Scoring System

### Response Score (R_score) — 0 to 100
- Triggered by: quiz submissions, incident report submissions, flag captures, tool command outputs
- Model: BERT / Sentence-BERT semantic similarity against reference answers
- Rule engine: keyword extraction, technique coverage, rubric-based scoring (spaCy)
- Score components: Accuracy + Completeness + Technique Coverage + Time Bonus

### Behaviour Score (B_score) — 0 to 100
- Triggered by: all Labs session events (keystroke dynamics, mouse movement, command sequences, navigation patterns, hesitation timing)
- Models: LSTM / Transformer on event sequences, Isolation Forest for anomaly detection, Skill-level classifier
- Score components: Confidence + Efficiency + Skill Level + Cheating Risk Flag

### Score Fusion
```
Final Score = α × R_score + β × B_score
```
- α + β = 1.0
- Weights adapt per task type (e.g. MCQ quiz: α=0.9 β=0.1 / Live SOC sim: α=0.5 β=0.5)
- Calibrated per difficulty tier

### Integrity Checks
- Behaviour-vs-response mismatch detection
- Speed anomaly detection
- Pattern replay detection

### User Skill Profile
- Rolling historical score per user
- Skill-domain vectors (SOC, IR, Forensics, etc.)
- Adaptive difficulty: platform increases scenario difficulty as user improves
- Stored in PostgreSQL, updated after every session

---

## My Scores Page

### Score History
- Table of all past Lab sessions and Academy assessments
- Columns: Date, Scenario/Course, R_score, B_score, Final Score, Skill Label
- Filter by: date range, type (Lab / Academy), scenario name

### Skill Profile Radar Chart
- Visual radar/spider chart showing skill levels across domains
- Domains: SOC, Incident Response, Forensics, Threat Hunting, Network Analysis

### Progress Over Time
- Line chart: Final Score trend over last 30/90 days
- Compare to platform average (anonymised)

---

## Data Model

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "avatar": "string | null",
  "role": "user | admin",
  "createdAt": "timestamp"
}
```

### LabSession
```json
{
  "id": "string",
  "userId": "string",
  "scenarioId": "string",
  "startedAt": "timestamp",
  "endedAt": "timestamp | null",
  "rScore": "number | null",
  "bScore": "number | null",
  "finalScore": "number | null",
  "cheatFlag": "boolean",
  "skillLabel": "novice | beginner | intermediate | advanced | expert"
}
```

### BehaviourEvent
```json
{
  "id": "string",
  "sessionId": "string",
  "userId": "string",
  "eventType": "keystroke | mouse | command | navigation | hesitation",
  "payload": "object",
  "timestamp": "timestamp"
}
```

### CourseProgress
```json
{
  "id": "string",
  "userId": "string",
  "courseId": "string",
  "completedLessons": "string[]",
  "finalScore": "number | null",
  "completedAt": "timestamp | null",
  "certificateIssued": "boolean"
}
```

### Card (Wallet)
```json
{
  "id": "string",
  "userId": "string",
  "lastFour": "string",
  "cardholderName": "string",
  "expiryDate": "string (MM/YY)",
  "cardType": "visa | mastercard | amex | other",
  "nickname": "string | null",
  "createdAt": "timestamp"
}
```

### ScoringModel
```json
{
  "id": "string",
  "modelType": "response | behaviour",
  "version": "string",
  "mlflowRunId": "string",
  "promotedAt": "timestamp",
  "isActive": "boolean"
}
```

---

## Container Architecture

### Exposed Services (via Nginx proxy)
| Container | Internal Port | Domain |
|---|---|---|
| main-frontend | 3000 | main.com |
| main-api | 4000 | api.main.com |
| academy-frontend | 3001 | academy.main.com |
| academy-api | 4001 | academy.main.com/api |
| labs-frontend | 3002 | labs.main.com |
| labs-backend | 4002 | labs.main.com/api |
| kibana | 5601 | kibana.main.com (admin) |
| grafana | 3100 | metrics.main.com (admin) |

### Internal-Only Services (never exposed)
| Container | Port | Role |
|---|---|---|
| ai-scoring-engine | 5000 | Dual score inference API |
| postgresql | 5432 | Primary database |
| redis | 6379 | Cache, sessions, event bus |
| elasticsearch | 9200 | SIEM log storage |

### Docker Networks
- `main-net` — main-frontend, main-api, nginx
- `academy-net` — academy-frontend, academy-api, nginx
- `labs-net` — labs-frontend, labs-backend, nginx
- `honeypot-net` — honeypot engine only, egress firewall rules, isolated VLAN
- `internal-net` — ai-scoring-engine, postgresql, redis, elasticsearch
- `nginx` — attached to ALL networks (sole external gateway)

---

## Core Functionalities

### Authentication & SSO
- JWT-based auth issued at auth.main.com
- Tokens shared via cookie across all subdomains
- OAuth2 / OIDC support
- Refresh token rotation

### Lab Session Management
- Create and terminate lab sessions
- Stream all user events to Redis Streams in real time
- Forward honeypot logs to Elasticsearch
- Trigger AI scoring on session end

### AI Scoring Pipeline
- Redis Streams consumer in ai-scoring-engine
- Feature extraction and windowing on raw events
- Inference via Response and Behaviour models
- Score fusion and integrity check
- Write final score to PostgreSQL
- Serve scores via internal REST API

### Model Training Loop
- Nightly batch job retrains on accumulated Elasticsearch data
- MLflow tracks all experiments
- Auto-promotes models that beat performance thresholds
- Zero-downtime hot-swap of active scoring models

### Admin Controls
- View all users and their skill profiles
- Access Kibana (SIEM dashboards)
- Access Grafana (infrastructure metrics)
- Manage lab scenarios and course content
- Review cheating flags

---

## Features for MVP (Phase 1–2)

- User registration, login, JWT SSO across subdomains
- Academy: course portal, video lessons, quizzes, progress tracking
- Labs: SOC Simulator, Incident Response Simulator (basic scenarios)
- Honeypot engine with Cowrie + Dionaea in isolated network
- All lab events streaming to Redis + Elasticsearch
- Docker Compose setup with Nginx routing all subdomains
- PostgreSQL schema for users, sessions, events, courses

## Features to Exclude from MVP

- AI Scoring Engine (Phase 3)
- Skill radar charts and score history page (Phase 3+)
- Certificate blockchain verification
- Grafana/Prometheus monitoring (Phase 4)
- CI/CD pipeline (Phase 4)
- Multi-tenant / organisation accounts
- Real payment processing
- Mobile native app

---

## Technical Requirements

### Event Streaming
- All Labs user actions emitted to Redis Streams within 50ms
- Event schema must be consistent for AI model consumption
- Events stored in Elasticsearch for batch model retraining

### AI Engine
- FastAPI service, internal network only
- Stateless inference — all state read from PostgreSQL
- Response model: sentence-transformers + spaCy
- Behaviour model: PyTorch LSTM + scikit-learn Isolation Forest
- MLflow for model versioning and promotion

### Security
- Honeypot containers run in isolated Docker network with no egress to production DB
- PostgreSQL, Redis, Elasticsearch never exposed externally
- All secrets managed via Docker secrets or `.env` files (not hardcoded)
- Nginx rate limiting on all public endpoints
- Admin routes (Kibana, Grafana) require separate auth

### Performance
- Redis caching for frequently read data (user profiles, active sessions)
- PostgreSQL indexes on userId, sessionId, timestamp
- AI scoring async (does not block user-facing API responses)
- Handle 500+ concurrent lab sessions without degradation

---

## Summary

Build a cybersecurity training platform with three core sub-applications (Main, Academy, Labs) and a background AI scoring engine, all running via Docker Compose. The MVP delivers working auth, course learning, and live lab simulations. AI scoring is introduced in Phase 3 once the event streaming infrastructure from Phase 2 is in place. Follow the four-phase roadmap: Foundation → Labs → AI Scoring → Production.
