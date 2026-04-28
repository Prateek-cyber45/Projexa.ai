import os
import re
import json
import random
import asyncio
from datetime import datetime, timedelta
import httpx
import redis.asyncio as redis
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
import jwt
from databases import Database
from logger import setup_logger
from middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware, RateLimitMiddleware

# ── Configuration ──────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:password@localhost:5432/deephunt")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
JWT_SECRET = os.environ.get("JWT_SECRET", "your_super_secret_key_deephunt")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
ALGORITHM = "HS256"

# ── Services ───────────────────────────────────────────
database = Database(DATABASE_URL)
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
logger = setup_logger('main-api', 'logs/main_api.log')
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# ── App Setup ──────────────────────────────────────────
app = FastAPI(title="DeepHunt Main API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware, logger=logger)
app.add_middleware(RateLimitMiddleware, redis_client=redis_client, logger=logger)

# ── Schemas ────────────────────────────────────────────
class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    tier: str = 'normal'

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetVerify(BaseModel):
    email: str
    otp: str

class PasswordResetUpdate(BaseModel):
    email: str
    otp: str
    new_password: str

class ScorePayload(BaseModel):
    score: float

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    fullname: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    callingcode: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    message: str


# ── Audit Helper ───────────────────────────────────────
async def write_audit(event_type: str, actor_ip: str = None, actor_id: int = None, detail: dict = None):
    """Write a security event to the audit_log table."""
    try:
        await database.execute(
            "INSERT INTO audit_log (event_type, actor_ip, actor_id, detail) VALUES (:t, :ip, :aid, :d)",
            {"t": event_type, "ip": actor_ip, "aid": actor_id, "d": json.dumps(detail or {})}
        )
    except Exception as e:
        logger.error(f"Audit log write failed: {e}")

# ── DB Lifecycle ───────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("Main API starting up...")
    await database.connect()
    logger.info("Database connected")
    
    # Create tables if not exist (fallback for non-Docker runs without init.sql)
    # Create tables individual statements to avoid asyncpg multi-statement error
    tables = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            tier VARCHAR(50) DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            score REAL NOT NULL,
            lab_id VARCHAR(100) DEFAULT 'soc-sim-alpha',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            fullname VARCHAR(255),
            country VARCHAR(255),
            timezone VARCHAR(255),
            callingcode VARCHAR(50),
            phone VARCHAR(50),
            website VARCHAR(255)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            event_type VARCHAR(100) NOT NULL,
            actor_ip VARCHAR(45),
            actor_id INTEGER,
            detail JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_chats (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    for table_query in tables:
        await database.execute(table_query)
    logger.info("Tables verified")
    
    asyncio.create_task(threat_intel_updater())
    logger.info("Threat intel updater started")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Main API shutting down...")
    await database.disconnect()
    await redis_client.close()

# ── Auth Helpers ───────────────────────────────────────
def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Hashing failed: {e}")
        raise HTTPException(status_code=500, detail="Internal security error")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        return False

def get_user_id(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Routes ─────────────────────────────────────────────
@app.get("/api/main/health")
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
    return {"status": "ok", "service": "main-api", "database": db_ok, "redis": redis_ok}

@app.post("/api/main/register")
async def register(user: UserRegister, request: Request):
    logger.info(f"Registration attempt: {user.email}")
    query = "SELECT id FROM users WHERE LOWER(email) = LOWER(:email)"
    existing = await database.fetch_one(query=query, values={"email": user.email})
    if existing:
        await write_audit("register_duplicate", request.client.host, detail={"email": user.email})
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user.password)
    query = """
        INSERT INTO users (email, username, hashed_password, tier) 
        VALUES (:email, :username, :hashed, :tier) RETURNING id, email, username, tier, created_at
    """
    new_user = await database.fetch_one(query=query, values={
        "email": user.email, "username": user.username, "hashed": hashed, "tier": user.tier
    })
    
    await write_audit("register_success", request.client.host, new_user["id"], {"email": user.email})
    logger.info(f"User registered: {user.email} (id={new_user['id']})")
    return dict(new_user)

@app.post("/api/main/login")
async def login(user: UserLogin, request: Request):
    identifier = user.email.lower()
    logger.info(f"Login attempt: {identifier}")
    query = "SELECT * FROM users WHERE LOWER(email) = :id OR LOWER(username) = :id"
    record = await database.fetch_one(query=query, values={"id": identifier})
    if not record or not verify_password(user.password, record["hashed_password"]):
        await write_audit("login_failed", request.client.host, detail={"email": user.email})
        logger.warning(f"Failed login: {user.email} from {request.client.host}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    to_encode = {"sub": str(record["id"]), "email": record["email"], "tier": record["tier"]}
    to_encode.update({"exp": datetime.utcnow() + timedelta(hours=2)})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    
    await write_audit("login_success", request.client.host, record["id"], {"email": user.email})
    logger.info(f"Successful login: {user.email}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": record["id"], "email": record["email"], "username": record["username"], 
            "tier": record["tier"], "created_at": record["created_at"]
        }
    }

# ── Password Reset (Redis OTP) ────────────────────────
@app.post("/api/main/password-reset/request")
async def reset_request(payload: PasswordResetRequest, request: Request):
    email_lower = payload.email.lower()
    user = await database.fetch_one("SELECT id FROM users WHERE LOWER(email) = :e", {"e": email_lower})
    if not user:
        return {"detail": "If that email is registered, a code was sent."}
    
    otp = str(random.randint(100000, 999999))
    await redis_client.setex(f"otp:{email_lower}", 600, otp)
    
    await write_audit("password_reset_requested", request.client.host, user["id"], {"email": email_lower})
    logger.info(f"[OTP] Reset code for {email_lower}: {otp}")
    return {"detail": "If that email is registered, a code was sent."}

@app.post("/api/main/password-reset/verify")
async def reset_verify(payload: PasswordResetVerify, request: Request):
    email_lower = payload.email.lower()
    stored_otp = await redis_client.get(f"otp:{email_lower}")
    if not stored_otp or stored_otp != payload.otp:
        await write_audit("otp_verify_failed", request.client.host, detail={"email": email_lower})
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    return {"detail": "Code verified."}

@app.post("/api/main/password-reset/reset")
async def reset_update(payload: PasswordResetUpdate, request: Request):
    email_lower = payload.email.lower()
    stored_otp = await redis_client.get(f"otp:{email_lower}")
    if not stored_otp or stored_otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password too short")
    
    hashed = hash_password(payload.new_password)
    await database.execute("UPDATE users SET hashed_password = :h WHERE LOWER(email) = :e", {"h": hashed, "e": email_lower})
    await redis_client.delete(f"otp:{email_lower}")
    
    await write_audit("password_reset_complete", request.client.host, detail={"email": email_lower})
    logger.info(f"Password reset complete: {email_lower}")
    return {"detail": "Password updated successfully."}

# ── Profile & Dashboard ───────────────────────────────
@app.get("/api/main/scores")
async def get_scores(user_id: int = None, uid: str = Depends(get_user_id)):
    target_id = user_id if user_id else int(uid)
    return await database.fetch_all("SELECT * FROM scores WHERE user_id = :u ORDER BY created_at DESC", {"u": target_id})

@app.post("/api/main/scores")
async def post_scores(payload: ScorePayload, uid: str = Depends(get_user_id)):
    await database.execute("INSERT INTO scores (user_id, score) VALUES (:u, :s)", {"u": int(uid), "s": payload.score})
    logger.info(f"Score recorded: user={uid}, score={payload.score}")
    return {"detail": "Score recorded"}

@app.get("/api/main/dashboard")
async def get_dashboard(user_id: int = None, uid: str = Depends(get_user_id)):
    target_id = user_id if user_id else int(uid)
    user = await database.fetch_one("SELECT username FROM users WHERE id = :u", {"u": target_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    scores = await database.fetch_all("SELECT score FROM scores WHERE user_id = :u", {"u": target_id})
    avg_score = 42.5
    if scores:
        avg_score = sum(s["score"] for s in scores) / len(scores)
    
    return {
        "username": user["username"],
        "rolling_score": avg_score,
        "skill_vectors": {
            "soc_analysis": min(1.0, 0.72 + (avg_score/1000)),
            "forensics": min(1.0, 0.55 + (avg_score/1000)),
            "network_security": min(1.0, 0.68 + (avg_score/1000)),
            "incident_response": min(1.0, 0.40 + (avg_score/1000)),
            "threat_hunting": min(1.0, 0.81 + (avg_score/1000))
        }
    }

@app.get("/api/main/chats")
async def get_chats(uid: str = Depends(get_user_id)):
    target_id = int(uid)
    query = "SELECT id, role, message, created_at FROM ai_chats WHERE user_id = :u ORDER BY created_at ASC"
    rows = await database.fetch_all(query, {"u": target_id})
    return [dict(r) for r in rows]

@app.post("/api/main/chats")
async def save_chat(payload: ChatMessage, uid: str = Depends(get_user_id)):
    target_id = int(uid)
    query = """
        INSERT INTO ai_chats (user_id, role, message) 
        VALUES (:u, :r, :m) RETURNING id, created_at
    """
    res = await database.fetch_one(query, {"u": target_id, "r": payload.role, "m": payload.message})
    return {"detail": "Chat saved", "id": res["id"]}

@app.get("/api/main/profile")
async def get_profile(user_id: int = None, uid: str = Depends(get_user_id)):
    target_id = user_id if user_id else int(uid)
    user = await database.fetch_one("SELECT id, username, email, tier, created_at FROM users WHERE id = :u", {"u": target_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    prof = await database.fetch_one("SELECT fullname, country, timezone, callingcode, phone, website FROM user_profiles WHERE user_id = :u", {"u": target_id})
    result = dict(user)
    result["profile"] = dict(prof) if prof else {}
    return result

@app.put("/api/main/profile")
async def update_profile(payload: ProfileUpdate, uid: str = Depends(get_user_id)):
    user_id = int(uid)
    if payload.username:
        await database.execute("UPDATE users SET username = :un WHERE id = :u", {"un": payload.username, "u": user_id})
    
    existing = await database.fetch_one("SELECT user_id FROM user_profiles WHERE user_id = :u", {"u": user_id})
    if existing:
        await database.execute("""
            UPDATE user_profiles SET fullname=:fn, country=:co, timezone=:tz, 
            callingcode=:cc, phone=:ph, website=:ws WHERE user_id=:u
        """, {
            "fn": payload.fullname, "co": payload.country, "tz": payload.timezone,
            "cc": payload.callingcode, "ph": payload.phone, "ws": payload.website, "u": user_id
        })
    else:
        await database.execute("""
            INSERT INTO user_profiles (user_id, fullname, country, timezone, callingcode, phone, website)
            VALUES (:u, :fn, :co, :tz, :cc, :ph, :ws)
        """, {
            "u": user_id, "fn": payload.fullname, "co": payload.country, "tz": payload.timezone,
            "cc": payload.callingcode, "ph": payload.phone, "ws": payload.website
        })
    
    logger.info(f"Profile updated: user_id={user_id}")
    return {"detail": "success"}

# ── Audit Log Endpoint ────────────────────────────────
@app.get("/api/main/audit")
async def get_audit_log(uid: str = Depends(get_user_id), limit: int = 50):
    """Retrieve recent audit log entries (admin only in production)."""
    rows = await database.fetch_all(
        "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT :l", {"l": min(limit, 200)}
    )
    return [dict(r) for r in rows]

# ── Threat Intel (RSS Aggregation) ────────────────────
@app.get("/api/threat-intel")
async def get_threat_intel():
    data = await redis_client.get("threat_intel")
    if data:
        return json.loads(data)
    return []

async def fetch_rss(url, agency):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10.0)
            xml = resp.text
            items = []
            for match in re.finditer(r'<item>([\s\S]*?)<\/item>', xml):
                if len(items) >= 15: break
                item = match.group(1)
                
                t_match = re.search(r'<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>', item)
                l_match = re.search(r'<link>([\s\S]*?)<\/link>', item)
                d_match = re.search(r'<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>', item)
                p_match = re.search(r'<pubDate>([\s\S]*?)<\/pubDate>', item)
                
                if t_match and l_match:
                    desc_raw = (d_match.group(1) or d_match.group(2)) if d_match else ""
                    desc = re.sub(r'<[^>]*>?', '', desc_raw).strip()
                    if len(desc) > 200: desc = desc[:197] + "..."
                    
                    items.append({
                        "title": (t_match.group(1) or t_match.group(2)).strip(),
                        "link": l_match.group(1).strip(),
                        "description": desc,
                        "pubDate": p_match.group(1).strip() if p_match else datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT'),
                        "agency": agency
                    })
            return items
    except Exception as e:
        logger.error(f"RSS fetch failed for {agency}: {e}")
        return []

async def threat_intel_updater():
    while True:
        try:
            logger.info("Fetching latest cyber threat intel...")
            feeds = await asyncio.gather(
                fetch_rss('https://www.cisa.gov/cybersecurity-advisories/all.xml', 'CISA'),
                fetch_rss('https://www.bleepingcomputer.com/feed/', 'BleepingComputer'),
                fetch_rss('https://krebsonsecurity.com/feed/', 'KrebsOnSecurity')
            )
            combined = [item for sublist in feeds for item in sublist]
            combined.sort(key=lambda x: str(x.get('pubDate', '')), reverse=True)
            await redis_client.set("threat_intel", json.dumps(combined))
            logger.info(f"Threat intel updated: {len(combined)} items cached")
        except Exception as e:
            logger.error(f"Threat intel update failed: {e}")
        await asyncio.sleep(600)  # every 10 min
