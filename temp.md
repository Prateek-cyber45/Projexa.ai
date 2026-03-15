# CyberPlatform: Project Architecture & Accomplishments

## Overview
This document outlines the architecture, microservices, and completed milestones for the CyberPlatform (Delta Node 5). The system is a full-stack, distributed cybersecurity training environment featuring an LMS, a live air-gapped cyber range, and a real-time AI scoring engine.

---

## 🏗️ Phase 1: Foundation & Infrastructure
**Goal:** Establish the core routing, databases, and user authentication flow.
* **Nginx Reverse Proxy:** Configured dynamic routing to map `main.com`, `academy.main.com`, and `labs.main.com` to their respective internal Docker containers.
* **Network Isolation:** Built a secure Docker Compose architecture with strict network boundaries (`frontend-net`, `data-net`, `honeypot-net`).
* **PostgreSQL Database:** Designed the schema for users, courses, and historical AI scores, complete with a Python seeding script.
* **Authentication API:** Built a FastAPI backend (`api.main.com`) handling user registration, login, and secure JWT generation.
* **User Dashboard:** Created a Next.js client interface that decodes the JWT, fetches the user's live profile, and displays their dynamic skill vectors and active assignments.

## 🎓 Phase 2: Academy LMS
**Goal:** Build the learning portal where users consume content and take AI-graded assessments.
* **Next.js Frontend:** Developed an aesthetic, grid-based course catalog and responsive module pages.
* **Video Integration:** Replaced heavy local storage dependencies with responsive YouTube iframe embeds for scalable video delivery.
* **Redis Caching Layer:** Implemented a Cache-Aside pattern in the FastAPI Academy backend. Course data is served from Redis RAM to minimize PostgreSQL queries and handle high traffic seamlessly.

## 🔬 Phase 3: Live Cyber Range (SOC Simulator)
**Goal:** Provide an interactive, browser-based terminal connected to an isolated honeypot.
* **React Terminal:** Implemented `xterm.js` on `labs.main.com` to render a fully functional command-line interface in the browser.
* **WebSocket-to-SSH Proxy:** Built a highly complex asynchronous Python bridge (`asyncssh`) that tunnels WebSocket traffic from the browser directly into an air-gapped Cowrie Docker honeypot.
* **ELK Stack SIEM Integration:** Deployed Filebeat to capture raw JSON logs from the Cowrie honeypot and ship them to Elasticsearch. 
* **SOC Dashboards:** Prepared the environment for Kibana Lens visualizations (Geo-IP tracking, credential harvesting, live command execution) so users can practice threat hunting.

## 🧠 Phase 4: AI Scoring Engine
**Goal:** Evaluate both the *quality* of a user's answer and the *behavior* of their actions in real-time.
* **Redis Stream Processor:** Engineered a background worker that consumes thousands of raw keystrokes and events from the Labs, aggregates them into time-windows, and fires them to the scoring models.
* **Pillar 1 - Response Score (R_score):** Built an NLP evaluation module utilizing Sentence-BERT and spaCy to grade text submissions based on accuracy and required techniques.
* **Pillar 2 - Behaviour Score (B_score):** Implemented an `IsolationForest` machine learning model (`scikit-learn`) to detect anomalies in command timing, flagging copy-paste bursts and script usage.
* **Score Fusion Engine:** Created a FastAPI endpoint that dynamically weights ($Final Score = \alpha \times R\_score + \beta \times B\_score$) and combines both scores based on the task type, runs integrity checks, and permanently updates the user's skill vectors in PostgreSQL.

---

## 🛠️ Tech Stack Summary
* **Frontend:** Next.js (React), Tailwind CSS, xterm.js
* **Backend:** FastAPI (Python), Node.js, asyncssh
* **AI / ML:** scikit-learn, spaCy, Sentence-BERT
* **Databases / Cache:** PostgreSQL, Redis
* **Infrastructure:** Docker Compose, Nginx, Cowrie (Honeypot)
* **Monitoring / SIEM:** Elasticsearch, Kibana, Filebeat