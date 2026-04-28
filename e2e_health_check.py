"""
DeepHunt Platform — End-to-End Health Check
Verifies all services are reachable and responding correctly.
Usage: python e2e_health_check.py [--docker]
"""
import urllib.request
import urllib.error
import json
import time
import sys
import subprocess

# Detect mode
DOCKER_MODE = "--docker" in sys.argv

# Base URLs change depending on mode
if DOCKER_MODE:
    BASE = "http://localhost:3000"  # Via nginx gateway
else:
    BASE = "http://localhost"

endpoints = {
    "Main API Health":       f"{'http://localhost:8001' if not DOCKER_MODE else BASE}/api/main/health",
    "Academy API Health":    f"{'http://localhost:8002' if not DOCKER_MODE else BASE}/api/academy/health",
    "AI Engine Health":      f"{'http://localhost:8003' if not DOCKER_MODE else BASE}/ai/engine/health",
    "AI Stream Health":      f"{'http://localhost:8004' if not DOCKER_MODE else BASE}/ai/stream/health",
    "Labs Backend Health":   f"http://localhost:4000/api/labs/health",
    "Frontend (HTML)":       f"http://localhost:3003/",
    "Threat Intel Feed":     f"{'http://localhost:8001' if not DOCKER_MODE else BASE}/api/threat-intel",
    "Academy Courses":       f"{'http://localhost:8002' if not DOCKER_MODE else BASE}/api/academy/courses",
}

if DOCKER_MODE:
    endpoints["Nginx Gateway"] = f"{BASE}/"

PASS = 0
FAIL = 0
WARN = 0

def color(text, code):
    return f"\033[{code}m{text}\033[0m"

print("")
print(color("══════════════════════════════════════════════════", "36"))
print(color("  DeepHunt Platform — Health Integration Test", "1;36"))
print(color(f"  Mode: {'Docker' if DOCKER_MODE else 'Local Development'}", "36"))
print(color("══════════════════════════════════════════════════", "36"))
print("")

for name, url in endpoints.items():
    print(f"  [{color('PROBE', '33')}] {name}")
    print(f"         {color(url, '90')}")
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'DeepHunt-HealthCheck/2.0',
            'Accept': 'application/json'
        })
        start = time.time()
        with urllib.request.urlopen(req, timeout=5) as res:
            elapsed = round((time.time() - start) * 1000)
            status = res.getcode()
            body = res.read().decode()
            
            print(f"         {color(f'PASS', '1;32')} — HTTP {status} ({elapsed}ms)")
            
            # Parse response for extra info
            try:
                data = json.loads(body)
                if isinstance(data, dict):
                    # Show service health details
                    if "database" in data:
                        db_status = color("✓", "32") if data["database"] else color("✗", "31")
                        print(f"         Database: {db_status}")
                    if "redis" in data:
                        redis_status = color("✓", "32") if data["redis"] else color("✗", "31")
                        print(f"         Redis:    {redis_status}")
                    if "buffer_size" in data:
                        print(f"         Buffer:   {data['buffer_size']} events")
                elif isinstance(data, list):
                    print(f"         Data:     {len(data)} items")
            except json.JSONDecodeError:
                pass
            
            PASS += 1
            
    except urllib.error.HTTPError as e:
        elapsed = 0
        print(f"         {color('WARN', '1;33')} — HTTP {e.code} ({e.reason})")
        WARN += 1
    except urllib.error.URLError as e:
        print(f"         {color('FAIL', '1;31')} — Unreachable: {e.reason}")
        FAIL += 1
    except Exception as e:
        print(f"         {color('FAIL', '1;31')} — {e}")
        FAIL += 1
    
    print("")
    time.sleep(0.3)

# Docker container status check
if DOCKER_MODE:
    print(color("── Docker Container Status ─────────────────────", "36"))
    try:
        result = subprocess.run(
            ["docker", "compose", "ps", "--format", "json"],
            capture_output=True, text=True, timeout=10
        )
        if result.stdout.strip():
            for line in result.stdout.strip().split("\n"):
                try:
                    container = json.loads(line)
                    name = container.get("Name", "unknown")
                    state = container.get("State", "unknown")
                    health = container.get("Health", "N/A")
                    
                    state_color = "32" if state == "running" else "31"
                    health_color = "32" if health == "healthy" else "33"
                    
                    print(f"  {color(name, '37'):40} State: {color(state, state_color):20} Health: {color(health, health_color)}")
                except json.JSONDecodeError:
                    pass
    except Exception as e:
        print(f"  Could not query Docker: {e}")
    print("")

# Summary
print(color("══════════════════════════════════════════════════", "36"))
total = PASS + FAIL + WARN
print(f"  Results: {color(f'{PASS} PASS', '1;32')} | {color(f'{WARN} WARN', '1;33')} | {color(f'{FAIL} FAIL', '1;31')} / {total} total")

if FAIL == 0:
    print(f"  {color('All critical services are operational.', '1;32')}")
else:
    print(f"  {color(f'{FAIL} service(s) unreachable. Check logs.', '1;31')}")

print(color("══════════════════════════════════════════════════", "36"))
print("")

sys.exit(1 if FAIL > 0 else 0)
