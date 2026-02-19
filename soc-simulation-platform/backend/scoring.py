"""
routers/scoring.py
───────────────────
POST /submit-decision  – analyst submits their threat classification decision
GET  /get-score        – retrieve the dual score for a simulation
GET  /get-report       – full performance report with recommendations
"""

import uuid
import time
from typing import Annotated, Optional
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


class DecisionRequest(BaseModel):
    simulation_id: str
    log_id: str
    analyst_label: str          # the analyst's classification
    correct_label: str          # ground-truth from honeypot metadata
    time_taken_sec: float       # how long the analyst took


class ScoreOut(BaseModel):
    simulation_id: str
    technical_score: float
    pressure_score: float
    final_score: float
    grade: str
    feedback: str
    detection_accuracy: float
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
    recommendations: list[str]
    scored_at: str


@router.post("/submit-decision", status_code=202)
async def submit_decision(
    payload: DecisionRequest,
    current_user: User = Depends(get_current_user),
):
    """Records the analyst's decision for later scoring."""
    correct = payload.analyst_label.lower() == payload.correct_label.lower()
    record_decision(
        payload.simulation_id,
        DecisionRecord(
            log_id=payload.log_id,
            analyst_label=payload.analyst_label,
            time_taken_sec=payload.time_taken_sec,
            correct=correct,
        ),
    )
    return {"status": "recorded", "correct": correct}


@router.get("/get-score", response_model=ScoreOut)
async def get_score(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Score).where(Score.simulation_id == uuid.UUID(simulation_id))
    )
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found. Has the simulation ended?")

    return ScoreOut(
        simulation_id=str(score.simulation_id),
        technical_score=score.technical_score,
        pressure_score=score.pressure_score,
        final_score=score.final_score,
        grade=score.grade,
        feedback=score.feedback,
        detection_accuracy=score.detection_accuracy,
        avg_decision_time_sec=score.avg_decision_time_sec,
        stress_factor=score.stress_factor,
        scored_at=score.scored_at.isoformat(),
    )


@router.get("/get-report", response_model=ReportOut)
async def get_report(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Score).where(Score.simulation_id == uuid.UUID(simulation_id))
    )
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="Report not available yet.")

    # Build recommendations based on weak areas
    recommendations = []
    if score.detection_accuracy < 80:
        recommendations.append("Improve threat detection: review attack signatures for common threat types.")
    if score.avg_decision_time_sec > 30:
        recommendations.append("Reduce decision time: practise quick triage using the OODA loop framework.")
    if score.false_positive_rate > 20:
        recommendations.append("Reduce false positives: refine alert tuning and contextual analysis.")
    if score.pressure_score < 60:
        recommendations.append("Work on decision-making under stress: simulate high-alert scenarios more frequently.")
    if not recommendations:
        recommendations.append("Outstanding performance. Consider pursuing GCIH or CHFI certification.")

    return ReportOut(
        simulation_id=str(score.simulation_id),
        user_id=str(score.user_id),
        grade=score.grade,
        final_score=score.final_score,
        technical_breakdown={
            "detection_accuracy": score.detection_accuracy,
            "false_positive_rate": score.false_positive_rate,
            "response_speed_sec": score.response_speed,
            "correct_escalations": score.correct_escalations,
            "technical_score": score.technical_score,
        },
        pressure_breakdown={
            "avg_decision_time_sec": score.avg_decision_time_sec,
            "decision_accuracy": score.decision_accuracy,
            "stress_factor": score.stress_factor,
            "pressure_score": score.pressure_score,
        },
        recommendations=recommendations,
        scored_at=score.scored_at.isoformat(),
    )
