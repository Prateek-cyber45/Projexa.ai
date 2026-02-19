"""
models/simulation.py
────────────────────
Tracks each simulation session – start/stop times and active scenario.
"""

import uuid
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class SimulationStatus(str, enum.Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    COMPLETED = "completed"


class ScenarioType(str, enum.Enum):
    BRUTE_FORCE = "brute_force"
    SQL_INJECTION = "sql_injection"
    RANSOMWARE = "ransomware"
    DDoS = "ddos"
    LATERAL_MOVEMENT = "lateral_movement"
    DATA_EXFILTRATION = "data_exfiltration"
    PHISHING = "phishing"
    ZERO_DAY = "zero_day"


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    scenario: Mapped[ScenarioType] = mapped_column(
        SAEnum(ScenarioType), default=ScenarioType.BRUTE_FORCE
    )
    status: Mapped[SimulationStatus] = mapped_column(
        SAEnum(SimulationStatus), default=SimulationStatus.RUNNING
    )
    difficulty: Mapped[str] = mapped_column(String(16), default="medium")  # easy|medium|hard
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="simulations")
    logs: Mapped[list["LogEntry"]] = relationship(back_populates="simulation")
    score: Mapped["Score | None"] = relationship(back_populates="simulation", uselist=False)
