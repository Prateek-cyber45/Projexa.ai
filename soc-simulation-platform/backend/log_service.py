"""
services/log_service.py
───────────────────────
CRUD operations on LogEntry records.
After inserting, runs ML enrichment (anomaly score + threat label).
"""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.log_entry import LogEntry, Severity


async def insert_log(db: AsyncSession, log_data: dict) -> LogEntry:
    """Persist a raw log and return the saved record (ML enrichment added separately)."""
    entry = LogEntry(**log_data)
    db.add(entry)
    await db.flush()
    return entry


async def get_logs_for_simulation(
    db: AsyncSession,
    simulation_id: uuid.UUID,
    limit: int = 200,
    severity: Optional[Severity] = None,
) -> list[LogEntry]:
    query = (
        select(LogEntry)
        .where(LogEntry.simulation_id == simulation_id)
        .order_by(LogEntry.timestamp.desc())
        .limit(limit)
    )
    if severity:
        query = query.where(LogEntry.severity == severity)

    result = await db.execute(query)
    return result.scalars().all()


async def count_anomalies(db: AsyncSession, simulation_id: uuid.UUID) -> int:
    from sqlalchemy import func, select
    result = await db.execute(
        select(func.count()).where(
            LogEntry.simulation_id == simulation_id,
            LogEntry.is_anomaly == True,
        )
    )
    return result.scalar_one()
