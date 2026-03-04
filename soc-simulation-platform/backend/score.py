"""
models/score.py
───────────────
Dual-scoring model: Technical Performance + Decision-Making Under Pressure.
"""

import uuid
from datetime import datetime
from sqlalchemy import Float, ForeignKey, DateTime, Text, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    simulation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("simulations.id"), unique=True, nullable=False
    )

    # ── Technical Performance Score (0–100) ───────────────────────────────────
    detection_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    false_positive_rate: Mapped[float] = mapped_column(Float, default=0.0)
    response_speed: Mapped[float] = mapped_column(Float, default=0.0)   # seconds
    correct_escalations: Mapped[int] = mapped_column(Integer, default=0)
    technical_score: Mapped[float] = mapped_column(Float, default=0.0)

    # ── Decision-Making Under Pressure Score (0–100) ──────────────────────────
    avg_decision_time_sec: Mapped[float] = mapped_column(Float, default=0.0)
    decision_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    stress_factor: Mapped[float] = mapped_column(Float, default=1.0)  # multiplier
    pressure_score: Mapped[float] = mapped_column(Float, default=0.0)

    # ── Composite ─────────────────────────────────────────────────────────────
    final_score: Mapped[float] = mapped_column(Float, default=0.0)
    grade: Mapped[str] = mapped_column(default="F")             # A, B, C, D, F
    feedback: Mapped[str] = mapped_column(Text, default="")

    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="scores")
    simulation: Mapped["Simulation"] = relationship(back_populates="score")
