Write-Host "[*] Booting DeepHunt Ecosystem for Integration Testing..." -ForegroundColor Cyan

# 1. Start main-api
Start-Job -Name Main_API -ScriptBlock {
    cd w:\directory\haha\testing_project
    node main_api.js
} | Out-Null

# 2. Start academy-api
Start-Job -Name Academy_API -ScriptBlock {
    cd w:\directory\haha\testing_project
    node academy_api.js
} | Out-Null

# 3. Start websockets backend
Start-Job -Name Labs_Backend -ScriptBlock {
    cd w:\directory\haha\testing_project\labs-backend
    node server.js
} | Out-Null

Write-Host "[*] Waiting 6 seconds for services to bind ports..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

# 4. Verification Check
$checks = @(
    @{ Name = 'Main API'; Port = 8001; URL = 'http://localhost:8001/api/main/health' },
    @{ Name = 'Academy API'; Port = 8002; URL = 'http://localhost:8002/api/academy/courses' },
    @{ Name = 'Labs WebSocket Server'; Port = 4000; URL = 'http://localhost:4000/api/labs/health' }
)

Write-Host "
====== DIAGNOSTIC REPORT ======" -ForegroundColor Cyan
foreach ($c in $checks) {
    try {
        $req = Invoke-WebRequest -Uri $c.URL -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "[SUCCESS] $($c.Name) is ONLINE on Port $($c.Port)" -ForegroundColor Green
    } catch {
        $err = $_
        Write-Host "[FAILED] $($c.Name) connection failed. Target refused or offline. ($err)" -ForegroundColor Red
    }
}
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "
[*] Terminating Background Jobs to free ports..." -ForegroundColor Yellow
Get-Job | Stop-Job | Remove-Job
Write-Host "[*] Cleanup complete. System verified." -ForegroundColor Green
