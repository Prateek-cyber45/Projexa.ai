from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import redis
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI(title="Academy API - Course Management")

# CORS: allow academy and main frontends
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

# Connect to the internal shared infrastructure on data-net
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@postgres:5432/cyberplatform")

# Initialize Redis client
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

@app.get("/api/courses")
async def get_courses():
    """
    Fetches all courses from the database with Redis caching.
    """
    cache_key = "courses_catalog"
    
    # Try cache first
    cached = redis_client.get(cache_key)
    if cached:
        print("[*] Cache HIT for courses catalog")
        try:
            return json.loads(cached)
        except Exception:
            pass
    
    # Cache miss - fetch from DB
    print("[*] Cache MISS for courses catalog. Fetching from DB...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, module_count 
            FROM courses
            ORDER BY id
        """)
        courses = cursor.fetchall()
        
        # Cache for 1 hour
        try:
            redis_client.setex(cache_key, 3600, json.dumps(courses))
        except Exception:
            pass
        
        return courses
    except Exception as e:
        # Return empty list if table doesn't exist yet
        return []
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@app.get("/api/courses/{course_id}")
async def get_course_details(course_id: int):
    """
    Fetches course details. Implements a Cache-Aside pattern using Redis.
    """
    cache_key = f"course_data:{course_id}"

    # 1. Try to fetch the data from the Redis Cache (Fast)
    cached_course = redis_client.get(cache_key)
    if cached_course:
        print(f"[*] Cache HIT for course {course_id}")
        try:
            return json.loads(cached_course)
        except Exception:
            # If stored data is corrupted, fall through to DB fetch
            pass

    # 2. Cache MISS: Fetch from PostgreSQL (Slower)
    print(f"[*] Cache MISS for course {course_id}. Fetching from DB...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, module_count 
            FROM courses 
            WHERE id = %s
        """, (course_id,))
        course = cursor.fetchone()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # 3. Save the result to Redis with a Time-To-Live (TTL) of 1 hour (3600 seconds)
        # Next time this course is requested, it will hit the cache instead
        try:
            redis_client.setex(cache_key, 3600, json.dumps(course))
        except Exception:
            # Redis may be down; we still return DB result
            pass
        
        return course

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
from fastapi import FastAPI, Response
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
import io

app = FastAPI()

@app.get("/api/certificates/{course_id}")
async def generate_certificate(course_id: str, username: str):
    """
    Generates a PDF certificate for Academy course completion.
    """
    # Create an in-memory buffer for the PDF
    buffer = io.BytesIO()
    
    # Setup canvas in landscape mode for a traditional certificate look
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # Draw Certificate Content
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width / 2.0, height - 100, "Certificate of Completion")
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2.0, height - 180, "This certifies that")
    
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 230, username)
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2.0, height - 280, f"has successfully completed the cyber range scenario:")
    
    c.setFont("Helvetica-Oblique", 20)
    c.drawCentredString(width / 2.0, height - 330, course_id.replace("-", " ").title())
    
    # Finalize PDF
    c.showPage()
    c.save()
    
    # Return the PDF as a downloadable response
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(content=pdf_bytes, media_type="application/pdf")


@app.post("/api/score")
async def proxy_score(payload: dict):
    """Simple pass-through to the internal AI scoring engine."""
    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "http://ai-scoring-engine:5000/score/fuse",
            json=payload,
            headers={"Content-Type": "application/json"},
        )
    return Response(content=resp.content, status_code=resp.status_code, media_type="application/json")
