# CyberPlatform Backlog

## 1. Feature Gaps vs. **gemini.md** (Project Overview)

- **AI Scoring Engine** – The `ai-engine` service is commented out in `docker-compose.yml`. Implement FastAPI inference service, model loading, and scoring endpoints.
- **AI Stream Processor** – `ai-stream` worker is also commented out. Build a Redis‑Streams consumer that extracts lab events, runs the behaviour model, and writes results to the DB.
- **User Authentication & SSO** – No JWT issuance or shared cookie logic present in the front‑ends. Implement auth flow in `main-api` and propagate tokens across sub‑domains (`auth.main.com`).
- **OAuth2 / OIDC** – Placeholder only in documentation. Add provider integration (e.g., Google, GitHub).
- **Refresh Token Rotation** – Missing implementation in auth service.
- **Admin Controls** – No UI for user management, platform analytics, or Kibana/Grafana admin gating.
- **Certificate Blockchain Verification** – Not present in the LMS flow.
- **CI/CD Pipeline** – No GitHub Actions / GitLab CI configuration.
- **Multi‑tenant / Organisation Support** – Not planned for MVP but documented as future work.
- **Mobile Native App** – Out of scope for MVP, but listed in gemini.md.
- **Performance Optimisations** – No Redis caching layer for frequently accessed data (user profiles, active sessions).
- **Monitoring & Alerting** – Prometheus & Grafana services are defined but not wired to the application metrics.
- **Testing Suite** – No unit/integration tests for APIs, front‑ends, or the honeypot event pipeline.
- **SEO & Accessibility** – HTML pages lack `<title>`, meta description, proper heading hierarchy, ARIA attributes, and language declarations.
- **Responsive Breakpoints** – CSS does not include the breakpoint utilities defined in the brand guidelines.
- **Design Tokens** – Global CSS defines custom colors but does not expose a CSS variables file that matches the palette in `brandGuidelines.md` (e.g., `--color-brand-blue`).
- **Shadow System** – Some components use custom shadows, but the standardized shadow tokens (`--shadow-card`, `--shadow-elevated`, etc.) are not consistently applied.
- **Button Styles** – Primary/secondary/danger button classes from the guidelines (`.primary-btn`, `.ghost-btn`, etc.) are missing; current UI uses ad‑hoc Tailwind classes.
- **Zone/Section Containers** – Zone classes (`.zone-blue`, `.zone-orange`, …) are defined but not used throughout the UI.
- **Live Status Indicators** – Ping dot components exist but are not integrated into the Labs sidebar.
- **Micro‑animations** – Only a few keyframe animations are present; many UI interactions lack the `all 0.2s ease` transition mandated by the guidelines.
- **Typography** – The global font stack references `Inter` and custom fonts, but the primary heading font should be **Rajdhani** and the monospace **Share Tech Mono** as per the brand guide.
- **Dark Mode** – No dark‑mode toggle or CSS media query handling.

## 2. Design Compliance vs. **brandGuidelines.md**

| Guideline | Current Status | Action Needed |
|---|---|---|
| **Color Palette** – Apple Blue, Orange, Green, Purple, etc. | Colors defined in `globals.css` but use custom hex values (`#adc7ff`, `#4a8eff`). | Replace with CSS variables matching the palette (`--color-brand-blue`, `--color-brand-orange`, …) and reference them throughout.
| **Typography** – Rajdhani (UI), Share Tech Mono (code), Orbitron (hero) | `font-family` uses `Inter`. | Update global font stack to use Rajdhani for headings and UI, Share Tech Mono for code blocks, Orbitron for hero titles.
| **Button Design** – Pill‑shaped, Apple‑style focus ring | No dedicated button classes; Tailwind utilities used directly. | Create `.primary-btn`, `.secondary-btn`, `.danger-btn` classes with radius `980px`, focus ring `0 0 0 4px rgba(0,113,227,0.3)`.
| **Cards / Panels** – Off‑white background, border `#D2D2D7`, radius `18px`, shadow `0 2px 8px rgba(0,0,0,0.08)` | `.neo-card` uses dark background, custom shadows. | Add `.card` component matching spec; refactor existing cards to use it.
| **Navigation Bar** – Frosted glass, blur `20px` | No frosted glass nav; default Tailwind navbar. | Implement `backdrop-filter: blur(20px)` with semi‑transparent background.
| **Zone Containers** – Left‑border accent per sub‑domain | Zone classes exist but not applied. | Apply `.zone-blue` to main pages, `.zone-orange` to Labs, `.zone-green` to Academy, `.zone-purple` to AI sections.
| **Shadow System** – Tokens `--shadow-card`, `--shadow-elevated`, `--shadow-modal` | Shadows defined inline, not using tokens. | Refactor CSS to use the shadow variables.
| **Responsive Breakpoints** – Mobile <640px, Tablet 641‑1024px, Desktop 1025‑1400px, Wide >1400px | No media queries for layout adjustments. | Add responsive grid utilities and verify layout at each breakpoint.
| **Micro‑animations** – Default `all 0.2s ease`, page fade‑in, hover transitions only on color/border/shadow | Some animations present, but many components lack transitions. | Add `transition: all 0.2s ease;` to global UI elements; ensure hover states only animate allowed properties.
| **Live Status Indicators** – Ping dots with pulse animation | `.ping-dot` defined but not used in UI. | Integrate ping dots into Labs sidebar and score widget.
| **Accessibility** – ARIA labels, focus order, color contrast | No explicit ARIA attributes. | Audit components for WCAG AA contrast, add `aria-label`s, ensure focus outlines visible.
| **Dark Mode** – Light theme mandatory except hero/terminal sections | No dark‑mode support. | Add `prefers-color-scheme` media queries for optional dark mode (respect guidelines).

## 3. Infrastructure & DevOps Tasks

- **Expose AI Scoring Engine** – Add internal network routing, secure API keys.
- **Configure Nginx Reverse Proxy** – Add location blocks for each sub‑domain (`main.com`, `academy.main.com`, `labs.main.com`, `api.main.com`).
- **Docker Secrets** – Move DB password and JWT key into Docker secrets; update services to reference them.
- **Health Checks** – Add `HEALTHCHECK` directives for all services.
- **Logging** – Centralise logs via ELK stack; ensure Cowrie logs are parsed by Filebeat.
- **Prometheus Exporters** – Add exporters for FastAPI, Redis, PostgreSQL.
- **Kibana Access Control** – Restrict Kibana to admin users via Nginx auth.
- **Git Hooks** – Enforce linting (`eslint`, `prettier`) and style checks before commit.

## 4. Security Enhancements

- **Rate Limiting** – Configure Nginx rate limits for public endpoints.
- **CORS Policies** – Restrict origins to allowed sub‑domains.
- **HTTPS** – Add TLS termination in Nginx (self‑signed for dev, Let's Encrypt for prod).
- **Secret Rotation** – Implement automated rotation for DB password and JWT private key.
- **Input Validation** – Harden API endpoints against injection attacks.
- **Session Management** – Use HttpOnly, Secure cookies for JWT tokens.

## 5. Testing & Quality Assurance

- **Unit Tests** – Write pytest suites for `main-api`, `academy-api`, `labs-backend`.
- **Integration Tests** – End‑to‑end tests using Playwright for UI flows (login, dashboard, lab start).
- **Load Tests** – Simulate 500+ concurrent lab sessions with Locust.
- **CI Pipeline** – Add GitHub Actions workflow to run lint, tests, build Docker images, and push to registry.
- **Code Coverage** – Enforce minimum 80% coverage.

## 6. Documentation & SEO

- **API Docs** – Generate OpenAPI spec for all APIs and host via Swagger UI.
- **Meta Tags** – Add `<title>`, `<meta name="description">`, and canonical URLs to each HTML page.
- **Heading Structure** – Ensure a single `<h1>` per page, proper hierarchy (`<h2>`, `<h3>`).
- **Sitemap** – Generate `sitemap.xml` for SEO crawlers.
- **Accessibility Docs** – Document ARIA usage and keyboard navigation.

## 7. UX / UI Polish

- **Consistent Button Components** – Replace ad‑hoc Tailwind classes with design‑system classes.
- **Card Hover Effects** – Use the defined `--shadow-elevated` on hover.
- **Hero Sections** – Apply dark background `#1D1D1F` with inverted text.
- **Loading States** – Implement skeleton loaders for data‑heavy components.
- **Error Pages** – Design custom 404/500 pages following brand colors.
- **Micro‑animations** – Add fade‑up for page transitions, fade‑down for header, and respect `prefers-reduced-motion`.

---

*This backlog is generated by comparing the current repository state with the design specifications in `brandGuidelines.md` and the project roadmap in `gemini.md`. Prioritise items marked **Feature Gaps** for MVP completion, then address **Design Compliance**, **Infrastructure**, and **Security** in subsequent sprints.*
