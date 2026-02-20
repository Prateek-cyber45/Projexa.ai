"""
routers/simulation.py — Simulation session management.
POST /start-simulation   POST /stop-simulation   GET /simulations   GET /simulations/{id}
"""
import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.simulation import ScenarioType
from backend.models.user import User
from backend.schemas.simulation import SimulationCreate, SimulationResponse
from backend.routers.deps import get_current_user
from backend.services import simulation_service

router = APIRouter(tags=["Simulation"])


def _sim_to_schema(s) -> SimulationResponse:
    return SimulationResponse(
        id=str(s.id), scenario=s.scenario.value, status=s.status.value,
        difficulty=s.difficulty, started_at=s.started_at.isoformat(),
        stopped_at=s.stopped_at.isoformat() if s.stopped_at else None,
    )


@router.post("/start-simulation", response_model=SimulationResponse)
async def start_simulation(
    payload: SimulationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if payload.difficulty not in ("easy", "medium", "hard"):
        raise HTTPException(status_code=400, detail="difficulty must be: easy | medium | hard")
    try:
        scenario = ScenarioType(payload.scenario)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {payload.scenario}")

    sim = await simulation_service.start_simulation(db, current_user.id, scenario, payload.difficulty)
    return _sim_to_schema(sim)


@router.post("/stop-simulation", response_model=SimulationResponse)
async def stop_simulation(
    payload: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sim_id_str = payload.get("simulation_id")
    if not sim_id_str:
        raise HTTPException(status_code=400, detail="simulation_id required")

    sim = await simulation_service.stop_simulation(db, uuid.UUID(sim_id_str))
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # Compute score immediately after stopping
    from backend.services.scoring_service import compute_score
    await compute_score(db, sim.id, current_user.id)

    return _sim_to_schema(sim)


@router.get("/simulations", response_model=List[SimulationResponse])
async def list_simulations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sims = await simulation_service.get_user_simulations(db, current_user.id)
    return [_sim_to_schema(s) for s in sims]


@router.get("/simulations/{sim_id}", response_model=SimulationResponse)
async def get_simulation(
    sim_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sim = await simulation_service.get_simulation(db, uuid.UUID(sim_id))
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return _sim_to_schema(sim)
