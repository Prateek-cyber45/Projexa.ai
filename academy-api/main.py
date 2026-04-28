import os
import time
import asyncio
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from databases import Database
import redis.asyncio as redis
from logger import setup_logger

# ── Configuration ──────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:password@localhost:5432/deephunt")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/1")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

# ── Services ───────────────────────────────────────────
database = Database(DATABASE_URL)
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
logger = setup_logger('academy-api', 'logs/academy_api.log')

# ── App Setup ──────────────────────────────────────────
app = FastAPI(title="DeepHunt Academy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Logging Middleware ─────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        elapsed = round((time.time() - start) * 1000, 2)
        if request.url.path not in ("/health", "/api/academy/health"):
            logger.info(f"HTTP {response.status_code} | {request.method} {request.url.path} | {elapsed}ms")
        response.headers["X-Response-Time"] = f"{elapsed}ms"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response

app.add_middleware(RequestLoggingMiddleware)

# ── Schemas ────────────────────────────────────────────
class ProgressPayload(BaseModel):
    user_id: int
    course_id: str
    status: str
    score: Optional[float] = 0.0

class ProgressUpdate(BaseModel):
    status: str
    score: Optional[float] = None

class CertificationPayload(BaseModel):
    user_id: int
    course_id: str
    title: str

# ── Lifecycle ──────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("Academy API starting up...")
    await database.connect()
    logger.info("Database connected")
    # Create tables individually to avoid asyncpg multi-statement error
    tables = [
        """
        CREATE TABLE IF NOT EXISTS courses (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            level VARCHAR(50),
            duration VARCHAR(50),
            category VARCHAR(100)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            course_id VARCHAR(100) REFERENCES courses(id),
            status VARCHAR(50) DEFAULT 'enrolled',
            score REAL DEFAULT 0,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_certifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            course_id VARCHAR(100) REFERENCES courses(id),
            title VARCHAR(255) NOT NULL,
            certificate_hash VARCHAR(255) UNIQUE NOT NULL,
            issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    for table_query in tables:
        await database.execute(table_query)
    # Seed courses if empty
    count = await database.fetch_val("SELECT COUNT(*) FROM courses")
    if count == 0:
        await seed_courses()
        logger.info("Courses seeded")
    logger.info("Academy API ready")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Academy API shutting down...")
    await database.disconnect()
    await redis_client.close()

async def seed_courses():
    courses = [
        ("deep-hunt-osint-foundation", "Open Source Intelligence (OSINT) Foundation", "Master techniques to gather intelligence from publicly available sources to profile attackers.", "Beginner", "2 Hours", "intelligence"),
        ("ai-red-team", "Offensive AI: Automated Red Teaming", "Utilize autonomous agents and LLMs to uncover vulnerabilities at scale.", "Advanced", "4 Hours", "offensive"),
        ("scada-defense", "ICS/SCADA Cyber Defense", "Learn to monitor and defend electrical grids and critical infrastructure from state-sponsored attacks.", "Intermediate", "6 Hours", "defensive")
    ]
    for c in courses:
        await database.execute(
            "INSERT INTO courses (id, title, description, level, duration, category) VALUES (:id, :t, :d, :l, :dur, :cat)",
            {"id": c[0], "t": c[1], "d": c[2], "l": c[3], "dur": c[4], "cat": c[5]}
        )

# ── Endpoints ──────────────────────────────────────────
@app.get("/api/academy/health")
async def health():
    db_ok = False
    redis_ok = False
    try:
        await database.fetch_val("SELECT 1")
        db_ok = True
    except Exception:
        pass
    try:
        await redis_client.ping()
        redis_ok = True
    except Exception:
        pass
    return {"status": "ok", "service": "academy-api", "database": db_ok, "redis": redis_ok}

@app.get("/api/academy/courses")
async def get_courses():
    rows = await database.fetch_all("SELECT * FROM courses")
    logger.info(f"Courses fetched: {len(rows)} items")
    return [dict(r) for r in rows]

@app.get("/api/academy/courses/{course_id}")
async def get_course(course_id: str):
    row = await database.fetch_one("SELECT * FROM courses WHERE id = :id", {"id": course_id})
    if not row:
        raise HTTPException(status_code=404, detail="Course not found")
    return dict(row)

@app.post("/api/academy/progress")
async def get_or_create_progress(payload: ProgressPayload):
    row = await database.fetch_one("SELECT * FROM user_progress WHERE user_id = :u AND course_id = :c", {"u": payload.user_id, "c": payload.course_id})
    if row:
        return dict(row)
    
    query = """
        INSERT INTO user_progress (user_id, course_id, status, score) 
        VALUES (:u, :c, :s, :score) RETURNING *
    """
    new_row = await database.fetch_one(query=query, values={"u": payload.user_id, "c": payload.course_id, "s": payload.status, "score": payload.score})
    logger.info(f"Progress created: user={payload.user_id}, course={payload.course_id}")
    return dict(new_row)

@app.put("/api/academy/progress/{progress_id}")
async def update_progress(progress_id: int, payload: ProgressUpdate):
    if payload.status == 'completed':
        query = "UPDATE user_progress SET status=:s, score=:score, completed_at=CURRENT_TIMESTAMP WHERE id=:id RETURNING *"
    else:
        query = "UPDATE user_progress SET status=:s, score=:score WHERE id=:id RETURNING *"
    row = await database.fetch_one(query=query, values={"s": payload.status, "score": payload.score, "id": progress_id})
    if not row:
         raise HTTPException(status_code=404, detail="Progress not found")
    logger.info(f"Progress updated: id={progress_id}, status={payload.status}")
    return dict(row)

@app.get("/api/academy/users/{user_id}/certifications")
async def get_certs(user_id: int):
    rows = await database.fetch_all("SELECT * FROM user_certifications WHERE user_id = :u", {"u": user_id})
    return [dict(r) for r in rows]

@app.post("/api/academy/certifications")
async def post_cert(payload: CertificationPayload):
    import uuid
    cert_hash = str(uuid.uuid4()).replace("-", "") + str(payload.user_id)
    query = """
        INSERT INTO user_certifications (user_id, course_id, title, certificate_hash)
        VALUES (:u, :c, :t, :h) RETURNING *
    """
    row = await database.fetch_one(query=query, values={"u": payload.user_id, "c": payload.course_id, "t": payload.title, "h": cert_hash})
    logger.info(f"Certification issued: user={payload.user_id}, course={payload.course_id}")
    return dict(row)
