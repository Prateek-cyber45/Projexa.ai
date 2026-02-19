"""
main.py
────────
FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import engine, Base

# Import all models so SQLAlchemy registers them before create_all
import backend.models  # noqa: F401

from backend.routers import auth, simulation, logs, scoring


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Creates database tables on startup (use Alembic for production migrations)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Industry-Oriented Cybersecurity Simulation Platform – "
        "SOC Analyst, Incident Responder, and Threat Hunter training."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (adjust origins for production) ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(simulation.router)
app.include_router(logs.router)
app.include_router(scoring.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "env": settings.APP_ENV}
