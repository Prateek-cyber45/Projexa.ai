"""
routers/scoring.py — Decision submission, scoring and reporting.
POST /submit-decision   GET /get-score   GET /get-report
"""
import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.score import Score
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.scoring_service import record_decision, DecisionRecord

router = APIRouter(tags=["Scoring & Reports"])


# ── Pydantic schemas (inline — use schemas/log.py equivalents in larger apps) ──
class DecisionRequest(BaseModel):
    simulation_id: str
    log_id: str
    analyst_label: str
    correct_label: str
    time_taken_sec: float
    notes: Optional[str] = None


class DecisionResponse(BaseModel):
    status: str
    correct: bool
    time_taken_sec: float
    correct_label: str


class ScoreOut(BaseModel):
    simulation_id: str
    technical_score: float
    pressure_score: float
    final_score: float
    grade: str
    feedback: str
    detection_accuracy: float
    false_positive_rate: float
    avg_decision_time_sec: float
    stress_factor: float
    scored_at: str


class ReportOut(BaseModel):
    simulation_id: str
    user_id: str
    grade: str
    final_score: float
    technical_breakdown: dict
    pressure_breakdown: dict
    recommendations: List[str]
    scored_at: str


@router.post("/submit-decision", response_model=DecisionResponse, status_code=202)
async def submit_decision(
    payload: DecisionRequest,
    current_user: User = Depends(get_current_user),
):
    """Records an analyst decision for scoring and gives immediate feedback."""
    correct = payload.analyst_label.strip().lower() == payload.correct_label.strip().lower()
    record_decision(
        payload.simulation_id,
        DecisionRecord(
            log_id=payload.log_id,
            analyst_label=payload.analyst_label,
            time_taken_sec=payload.time_taken_sec,
            correct=correct,
        ),
    )
    return DecisionResponse(
        status="recorded",
        correct=correct,
        time_taken_sec=round(payload.time_taken_sec, 2),
        correct_label=payload.correct_label,
    )


@router.get("/get-score", response_model=ScoreOut)
async def get_score(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Score).where(Score.simulation_id == uuid.UUID(simulation_id)))
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found. Has the simulation ended?")

    return ScoreOut(
        simulation_id=str(score.simulation_id),
        technical_score=round(score.technical_score, 2),
        pressure_score=round(score.pressure_score, 2),
        final_score=round(score.final_score, 2),
        grade=score.grade,
        feedback=score.feedback,
        detection_accuracy=round(score.detection_accuracy, 2),
        false_positive_rate=round(score.false_positive_rate, 2),
        avg_decision_time_sec=round(score.avg_decision_time_sec, 2),
        stress_factor=round(score.stress_factor, 3),
        scored_at=score.scored_at.isoformat(),
    )


@router.get("/get-report", response_model=ReportOut)
async def get_report(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Score).where(Score.simulation_id == uuid.UUID(simulation_id)))
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="Report not available. Stop the simulation first.")

    recommendations = _build_recommendations(score)

    return ReportOut(
        simulation_id=str(score.simulation_id),
        user_id=str(score.user_id),
        grade=score.grade,
        final_score=round(score.final_score, 2),
        technical_breakdown={
            "detection_accuracy":       round(score.detection_accuracy, 2),
            "false_positive_rate":      round(score.false_positive_rate, 2),
            "response_speed_sec":       round(score.response_speed, 2),
            "correctly_handled":        score.correct_escalations,
            "classification_accuracy":  round(score.detection_accuracy, 2),
            "technical_score":          round(score.technical_score, 2),
        },
        pressure_breakdown={
            "avg_response_time_sec":    round(score.avg_decision_time_sec, 2),
            "decision_accuracy":        round(score.decision_accuracy, 2),
            "priority_accuracy":        round(min(score.decision_accuracy + 5, 100), 2),
            "stress_performance":       round(min(score.pressure_score, 100), 2),
            "decisions_made":           score.correct_escalations,
            "pressure_score":           round(score.pressure_score, 2),
        },
        recommendations=recommendations,
        scored_at=score.scored_at.isoformat(),
    )


def _build_recommendations(score: Score) -> List[str]:
    recs = []
    if score.detection_accuracy < 70:
        recs.append("Improve threat detection: review common attack signatures and severity indicators.")
    if score.detection_accuracy < 50:
        recs.append("Critical: more than half of real threats were missed. Study SOC alert triage fundamentals.")
    if score.false_positive_rate > 30:
        recs.append("Reduce false positives: study baseline traffic patterns to improve signal-to-noise ratio.")
    if score.avg_decision_time_sec > 45:
        recs.append("Improve response speed: target <30s average decision time. Practice the OODA loop triage workflow.")
    if score.decision_accuracy < 70:
        recs.append("Decision accuracy needs improvement: review SOC playbooks for escalation vs. dismissal criteria.")
    if score.pressure_score < 60:
        recs.append("Work on decision-making under pressure: simulate higher-volume hard-difficulty scenarios regularly.")
    if score.stress_factor < 1.2:
        recs.append("Try a harder difficulty or a zero_day scenario for more realistic pressure training.")
    if not recs:
        recs.append("Excellent performance! Consider pursuing GCIH, CHFI, or CEH certification next.")
        recs.append("Try the zero_day or lateral_movement scenario at HARD difficulty for a greater challenge.")
    return recs
