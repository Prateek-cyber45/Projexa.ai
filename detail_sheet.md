# CyberPlatform - Detail Sheet

## Project Overview
CyberPlatform is a full-stack cybersecurity training platform combining a Learning Management System (Academy), a hands-on Cyber Range (Labs), and an AI-powered dual scoring engine. It supports structured courses and practical Incident Response/SOC scenarios in isolated environments.

## Architecture
The platform follows a microservices architecture entirely orchestrated via Docker Compose, sitting behind an Nginx reverse proxy.

### Networks
- **`frontend-net`**: Connects the Nginx proxy to all frontends and API gateways.
- **`data-net`**: Connects backend services to shared databases (Postgres, Redis, Elasticsearch, MLflow, Prometheus/Grafana).
- **`honeypot-net`**: Completely isolated VLAN for the Cowrie honeypot with egress firewalls protecting the production DBs and host environment.

## System Design & Components

### Frontend Structure
Built as isolated Next.js applications:
- **`main-frontend`**: Landing page, user dashboard, identity management. Served at `main.com`.
- **`academy-frontend`**: LMS portal for video courses, progress tracking, and quizzes. Served at `academy.main.com`.
- **`labs-frontend`**: Cyber Range UI (SOC/IR simulators), terminal interfaces (e.g. xterm.js), and real-time score widget. Served at `labs.main.com`.

### Backend Structure
Multi-container backend services (FastAPI/Python/Node):
- **`main-api`**: Core identity provider, user profiles, cross-domain API gateway. Served at `api.main.com`.
- **`academy-api`**: Manages course progress, issues certificates. Served at `academy.main.com/api`.
- **`labs-backend`**: Orchestrates lab environments, proxies terminal sessions into Cowrie containers, and streams session events to Redis. Served at `labs.main.com/api`.
- **`ai-scoring-engine`**: Internal Service (FastAPI) running Response (NLP) and Behaviour (Time-Series) scoring models. Uses MLflow for model tracking.
- **`ai-stream`**: Worker process that consumes real-time lab events from Redis Streams to feed them into the scoring engine.

### Data Infrastructure
- **PostgreSQL**: Primary relational DB (users, courses, scores, sessions).
- **Redis**: Caching, session storage, and Event Bus (Redis Streams) for real-time interaction telemetry.
- **Elasticsearch + Filebeat**: SIEM log storage, capturing Cowrie honeypot events via Filebeat.
- **Prometheus + Grafana**: Infrastructure monitoring metrics.

## Important Directories & Files
- `/services/`: Contains source code for all microservices (frontend Next.js apps, API backends, AI engines).
- `/infrastructure/`: Configuration files for supporting infrastructure like Postgres `init.sql`, Filebeat, Prometheus.
- `/docker-compose.yml`: Core orchestrator defining 15+ containers, volumes, dependencies, and networks.
- `/nginx/`: Reverse proxy configuration mapping subdomains to respective internal containers.
- `/production_secrets/`: Docker secret storage (e.g., `db_password.txt`, `jwt_private_key.pem`). Do not commit to source control.

## Application Workflows & Example Flows

### Flow 1: Lab Session & Real-Time Scoring
1. **Frontend**: User starts a lab scenario at `labs.main.com`.
2. **Gateway**: Request routed via Nginx to `labs-backend`.
3. **Execution**: `labs-backend` establishes isolated connection to `honeypot-cowrie` container.
4. **Telemetry**: As the user types and executes actions, the frontend sends user interaction events (keystrokes, navigation), and the backend sends simulation telemetry.
5. **Event Bus**: `labs-backend` pushes structured JSON to Redis Streams.
6. **Processing**: The `ai-stream` worker consumes events asynchronously and passes batches to `ai-scoring-engine`.
7. **Scoring**: `ai-scoring-engine` evaluates Behaviour Score (B_score), checking integrity models and saving to PostgreSQL.
8. **Feedback**: `labs-frontend` pulls updated live B_score every 30 seconds to update the Live Widget UI.

### Flow 2: Honeypot SIEM Logging
1. **Activity**: Attacker/user executes commands inside `honeypot-cowrie`.
2. **Log File**: Cowrie natively writes events to `/cowrie/var/log/cowrie/cowrie.json`.
3. **Log Shipper**: The `filebeat` container, mounting the shared Cowrie log volume, detects file changes.
4. **Storage**: Filebeat maps logs to `elasticsearch:9200`.
5. **Visualization**: Admin accesses `kibana.main.com` to view structured, searchable SIEM data on dashboards.
