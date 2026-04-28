import psycopg2
import os
import random
from datetime import datetime, timedelta


# Database connection using individual environment variables for flexibility
POSTGRES_USER = os.getenv("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")  # may be empty for local dev
# if password not provided try reading secret file or use default
if not POSTGRES_PASSWORD:
    # check for docker secret mount
    try:
        with open("/run/secrets/db_password") as f:
            POSTGRES_PASSWORD = f.read().strip()
    except Exception:
        pass
# fallback to a known value if still empty
if not POSTGRES_PASSWORD:
    POSTGRES_PASSWORD = "password"
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "cyberplatform")

# prefer explicitly constructed URL; ignore incomplete DATABASE_URL env
env_db_url = os.getenv("DATABASE_URL")
if env_db_url and ":@" not in env_db_url.split("//",1)[-1]:
    DATABASE_URL = env_db_url
else:
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# debug info
print(f"[debug] POSTGRES_USER={POSTGRES_USER}")
print(f"[debug] POSTGRES_PASSWORD={POSTGRES_PASSWORD}")
print(f"[debug] POSTGRES_HOST={POSTGRES_HOST}")
print(f"[debug] DATABASE_URL={DATABASE_URL}")

def seed_database():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("[*] Connected to database. Seeding data...")

        # 1. Seed Users (Delta Node 5 test accounts)
        users = [
            ("alpha_student", "alpha@main.com", "hash1", "student"),
            ("bravo_student", "bravo@main.com", "hash2", "student"),
            ("soc_admin", "admin@main.com", "hash3", "admin")
        ]
        
        cursor.executemany("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (username) DO NOTHING;
        """, users)

        # Fetch the generated user IDs
        cursor.execute("SELECT id, username FROM users WHERE role = 'student';")
        student_records = cursor.fetchall()

        # 2. Seed Initial Scores & Skill Vectors
        tasks = ["soc_sim_1", "forensics_basic", "mcq_networking"]
        
        for student_id, username in student_records:
            for task in tasks:
                # Generate realistic random scores
                r_score = round(random.uniform(60.0, 95.0), 2)
                b_score = round(random.uniform(50.0, 100.0), 2)
                final_score = round((r_score * 0.6) + (b_score * 0.4), 2)
                
                cursor.execute("""
                    INSERT INTO scores (user_id, task_id, task_type, r_score, b_score, final_score)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (student_id, task, "soc_sim" if "sim" in task else "quiz", r_score, b_score, final_score))

            # Update their rolling skill profile based on the dummy scores
            cursor.execute("""
                UPDATE users 
                SET rolling_score = (SELECT AVG(final_score) FROM scores WHERE user_id = %s),
                    skill_vector_soc = %s
                WHERE id = %s
            """, (student_id, random.uniform(10.0, 40.0), student_id))
            
        conn.commit()
        print("[+] Database successfully seeded with test users and scores.")

    except Exception as e:
        print(f"[-] Error seeding database: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    seed_database()
