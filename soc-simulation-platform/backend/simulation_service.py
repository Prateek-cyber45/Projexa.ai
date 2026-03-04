"""
services/simulation_service.py
────────────────────────────────
Starts / stops simulation sessions and delegates log generation
to the honeypot engine running as a background task.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.simulation import Simulation, SimulationStatus, ScenarioType
from backend.honeypot.log_generator import LogGenerator


# In-memory registry of running generator tasks  {simulation_id: asyncio.Task}
_running_tasks: dict[str, asyncio.Task] = {}


async def start_simulation(
    db: AsyncSession,
    user_id: uuid.UUID,
    scenario: ScenarioType,
    difficulty: str,
) -> Simulation:
    """Creates a DB record and kicks off the background log generator."""
    sim = Simulation(
        user_id=user_id,
        scenario=scenario,
        difficulty=difficulty,
        status=SimulationStatus.RUNNING,
    )
    db.add(sim)
    await db.flush()

    # Start background log generation
    generator = LogGenerator(simulation_id=str(sim.id), scenario=scenario, difficulty=difficulty)
    task = asyncio.create_task(generator.run())
    _running_tasks[str(sim.id)] = task

    return sim


async def stop_simulation(db: AsyncSession, simulation_id: uuid.UUID) -> Optional[Simulation]:
    """Stops background task and marks simulation as COMPLETED."""
    sim_id_str = str(simulation_id)

    # Cancel the background task if running
    task = _running_tasks.pop(sim_id_str, None)
    if task:
        task.cancel()

    # Update DB record
    await db.execute(
        update(Simulation)
        .where(Simulation.id == simulation_id)
        .values(status=SimulationStatus.COMPLETED, stopped_at=datetime.now(timezone.utc))
    )
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    return result.scalar_one_or_none()


async def get_simulation(db: AsyncSession, simulation_id: uuid.UUID) -> Optional[Simulation]:
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    return result.scalar_one_or_none()


async def get_user_simulations(db: AsyncSession, user_id: uuid.UUID) -> list[Simulation]:
    result = await db.execute(
        select(Simulation).where(Simulation.user_id == user_id).order_by(Simulation.started_at.desc())
    )
    return result.scalars().all()
