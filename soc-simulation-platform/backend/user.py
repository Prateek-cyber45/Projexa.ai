"""
models/user.py
──────────────
SQLAlchemy ORM model for platform users.
Roles: soc_analyst | incident_responder | threat_hunter | admin
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base
import enum


class UserRole(str, enum.Enum):
    SOC_ANALYST = "soc_analyst"
    INCIDENT_RESPONDER = "incident_responder"
    THREAT_HUNTER = "threat_hunter"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), default=UserRole.SOC_ANALYST, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    simulations: Mapped[list["Simulation"]] = relationship(back_populates="user")
    scores: Mapped[list["Score"]] = relationship(back_populates="user")
