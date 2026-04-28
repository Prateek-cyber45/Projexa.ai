# Project Overview & Architecture Documentation

This document provides a comprehensive overview of the project's structure, the technologies used, explanations of specific simulations, and how this platform compares to other industry standards. It also includes potential questions a mentor might ask during a project review.

## 1. Folder Structure

```text
testing_project/
├── .github/                 # GitHub Actions and workflows CI/CD configurations
├── .venv/                   # Python virtual environment (dependencies)
├── academy-api/             # Backend service API for the academy/learning portal
├── ai-engine/               # AI processing core, potentially for dynamic challenges or assistance
├── ai-stream/               # Streaming engine/service for AI features (e.g., chat, hints)
├── assets/                  # Static assets such as images, fonts, and generic styles
├── documentation/           # Additional project documentation setup
├── html_stack/              # Frontend HTML templates including various simulation pages
├── labs-backend/            # Backend service specifically handling practical lab deployments
├── main-api/                # Core platform backend API handling user management and auth
├── nginx/                   # Nginx reverse proxy configuration for routing traffic
├── observability/           # Configuration files for monitoring and logging (ELK, Prometheus, Grafana)
├── redis-local/             # Local Redis configuration or data for caching/message brokering
├── docker-compose.yml       # Docker orchestration file tying all services together
├── Dockerfile.frontend      # Blueprint for building the frontend container
└── (various helper scripts) # e.g., analyze_html.js, start_ecosystem.ps1, seed_courses.js
```

## 2. Folder Structure Explanation & Specific File Uses

The architecture follows a **Microservices Pattern**, dividing the application into distinct backend APIs, frontend, and auxiliary services:

- **APIs (`main-api/`, `academy-api/`, `labs-backend/`)**: These directories contain the core logic. Separating them allows independent scaling. Main-API handles user authentication. The Academy-API handles course metadata and learning progression, while Labs-Backend manages the spinning up of specific vulnerable or simulated environments.
- **AI Integration (`ai-engine/`, `ai-stream/`)**: Dedicated components handling AI interactions. This isolates computationally heavy AI tasks from traditional web traffic.
- **Frontend (`html_stack/`)**: Contains the static and dynamic user interfaces for the platform, including the learning dashboards and the unique simulation scenarios.
- **Infrastructure (`nginx/`, `redis-local/`, `observability/`)**: 
  - `nginx/` acts as an API gateway, routing incoming requests on specific paths (e.g., `/api/main`) to the correct internal container.
  - `redis/` is likely used as a fast cache for session management or a message queue for inter-service communication (like tasking UI events to the AI backend).
- **Orchestration (`docker-compose.yml`)**: This critical file defines the entire ecosystem. It sets up networks (so containers can speak to each other securely), volumes (to persist data), and maps ports.

## 3. Technology Scope & Use Cases: Observability Stack

Modern cybersecurity heavily relies on "Observability" (monitoring, logging, and tracing). This project embeds an enterprise-grade stack directly into the platform:

- **Elasticsearch**: A highly scalable search engine used to store and quickly analyze massive volumes of logs (e.g., authentication logs, network traffic simulating an attack).
- **Kibana**: The visualization dashboard for Elasticsearch. **Use Case:** A Blue Team (defender) student uses Kibana to query the Elasticsearch database, looking for anomalies to detect a mock cyber attack.
- **Prometheus**: A time-series database designed to "scrape" metrics from running applications. **Use Case:** It monitors the health of the project's own backend APIs or physical simulated infrastructure (CPU usage, memory, request rates).
- **Grafana**: Plugs into Prometheus (and other sources) to create beautiful, observable graphs. **Use Case:** A real-time dashboard showing the health of all containers, allowing administrators or players to see if a specific "lab" container is offline or under stress.

## 4. Simulation Modules: How to Use & Use Cases

The platform features unique industry-specific simulations. They are likely interactive front-end views (HTML/JS) mimicking real-world control panels.

*   **`soc_sim` (Security Operations Center Simulator)**:
    *   **How to use:** Users interact with a mock centralized dashboard showing alerts, mapped incidents, and threat intelligence feeds.
    *   **Use case:** Training tier 1 SOC analysts on triage, alert fatigue, and incident escalation.
*   **`splunk_nav.html`**:
    *   **How to use:** A simulated interface of the popular SIEM (Security Information and Event Management) tool, Splunk.
    *   **Use case:** Teaching students specialized query languages (SPL) to search through logs and find the "needle in the haystack" during an incident without needing an expensive Splunk enterprise license.
*   **Critical Infrastructure Simulators (`aviation_sim.html`, `banking_sim.html`, `scada_sim.html`, `water_sim.html`)**:
    *   **How to use:** These provide UIs that mimic industrial control systems (ICS). Users might see gauges, pressure valves, or air traffic controls.
    *   **Use case:** These teach *Operational Technology (OT)* security. Unlike standard IT systems, a hack in a SCADA (Supervisory Control and Data Acquisition) or water system has physical, real-world consequences. Students can launch or mitigate attacks and visually see the "pumps" fail or the "air traffic" get compromised on the UI.

## 5. Docker Use Case

**Docker** is the backbone of this platform's deployment and scalability.
- **Why it's used:** Instead of forcing a user or developer to manually install Node.js, Python, Redis, Nginx, and specific database versions on their host machine, Docker packages everything into isolated "containers."
- **Benefit:** It guarantees that "it works on my machine" translates to "it works everywhere." The `docker-compose.yml` allows spinning up the entire complex microservice architecture (frontend, multiple APIs, and full observability stack) with a single command (`docker-compose up`). It also isolates vulnerable lab environments from the host system, ensuring security during penetration testing exercises.

## 6. Competitive Advantage: How is it better than HackTheBox (HTB)?

While HackTheBox (HTB) and TryHackMe (THM) are excellent platforms, this project offers distinct advantages:

1.  **Blue Team / Defender Focus**: HTB is heavily skewed towards *Offensive Security* (Red Teaming, privilege escalation, root compromises). This platform integrates **Elasticsearch, Kibana, Prometheus, and Splunk Sims**, focusing heavily on teaching users how to *detect* and *monitor* attacks (Blue Teaming), which is arguably a larger job market.
2.  **Sector-Specific Context (OT/ICS)**: Platforms like HTB usually focus on standard IT environments (Windows Active Directory, Linux servers). This project incorporates **SCADA, Aviation, and Water Treatment simulations**. These Operational Technology (OT) simulators offer training for attacks on physical infrastructure, which is a rare and highly specialized niche.
3.  **AI Integration**: The presence of `ai-engine` suggests dynamic learning. Instead of static walk-throughs, the platform can adapt, provide intelligent hints, or dynamically alter attacker behavior, offering a customized learning curve.
4.  **End-to-End Enterprise Architecture**: Students log into a platform that mirrors a modern enterprise (Microservices, API Gateway via Nginx, Redis architecture), teaching them about cloud-native infrastructure simply by interacting with it.

## 7. Potential Questions a Mentor Might Ask

Be prepared to answer these questions during a review:

*   **Architecture & Docker:**
    *   *Question:* "Why did you separate the backend into `main-api`, `academy-api`, and `labs-backend` instead of a monolith?"
    *   *Question:* "How do your containers communicate with each other? Are they on a custom Docker network?"
    *   *Question:* "How does Nginx know which API to route a request to?"
*   **Observability:**
    *   *Question:* "What is the difference between what Prometheus is doing and what Elasticsearch is doing in your stack?"
    *   *Question:* "If a lab container crashes, how would your monitoring stack alert you?"
*   **Security & Simulations:**
    *   *Question:* "When I 'hack' a simulation like the SCADA sim, is there a real backend vulnerable code base being attacked, or is it a frontend mock?"
    *   *Question:* "How do you ensure that a user exploiting a lab doesn't break out of the container and attack the host machine?"
*   **AI Integration:**
    *   *Question:* "What role does the `ai-engine` play? How does it differ from a standard static hint system?"
*   **Data Persistence:**
    *   *Question:* "If I take down the Docker environment with `docker-compose down`, do user accounts and progress get deleted? How are you handling data persistence (volumes)?"
