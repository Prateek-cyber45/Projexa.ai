from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
import sys


# Try importing the scoring modules; fall back to stubs if unavailable
try:
    from r_score import calculate_r_score as r_score_fn
except (ImportError, ModuleNotFoundError):
    r_score_fn = None

try:
    from b_score import calculate_b_score as b_score_fn
except (ImportError, ModuleNotFoundError):
    b_score_fn = None

try:
    from db import save_score_and_update_profile
except (ImportError, ModuleNotFoundError):
    save_score_and_update_profile = None

app = FastAPI(title="CyberPlatform AI Scoring Engine")

# Redis connection remains for stream processor but not used in fusion
import redis
redis_client = redis.Redis(host='redis', port=6379, db=0)

def calculate_r_score(submission_data):
    """
    Pillar 1: Response Score (0-100) [cite: 31]
    Measures the quality of what the user submitted using BERT/spaCy[cite: 32, 33].
    """
    # Stub for NLP comparison logic [cite: 33]
    accuracy = 85.0
    return accuracy

def calculate_b_score(event_sequence):
    """
    Pillar 2: Behaviour Score (0-100) [cite: 34]
    Measures decision patterns, speed, and confidence using LSTM/Isolation Forest[cite: 35, 36].
    """
    # Stub for anomaly detection and sequence modeling [cite: 36]
    behaviour_confidence = 90.0
    return behaviour_confidence

# Data models for fused scoring
class EventItem(BaseModel):
    action: str
    timestamp: float

class TaskSubmission(BaseModel):
    user_id: int
    task_id: str
    task_type: str  # e.g., "mcq", "soc_sim"
    user_submission: str
    reference_answer: str
    required_techniques: List[str]
    event_sequence: List[EventItem]

@app.post("/score/fuse")
async def generate_final_score(payload: TaskSubmission):
    """
    Evaluates both Response and Behaviour, fuses the scores, and runs integrity checks.
    """
    # 1. Calculate Independent Scores
    if r_score_fn:
        r_result = r_score_fn(
            payload.user_submission,
            payload.reference_answer,
            payload.required_techniques,
        )
    else:
        r_result = {"r_score": calculate_r_score(payload.user_submission)}

    # Convert Pydantic event models to dicts for the B_score function
    events_dict_list = [{"action": e.action, "timestamp": e.timestamp} for e in payload.event_sequence]
    if b_score_fn:
        b_result = b_score_fn(events_dict_list)
    else:
        b_result = {"b_score": calculate_b_score(events_dict_list), "confidence": 0.5}

    # Extract the raw 0-100 values
    score_r = r_result.get("r_score", 0)
    score_b = b_result.get("b_score", 100)

    # 2. Score Fusion (Adaptive Weighting)
    if payload.task_type == "mcq":
        alpha, beta = 0.9, 0.1
    elif payload.task_type == "soc_sim":
        alpha, beta = 0.5, 0.5
    else:
        alpha, beta = 0.7, 0.3

    final_score = (alpha * score_r) + (beta * score_b)

    # 3. Integrity Check
    integrity_flag = False
    mismatch_warning = None

    if score_r > 90 and score_b < 40:
        integrity_flag = True
        mismatch_warning = "High accuracy but severe behavioural anomalies detected (possible copy-paste or script usage)."

    if b_result.get("cheating_risk") == True:
        integrity_flag = True

    # Persist the score and update user skill profile [cite: 43]
    if save_score_and_update_profile:
        save_score_and_update_profile(
            user_id=payload.user_id,
            task_id=payload.task_id,
            task_type=payload.task_type,
            r_score=score_r,
            b_score=score_b,
            final_score=final_score
        )

    return {
        "user_id": payload.user_id,
        "task_id": payload.task_id,
        "final_score": round(final_score, 2),
        "components": {
            "r_score": score_r,
            "b_score": score_b,
            "weights_used": {"alpha": alpha, "beta": beta}
        },
        "integrity": {
            "flagged": integrity_flag,
            "warning": mismatch_warning,
            "b_score_confidence": b_result.get("confidence")
        }
    }

# Stream Processor Stub (Runs alongside FastAPI)
def consume_labs_stream():
    last_id = '$' # Read new messages only
    while True:
        # Blocks until a new event is pushed by the Labs backend
        events = redis_client.xread({'labs_event_stream': last_id}, count=10, block=5000)
        for stream, message_list in events:
            for message_id, message in message_list:
                process_event_for_b_score(message) # Feature extraction & windowing 
                last_id = message_id
