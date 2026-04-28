param(
    [switch]$Docker,
    [switch]$Local
)

Write-Host "══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DEEPHUNT ECOSYSTEM STARTUP" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($Docker) {
    Write-Host "[MODE] Docker Compose" -ForegroundColor Yellow

    Write-Host "[1/3] Building all containers..." -ForegroundColor DarkCyan
    docker compose build

    Write-Host "[2/3] Starting all services..." -ForegroundColor DarkCyan
    docker compose up -d

    Write-Host "[3/3] Waiting for health checks..." -ForegroundColor DarkCyan
    Start-Sleep -Seconds 15
    docker compose ps

    Write-Host ""
    Write-Host "All services launched via Docker!" -ForegroundColor Green
    Write-Host "Platform: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Run 'docker compose logs -f' to tail all logs" -ForegroundColor DarkGray
    Write-Host "Run 'python e2e_health_check.py' to verify endpoints" -ForegroundColor DarkGray
    exit
}

# ── Local Development Mode ──────────────────────────
Write-Host "[MODE] Local Development" -ForegroundColor Yellow
Write-Host ""

Write-Host "[1/7] Starting PostgreSQL (ensure running on port 5432)" -ForegroundColor DarkCyan
Write-Host "       Verify: pg_isready -U postgres" -ForegroundColor DarkGray

Write-Host "[2/7] Starting Redis (port 6379)" -ForegroundColor DarkCyan
if (Test-Path "$PWD\redis-local\redis-server.exe") {
    Start-Process powershell -WorkingDirectory "$PWD\redis-local" -ArgumentList "-NoExit", "-Command", ".\redis-server.exe"
} else {
    Write-Host "       Redis binary not found. Ensure Redis is running." -ForegroundColor DarkGray
}

Start-Sleep -Seconds 2

Write-Host "[3/7] Starting Main API (Port 8001)" -ForegroundColor DarkCyan
Start-Process powershell -WorkingDirectory "$PWD\main-api" -ArgumentList "-NoExit", "-Command", "if (Test-Path venv) { .\venv\Scripts\python.exe -m uvicorn main:app --port 8001 --reload } else { python -m uvicorn main:app --port 8001 --reload }"

Write-Host "[4/7] Starting Academy API (Port 8002)" -ForegroundColor DarkCyan
Start-Process powershell -WorkingDirectory "$PWD\academy-api" -ArgumentList "-NoExit", "-Command", "if (Test-Path venv) { .\venv\Scripts\python.exe -m uvicorn main:app --port 8002 --reload } else { python -m uvicorn main:app --port 8002 --reload }"

Write-Host "[5/7] Starting Labs Backend (Port 4000)" -ForegroundColor DarkCyan
Start-Process powershell -WorkingDirectory "$PWD\labs-backend" -ArgumentList "-NoExit", "-Command", "node server.js"

Write-Host "[6/7] Starting AI Engine (Port 8003) & AI Stream (Port 8004)" -ForegroundColor DarkCyan
Start-Process powershell -WorkingDirectory "$PWD\ai-engine" -ArgumentList "-NoExit", "-Command", "if (Test-Path venv) { .\venv\Scripts\python.exe -m uvicorn main:app --port 8003 --reload } else { python -m uvicorn main:app --port 8003 --reload }"
Start-Process powershell -WorkingDirectory "$PWD\ai-stream" -ArgumentList "-NoExit", "-Command", "if (Test-Path venv) { .\venv\Scripts\python.exe -m uvicorn main:app --port 8004 --reload } else { python -m uvicorn main:app --port 8004 --reload }"

Write-Host "[7/7] Starting Frontend Server (Port 3003)" -ForegroundColor DarkCyan
Start-Process powershell -WorkingDirectory "$PWD" -ArgumentList "-NoExit", "-Command", "node serve_restored.js"

Write-Host ""
Write-Host "══════════════════════════════════════" -ForegroundColor Green
Write-Host "   All processes launched!" -ForegroundColor Green
Write-Host "══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:      http://localhost:3003" -ForegroundColor White
Write-Host "  Main API:      http://localhost:8001/api/main/health" -ForegroundColor White
Write-Host "  Academy API:   http://localhost:8002/api/academy/health" -ForegroundColor White
Write-Host "  Labs WS:       http://localhost:4000" -ForegroundColor White
Write-Host "  AI Engine:     http://localhost:8003/health" -ForegroundColor White
Write-Host "  AI Stream:     http://localhost:8004/health" -ForegroundColor White
Write-Host ""
Write-Host "  Run 'python e2e_health_check.py' to verify" -ForegroundColor DarkGray
