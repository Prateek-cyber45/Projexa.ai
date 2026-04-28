from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt # PyJWT
from datetime import datetime, timedelta
import bcrypt
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Read secrets from Docker secrets if available (mounted at /run/secrets/...)
def _read_secret(path, default=None):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except Exception:
        return default

DB_PASSWORD = _read_secret('/run/secrets/db_password') or os.environ.get('DB_PASSWORD')
JWT_SECRET = _read_secret('/run/secrets/jwt_private_key') or os.environ.get('JWT_SECRET') or 'read-from-secrets-file'

# Database connection params
DB_HOST = os.environ.get('POSTGRES_HOST', 'postgres')
DB_NAME = os.environ.get('POSTGRES_DB', 'cyberplatform')
DB_USER = os.environ.get('POSTGRES_USER', 'admin')

def get_db_conn():
    conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
    return conn

def init_db():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash BYTEA NOT NULL
        )
        """
    )
    conn.commit()
    cur.close()
    conn.close()

app = FastAPI()

# CORS: allow local dev origins so the Next.js frontends can call the API
origins = [
    "http://127.0.0.1",
    "http://localhost",
    "http://main.com",
    "http://academy.main.com",
    "http://labs.main.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Configuration
# If the provided JWT secret is an RSA/PEM key, fall back to an HMAC secret for local dev
if JWT_SECRET and "BEGIN" in JWT_SECRET:
    SECRET_KEY = os.environ.get('JWT_HMAC_SECRET', 'dev_hmac_secret')
    ALGORITHM = "HS256"
else:
    SECRET_KEY = JWT_SECRET
    ALGORITHM = "HS256"

class User(BaseModel):
    username: str
    password: str


# Initialize DB on startup
try:
    init_db()
except Exception:
    # If DB isn't available at container start, continue — app will error on DB ops until ready
    pass

@app.post("/register")
async def register(user: User):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT username FROM users WHERE username = %s", (user.username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    hashed_str = hashed.decode('utf-8')
    email = f"{user.username}@local"
    cur.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", (user.username, email, hashed_str))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "User created successfully"}

@app.post("/login")
async def login(user: User):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE username = %s", (user.username,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    stored = row[0]
    if isinstance(stored, memoryview):
        stored = stored.tobytes().decode('utf-8')
    if isinstance(stored, bytes):
        stored = stored.decode('utf-8')
    if not bcrypt.checkpw(user.password.encode('utf-8'), stored.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = jwt.encode({"sub": user.username, "exp": datetime.utcnow() + timedelta(hours=24)}, SECRET_KEY)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def get_dashboard_data(token: str = Depends(oauth2_scheme)):
    """
    Validates the JWT and returns the user's live skill profile from PostgreSQL.
    """
    # 1. Decode and validate the JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # 2. Fetch the user's real AI profile data
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Pulling the rolling score and skill vectors updated by the AI Engine
        cursor.execute("""
            SELECT username, role, rolling_score, 
                   skill_vector_soc, skill_vector_forensics, skill_vector_network 
            FROM users 
            WHERE username = %s
        """, (username,))
        
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "username": user["username"],
            "role": user["role"],
            "rolling_score": float(user["rolling_score"] or 0),
            "skill_vectors": {
                "soc_analysis": float(user["skill_vector_soc"] or 0),
                "forensics": float(user["skill_vector_forensics"] or 0),
                "network_security": float(user["skill_vector_network"] or 0)
            }
        }
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
