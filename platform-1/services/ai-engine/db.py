import psycopg2
from psycopg2.extras import RealDictCursor
import os

# The DATABASE_URL is passed via docker-compose environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@postgres:5432/cyberplatform")

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def save_score_and_update_profile(user_id: int, task_id: str, task_type: str, r_score: float, b_score: float, final_score: float):
    """
    Persists the final score to the 'scores' log and updates the user's 
    rolling skill profile in a single atomic transaction.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Insert the individual task score into the scores table
        cursor.execute("""
            INSERT INTO scores (user_id, task_id, task_type, r_score, b_score, final_score)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, task_id, task_type, r_score, b_score, final_score))
        
        # 2. Update the rolling historical score in the user_profiles table
        # We calculate the new rolling average based on all their past scores
        cursor.execute("""
            UPDATE users 
            SET rolling_score = (
                SELECT AVG(final_score) 
                FROM scores 
                WHERE user_id = %s
            )
            WHERE id = %s
        """, (user_id, user_id))
        
        # 3. Update skill-domain vectors (e.g., SOC, Forensics, Web-Dev)
        # If this task was a SOC simulation, boost their SOC skill vector
        if task_type == "soc_sim":
            cursor.execute("""
                UPDATE users 
                SET skill_vector_soc = skill_vector_soc + %s 
                WHERE id = %s
            """, (final_score * 0.01, user_id)) # Increment vector based on performance
        
        elif task_type == "forensics":
            cursor.execute("""
                UPDATE users 
                SET skill_vector_forensics = skill_vector_forensics + %s 
                WHERE id = %s
            """, (final_score * 0.01, user_id))
        
        elif task_type == "network":
            cursor.execute("""
                UPDATE users 
                SET skill_vector_network = skill_vector_network + %s 
                WHERE id = %s
            """, (final_score * 0.01, user_id))
            
        # Commit the transaction to save all changes
        conn.commit()
        print(f"[*] Successfully updated skill profile for User {user_id}")
        
    except Exception as e:
        # If anything fails, rollback the transaction to prevent corrupted data
        conn.rollback()
        print(f"[-] Database Error: {e}")
    finally:
        cursor.close()
        conn.close()
