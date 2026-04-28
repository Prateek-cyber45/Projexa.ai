"""
services/scoring_service.py
────────────────────────────
Computes the dual score after a simulation ends:
  1. Technical Performance Score
  2. Decision-Making Under Pressure Score
Then merges them into a final grade.
"""

import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.log_entry import LogEntry, Severity
from backend.models.score import Score


# ── Decision submitted by the analyst during simulation ───────────────────────
@dataclass
class DecisionRecord:
    log_id: str
    analyst_label: str          # what the analyst classified the threat as
    time_taken_sec: float       # seconds from alert to decision
    correct: bool = False       # filled in by scoring engine


# In-memory store of decisions per simulation (replace with DB in production)
_decisions: dict[str, list[DecisionRecord]] = {}


def record_decision(simulation_id: str, decision: DecisionRecord):
    _decisions.setdefault(simulation_id, []).append(decision)


async def compute_score(
    db: AsyncSession,
    simulation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Score:
    """
    Run after simulation stops. Pulls log stats from DB, merges with
    decision records, then writes a Score row.
    """
    sim_id = str(simulation_id)

    # ── Gather log statistics ─────────────────────────────────────────────────
    total_logs_result = await db.execute(
        select(func.count()).where(LogEntry.simulation_id == simulation_id)
    )
    total_logs = total_logs_result.scalar_one() or 1

    anomaly_result = await db.execute(
        select(func.count()).where(
            LogEntry.simulation_id == simulation_id,
            LogEntry.is_anomaly == True,
        )
    )
    total_anomalies = anomaly_result.scalar_one() or 0

    critical_result = await db.execute(
        select(func.count()).where(
            LogEntry.simulation_id == simulation_id,
            LogEntry.severity == Severity.CRITICAL,
        )
    )
    total_critical = critical_result.scalar_one() or 0

    # ── Retrieve decision records ─────────────────────────────────────────────
    decisions = _decisions.get(sim_id, [])
    total_decisions = len(decisions) or 1
    correct_decisions = sum(1 for d in decisions if d.correct)
    avg_decision_time = (
        sum(d.time_taken_sec for d in decisions) / total_decisions
        if decisions else 30.0
    )

    # ── Technical Score (0–100) ───────────────────────────────────────────────
    detection_accuracy = min(correct_decisions / total_decisions * 100, 100)
    false_positive_rate = max(0, 100 - detection_accuracy)          # simplified
    response_speed_score = max(0, 100 - avg_decision_time)          # faster = higher
    technical_score = round(
        (detection_accuracy * 0.5) + (response_speed_score * 0.3) + (min(total_anomalies, 10) * 2),
        2,
    )
    technical_score = min(technical_score, 100)

    # ── Pressure Score (0–100) ────────────────────────────────────────────────
    decision_accuracy = correct_decisions / total_decisions * 100
    # Stress factor increases with difficulty and number of critical events
    stress_factor = 1 + (total_critical * 0.05)
    pressure_score = round(
        min((decision_accuracy * 0.6) + (max(0, 60 - avg_decision_time)) * 0.4, 100) * stress_factor,
        2,
    )
    pressure_score = min(pressure_score, 100)

    # ── Final composite score ─────────────────────────────────────────────────
    final_score = round((technical_score * 0.6) + (pressure_score * 0.4), 2)
    grade = _letter_grade(final_score)
    feedback = _generate_feedback(grade, detection_accuracy, avg_decision_time)

    score = Score(
        user_id=user_id,
        simulation_id=simulation_id,
        detection_accuracy=detection_accuracy,
        false_positive_rate=false_positive_rate,
        response_speed=avg_decision_time,
        correct_escalations=correct_decisions,
        technical_score=technical_score,
        avg_decision_time_sec=avg_decision_time,
        decision_accuracy=decision_accuracy,
        stress_factor=stress_factor,
        pressure_score=pressure_score,
        final_score=final_score,
        grade=grade,
        feedback=feedback,
    )
    db.add(score)
    await db.flush()
    return score


def _letter_grade(score: float) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


def _generate_feedback(grade: str, detection_acc: float, avg_time: float) -> str:
    msgs = {
        "A": "Outstanding performance. You identified threats quickly and with high accuracy.",
        "B": "Good work. Minor improvements in response time or detection could push you to A.",
        "C": "Satisfactory. Focus on reducing false positives and improving decision speed.",
        "D": "Needs improvement. Review threat classification and response procedures.",
        "F": "Critical gaps detected. Consider reviewing SOC fundamentals before retrying.",
    }
    base = msgs.get(grade, "")
    if avg_time > 45:
        base += " Your average decision time was slow—practice triage workflows."
    if detection_acc < 60:
        base += " Detection accuracy needs significant improvement."
    return base
