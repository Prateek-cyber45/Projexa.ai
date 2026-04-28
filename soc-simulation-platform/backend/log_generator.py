"""
honeypot/log_generator.py
──────────────────────────
Simulates a live honeypot by generating realistic attack log entries.
Each scenario type has a distinct attack pattern with authentic payloads.
This is a SOFTWARE SIMULATION – no real network traffic is created.

In production this module can be swapped for a real Cowrie honeypot adapter.
"""

import asyncio
import random
import uuid
from datetime import datetime, timezone

from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.database import AsyncSessionLocal
from backend.models.log_entry import Severity
from backend.models.simulation import ScenarioType

fake = Faker()

# ── Attack pattern templates per scenario ─────────────────────────────────────
ATTACK_TEMPLATES: dict[str, list[dict]] = {
    ScenarioType.BRUTE_FORCE: [
        {"event_type": "SSH_LOGIN_ATTEMPT", "protocol": "TCP", "dest_port": 22,
         "payload_tmpl": "Failed password for {user} from {src_ip} port {src_port} ssh2"},
        {"event_type": "SSH_LOGIN_ATTEMPT", "protocol": "TCP", "dest_port": 22,
         "payload_tmpl": "Invalid user {user} from {src_ip}"},
        {"event_type": "AUTH_BRUTE_FORCE_DETECTED", "protocol": "TCP", "dest_port": 22,
         "payload_tmpl": "Repeated login failure threshold exceeded from {src_ip}"},
    ],
    ScenarioType.SQL_INJECTION: [
        {"event_type": "HTTP_SQLI_ATTEMPT", "protocol": "TCP", "dest_port": 80,
         "payload_tmpl": "GET /login?id=1' OR '1'='1 HTTP/1.1 from {src_ip}"},
        {"event_type": "HTTP_SQLI_ATTEMPT", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "POST /api/search body: {{\"q\":\"'; DROP TABLE users; --\"}}"},
        {"event_type": "WAF_BLOCK", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "SQLi pattern blocked from {src_ip}: UNION SELECT payload detected"},
    ],
    ScenarioType.RANSOMWARE: [
        {"event_type": "FILE_ENCRYPTION_ACTIVITY", "protocol": "TCP", "dest_port": 445,
         "payload_tmpl": "Mass file rename detected: *.docx → *.locked from {src_ip}"},
        {"event_type": "C2_BEACON", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "Outbound C2 communication to {dest_ip}:{dest_port}"},
        {"event_type": "REGISTRY_MODIFICATION", "protocol": "N/A", "dest_port": 0,
         "payload_tmpl": "Persistence key added: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"},
    ],
    ScenarioType.DDoS: [
        {"event_type": "FLOOD_DETECTED", "protocol": "UDP", "dest_port": 53,
         "payload_tmpl": "UDP flood: 50,000 pps from {src_ip} targeting {dest_ip}"},
        {"event_type": "AMPLIFICATION_ATTACK", "protocol": "UDP", "dest_port": 53,
         "payload_tmpl": "DNS amplification from {src_ip}, amplification factor 50x"},
        {"event_type": "SYN_FLOOD", "protocol": "TCP", "dest_port": 80,
         "payload_tmpl": "SYN flood detected from {src_ip}: 10,000 half-open connections"},
    ],
    ScenarioType.LATERAL_MOVEMENT: [
        {"event_type": "PASS_THE_HASH", "protocol": "TCP", "dest_port": 445,
         "payload_tmpl": "NTLM pass-the-hash from {src_ip} targeting {dest_ip}"},
        {"event_type": "KERBEROASTING", "protocol": "TCP", "dest_port": 88,
         "payload_tmpl": "Kerberos TGS request for SPN from compromised account from {src_ip}"},
        {"event_type": "RDP_BRUTE_FORCE", "protocol": "TCP", "dest_port": 3389,
         "payload_tmpl": "RDP brute-force attempt from {src_ip}"},
    ],
    ScenarioType.DATA_EXFILTRATION: [
        {"event_type": "DNS_TUNNELING", "protocol": "UDP", "dest_port": 53,
         "payload_tmpl": "Unusual DNS query length from {src_ip}: base64 payload suspected"},
        {"event_type": "LARGE_OUTBOUND_TRANSFER", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "250MB outbound transfer to {dest_ip}:443 – above baseline"},
        {"event_type": "CLOUD_EXFIL_ATTEMPT", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "Bulk upload to unknown cloud storage from {src_ip}"},
    ],
    ScenarioType.PHISHING: [
        {"event_type": "MALICIOUS_EMAIL_DETECTED", "protocol": "SMTP", "dest_port": 25,
         "payload_tmpl": "Phishing email from spoof@{src_ip}: Subject 'Your account is suspended'"},
        {"event_type": "MACRO_EXECUTION", "protocol": "N/A", "dest_port": 0,
         "payload_tmpl": "Office macro executed in downloaded attachment on host {dest_ip}"},
        {"event_type": "CREDENTIAL_HARVESTING_URL", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "User accessed phishing URL: http://secure-login-{src_ip}.evil.com"},
    ],
    ScenarioType.ZERO_DAY: [
        {"event_type": "UNKNOWN_EXPLOIT_SIGNATURE", "protocol": "TCP", "dest_port": 8080,
         "payload_tmpl": "Unknown exploit payload from {src_ip}: no matching CVE signature"},
        {"event_type": "MEMORY_CORRUPTION_DETECTED", "protocol": "N/A", "dest_port": 0,
         "payload_tmpl": "Buffer overflow attempt on pid 1234 from {src_ip}"},
        {"event_type": "ZERO_DAY_INDICATOR", "protocol": "TCP", "dest_port": 443,
         "payload_tmpl": "Behavioural anomaly – novel attack pattern detected from {src_ip}"},
    ],
}

SEVERITY_WEIGHTS = {
    "easy":   [0.5, 0.3, 0.15, 0.05],    # low, med, high, critical
    "medium": [0.2, 0.4, 0.25, 0.15],
    "hard":   [0.05, 0.20, 0.40, 0.35],
}


class LogGenerator:
    """
    Async generator that continuously creates log entries and persists them
    via their own DB session so they don't conflict with the request session.
    """

    def __init__(self, simulation_id: str, scenario: ScenarioType, difficulty: str = "medium"):
        self.simulation_id = simulation_id
        self.scenario = scenario
        self.difficulty = difficulty
        self.internal_network = [f"10.0.{random.randint(0,5)}.{i}" for i in range(1, 20)]
        self.honeypot_ip = "10.0.0.100"

    def _make_log(self) -> dict:
        templates = ATTACK_TEMPLATES.get(self.scenario, ATTACK_TEMPLATES[ScenarioType.BRUTE_FORCE])
        tmpl = random.choice(templates)
        src_ip = fake.ipv4_public()
        dest_ip = random.choice(self.internal_network)
        src_port = random.randint(1024, 65535)

        payload = tmpl["payload_tmpl"].format(
            src_ip=src_ip,
            dest_ip=dest_ip,
            src_port=src_port,
            dest_port=tmpl["dest_port"],
            user=fake.user_name(),
        )

        weights = SEVERITY_WEIGHTS.get(self.difficulty, SEVERITY_WEIGHTS["medium"])
        severity = random.choices(
            [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL],
            weights=weights,
        )[0]

        return {
            "simulation_id": uuid.UUID(self.simulation_id),
            "source_ip": src_ip,
            "dest_ip": dest_ip,
            "source_port": src_port,
            "dest_port": tmpl["dest_port"],
            "protocol": tmpl["protocol"],
            "event_type": tmpl["event_type"],
            "raw_payload": payload,
            "severity": severity,
            "timestamp": datetime.now(timezone.utc),
        }

    async def run(self):
        """Main loop – writes logs every HONEYPOT_LOG_INTERVAL_SECONDS seconds."""
        try:
            while True:
                async with AsyncSessionLocal() as db:
                    from backend.services.log_service import insert_log
                    from backend.ml.engine import enrich_log  # ML enrichment

                    log_data = self._make_log()
                    log_entry = await insert_log(db, log_data)

                    # Enrich with ML model
                    enriched = enrich_log(log_data)
                    log_entry.anomaly_score = enriched["anomaly_score"]
                    log_entry.is_anomaly = enriched["is_anomaly"]
                    log_entry.threat_label = enriched["threat_label"]

                    await db.commit()

                await asyncio.sleep(settings.HONEYPOT_LOG_INTERVAL_SECONDS)
        except asyncio.CancelledError:
            pass  # simulation stopped
