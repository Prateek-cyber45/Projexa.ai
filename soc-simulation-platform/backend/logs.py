"""
routers/logs.py — Log retrieval and real-time ML threat analysis.
GET  /get-logs          POST /analyze-threat
"""
import uuid
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.log_entry import Severity
from backend.models.user import User
from backend.schemas.log import LogEntryResponse, AnalyzeThreatRequest, ThreatAnalysisResponse
from backend.routers.deps import get_current_user
from backend.services.log_service import get_logs_for_simulation
from backend.ml.engine import enrich_log

router = APIRouter(tags=["Logs & Threat Analysis"])

# Role-specific remediation playbooks
RECOMMENDATIONS = {
    "brute_force":      "Block source IP immediately. Enable account lockout (≥5 fails). Implement MFA. Review failed auth logs for time windows.",
    "sql_injection":    "Sanitise all inputs. Add parameterised queries. Review WAF rules. Check DB audit logs for data leakage.",
    "ransomware":       "ISOLATE affected host NOW. Disable SMB/network shares. Check for C2 beacons. Notify IR team. Preserve memory dump.",
    "ddos":             "Enable rate limiting. Contact upstream ISP for BGP scrubbing. Activate CDN DDoS protection. Monitor bandwidth.",
    "lateral_movement": "Reset compromised credentials. Segment network. Check for PtH/PtT indicators. Review privileged account usage.",
    "data_exfil":       "Block outbound traffic to unknown IPs. Audit DLP policies. Review DNS query logs. Check cloud storage permissions.",
    "phishing":         "Quarantine email. Reset affected user credentials. Block phishing domain in DNS. Conduct user awareness briefing.",
    "zero_day":         "ISOLATE affected system. Capture full memory dump. Escalate to CISO. Contact vendor. No network access until patched.",
    "benign":           "Normal traffic pattern. No action required. Continue baseline monitoring.",
}

ANALYSIS_SUMMARY = {
    "brute_force":      "Repeated authentication failures from a single source IP indicate automated credential stuffing or password spraying.",
    "sql_injection":    "SQL metacharacters detected in HTTP request payload — application layer exploitation attempt in progress.",
    "ransomware":       "File encryption activity and outbound C2 communication detected — ransomware execution in progress.",
    "ddos":             "High-volume traffic from distributed sources targeting a single endpoint — volumetric denial-of-service attack.",
    "lateral_movement": "Pass-the-Hash or Kerberoasting indicators — adversary is moving laterally through the internal network.",
    "data_exfil":       "Anomalous large outbound transfer or DNS tunnelling detected — possible data exfiltration attempt.",
    "phishing":         "Social engineering vector detected — user may have received or interacted with a malicious email.",
    "zero_day":         "Unknown exploit signature with no CVE match — behavioural analysis indicates novel attack technique.",
    "benign":           "Traffic matches known-good baseline patterns. No threat indicators detected.",
}


@router.get("/get-logs", response_model=List[LogEntryResponse])
async def get_logs(
    simulation_id: str = Query(..., description="Simulation UUID"),
    limit: int = Query(200, ge=1, le=500),
    severity: Optional[Severity] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await get_logs_for_simulation(db, uuid.UUID(simulation_id), limit=limit, severity=severity)
    return [
        LogEntryResponse(
            id=str(l.id), timestamp=l.timestamp.isoformat(),
            source_ip=l.source_ip, dest_ip=l.dest_ip,
            source_port=l.source_port, dest_port=l.dest_port,
            protocol=l.protocol, event_type=l.event_type,
            raw_payload=l.raw_payload,
            severity=l.severity.value if l.severity else None,
            threat_label=l.threat_label, anomaly_score=l.anomaly_score,
            is_anomaly=l.is_anomaly,
        )
        for l in logs
    ]


@router.post("/analyze-threat", response_model=ThreatAnalysisResponse)
async def analyze_threat(
    payload: AnalyzeThreatRequest,
    current_user: User = Depends(get_current_user),
):
    """Real-time ML analysis on a single log entry submitted by the frontend."""
    log_data = {
        "event_type":   payload.event_type,
        "raw_payload":  payload.raw_payload,
        "source_ip":    payload.source_ip,
        "dest_port":    payload.dest_port,
        "source_port":  0,
        "protocol":     payload.protocol,
        "severity":     payload.severity,
    }
    result = enrich_log(log_data)
    label = result["threat_label"]

    return ThreatAnalysisResponse(
        log_id=payload.log_id,
        threat_label=label,
        anomaly_score=result["anomaly_score"],
        is_anomaly=result["is_anomaly"],
        confidence=result.get("confidence", result["anomaly_score"]),
        recommendation=RECOMMENDATIONS.get(label, "Investigate and escalate if uncertain."),
        analysis_summary=ANALYSIS_SUMMARY.get(label, "Threat pattern requires further analysis."),
        top_predictions=result.get("top_predictions", []),
    )
