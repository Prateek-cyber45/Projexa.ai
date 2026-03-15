# CyberPlatform - Complete Testing Documentation

## Environment Setup

### Prerequisites
- Docker Engine (v24+)
- Docker Compose (v2+)
- (Optional) Python 3.10+ & Node.js 18+ for out-of-container dev

### Required Environment Variables & Secrets
Before starting the application, ensure the required secrets are present in the `production_secrets` folder at the root:
1. `production_secrets/db_password.txt` (Contains the PostgreSQL password, e.g., `admin123`)
2. `production_secrets/jwt_private_key.pem` (Contains the RSA private key for JWT signing)
3. `.env` file at the root containing `GRAFANA_PASSWORD=your_password_here` (and other optional env vars)

### Local Host Resolution (Required)
To access the platform locally via browser, map the subdomains in your local `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```text
127.0.0.1 main.com
127.0.0.1 api.main.com
127.0.0.1 academy.main.com
127.0.0.1 labs.main.com
127.0.0.1 kibana.main.com
127.0.0.1 metrics.main.com
```

## How to Run the Project

The entire CyberPlatform stack runs via Docker Compose behind an Nginx proxy.

### Startup Steps
1. Navigate to the project root directory.
2. Build and start all services in the background:
   ```bash
   docker-compose up -d --build
   ```
3. To view logs and ensure everything is starting correctly:
   ```bash
   docker-compose logs -f
   ```

### Ports Overview
**Exposed to Host (for direct access during testing):**
- **80**: Nginx Reverse Proxy (Routes `main.com`, `api.main.com`, etc.)
- **5601**: Kibana UI (if direct access is needed)
- **9200**: Elasticsearch API (for local testing only)

**Internal Container Ports (Not Exposed):**
- `main-frontend`: 3000
- `academy-frontend`: 3001
- `labs-frontend`: 3002
- `main-api`: 4000
- `academy-api`: 4001
- `labs-backend`: 4002
- `ai-scoring-engine`: 5000
- `postgresql`: 5432
- `redis`: 6379

## Testing Steps

### 1. Main Application & Identity
1. Open `http://main.com` in your browser.
2. Verify you can see the landing page.
3. Click "Sign Up" and register a test user account.
4. Log out, then log in using the newly created credentials to verify auth JWT generation works. 
5. Verify access to the User Dashboard displaying placeholder/initial scores.

### Login Credentials (Test Users)
*Currently, database relies on manual registration for initial setup. Best practice during testing is to register a fresh user via UI:*
- **Standard User**: Register at `http://main.com/register`
- **Admin Setup**: TBD via database seed scripts. You can manually assign the admin role by executing `UPDATE users SET role = 'admin' WHERE email = '...';` directly in the Postgres DB container.

### 2. Academy API & UI
1. Navigate to `http://academy.main.com`.
2. Check the course catalog grid.
3. Select a course and verify video rendering and progress navigation.
4. Complete a mock quiz and verify it triggers score generation in UI.

### 3. Labs & AI Scoring
1. Navigate to `http://labs.main.com`.
2. Choose an active "SOC Simulator" or "Incident Response" scenario.
3. Validate that the telemetry streams correctly (Score widget updates live every 30s).
4. *(Backend Test)* Verify Redis streams are populated by inspecting keys in the container: `docker-compose exec redis redis-cli keys *`.

### 4. Admin Infrastructure
1. Navigate to `http://kibana.main.com` (Ensure it proxies correctly).
2. Verify Elasticsearch index contains Cowrie logs.
3. Navigate to `http://metrics.main.com`.
4. Log in with `admin` and the password set in `.env` (`GRAFANA_PASSWORD`).
5. Ensure metrics are logging from Prometheus endpoints.

## Known Issues
- The `ai-stream` worker requires actual model checkpoints to score properly. Without trained models, fallback heuristic logic runs.
- Honeypot egress isolation means `honeypot-cowrie` cannot connect to external public APIs for software updates while running.

## Troubleshooting

### Common Errors

**Error: Postgres Connection Refused or Authentication Failed**
- *Fix*: Check that `db_password.txt` has no trailing spaces or newlines. Stop containers, delete the `postgres_data` volume with `docker volume rm cyberplatform-root_postgres_data` (Warning: deletes database data), and restart.

**Error: Nginx 502 Bad Gateway**
- *Fix*: The backend API or frontend container mapped to the requested subdomain is likely crashing or taking too long to build. Run `docker-compose logs main-api` or check the affected container log to find the root cause. Try again in 15 seconds.

**Error: Domains Not Resolving / Connection Refused on `main.com`**
- *Fix*: Ensure your host's `/etc/hosts` file is properly configured. If using WSL, the config must be heavily verified in the Windows host `C:\Windows\System32\drivers\etc\hosts`.

**Debugging Steps**
- If a specific container stops working, inspect it: `docker-compose logs <service_name>`
- Restart a single service: `docker-compose restart <service_name>`
- Shell access to a container: `docker-compose exec <service_name> sh`
