"""
routers/logs.py
────────────────
GET  /get-logs           – paginated log retrieval for a simulation
POST /analyze-threat     – submit a log entry to the ML engine for live analysis
"""

import uuid
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.log_entry import Severity
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.log_service import get_logs_for_simulation
from backend.ml.engine import enrich_log

router = APIRouter(tags=["Logs & Threat Analysis"])


class LogOut(BaseModel):
    id: str
    timestamp: str
    source_ip: str
    dest_ip: str
    source_port: int
    dest_port: int
    protocol: str
    event_type: str
    raw_payload: str
    severity: Optional[str]
    threat_label: Optional[str]
    anomaly_score: Optional[float]
    is_anomaly: bool


class AnalyzeThreatRequest(BaseModel):
    simulation_id: str
    log_id: str
    event_type: str
    raw_payload: str
    source_ip: str
    dest_port: int
    protocol: str
    severity: str


class AnalyzeThreatResponse(BaseModel):
    log_id: str
    threat_label: str
    anomaly_score: float
    is_anomaly: bool
    recommendation: str


@router.get("/get-logs", response_model=list[LogOut])
async def get_logs(
    simulation_id: str = Query(..., description="UUID of the simulation"),
    limit: int = Query(100, ge=1, le=500),
    severity: Optional[Severity] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await get_logs_for_simulation(
        db, uuid.UUID(simulation_id), limit=limit, severity=severity
    )
    return [
        LogOut(
            id=str(l.id),
            timestamp=l.timestamp.isoformat(),
            source_ip=l.source_ip,
            dest_ip=l.dest_ip,
            source_port=l.source_port,
            dest_port=l.dest_port,
            protocol=l.protocol,
            event_type=l.event_type,
            raw_payload=l.raw_payload,
            severity=l.severity.value if l.severity else None,
            threat_label=l.threat_label,
            anomaly_score=l.anomaly_score,
            is_anomaly=l.is_anomaly,
        )
        for l in logs
    ]


@router.post("/analyze-threat", response_model=AnalyzeThreatResponse)
async def analyze_threat(
    payload: AnalyzeThreatRequest,
    current_user: User = Depends(get_current_user),
):
    """Runs real-time ML analysis on a single log entry."""
    log_data = {
        "event_type": payload.event_type,
        "raw_payload": payload.raw_payload,
        "source_ip": payload.source_ip,
        "dest_port": payload.dest_port,
        "source_port": 0,
        "protocol": payload.protocol,
        "severity": payload.severity,
    }
    result = enrich_log(log_data)

    # Role-specific recommendations
    rec_map = {
        "brute_force": "Block source IP, enable account lockout policy.",
        "sql_injection": "Sanitise inputs, review WAF rules, patch vulnerable endpoints.",
        "ransomware": "Isolate affected host immediately, disable SMB shares.",
        "ddos": "Enable rate limiting, contact upstream ISP for traffic scrubbing.",
        "lateral_movement": "Reset compromised credentials, segment network.",
        "data_exfil": "Block outbound traffic to unknown IPs, audit DLP policies.",
        "phishing": "Quarantine email, reset credentials, user awareness training.",
        "zero_day": "Isolate system, capture memory dump for analysis, escalate.",
        "benign": "No action required – normal traffic pattern.",
    }
    recommendation = rec_map.get(result["threat_label"], "Investigate and escalate if uncertain.")

    return AnalyzeThreatResponse(
        log_id=payload.log_id,
        threat_label=result["threat_label"],
        anomaly_score=result["anomaly_score"],
        is_anomaly=result["is_anomaly"],
        recommendation=recommendation,
    )
