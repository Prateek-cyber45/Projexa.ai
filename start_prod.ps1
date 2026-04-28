Write-Host "==================================" -ForegroundColor Cyan
Write-Host " DEEPHUNT PRODUCTION ENVIRONMENT" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "Starting DeepHunt Main API (Port 8001)"
Start-Process powershell -ArgumentList "-NoExit -Command "cd main-api; .\venv\Scripts\python.exe -m uvicorn main:app --port 8001""

Write-Host "Starting DeepHunt Academy API (Port 8002)"
Start-Process powershell -ArgumentList "-NoExit -Command "cd academy-api; .\venv\Scripts\python.exe -m uvicorn main:app --port 8002""

Write-Host "Starting DeepHunt Labs WebSockets (Port 4000)"
Start-Process powershell -ArgumentList "-NoExit -Command "cd labs-backend; node server.js""

Write-Host "Starting Production Gateway (Port 3000)"
Start-Process powershell -ArgumentList "-NoExit -Command "node gateway_prod.js""

Write-Host "
All 4 processes have been launched locally!" -ForegroundColor Green
Write-Host "The platform and static frontends are unified securely behind the Node.js reverse proxy." -ForegroundColor Green
Write-Host "Access the entire platform via: http://localhost:3000" -ForegroundColor White
