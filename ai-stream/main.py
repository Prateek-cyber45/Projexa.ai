import os
import json
import time
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from logger import setup_logger
import httpx
import redis.asyncio as redis

app = FastAPI(title="AI Stream API")
logger = setup_logger('ai-stream', 'logs/ai_stream.log')

# Configuration via environment
AI_ENGINE_URL = os.environ.get("AI_ENGINE_URL", "http://ai-engine:8003")
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/3")

# Telemetry buffer config
MAX_BUFFER_SIZE = 1000
BUFFER_TTL = 86400  # 24 hours

redis_client = None

@app.on_event("startup")
async def startup():
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("Connected to Redis for telemetry storage")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        redis_client = None

@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()

class TelemetryEvent(BaseModel):
    source: str
    payload: dict
    timestamp: float

async def store_telemetry(event: dict):
    """Store raw telemetry event in Redis list for replay capability."""
    if not redis_client:
        return
    try:
        event_json = json.dumps(event)
        await redis_client.lpush("telemetry:raw", event_json)
        await redis_client.ltrim("telemetry:raw", 0, MAX_BUFFER_SIZE - 1)
        
        # Publish to real-time channel
        await redis_client.publish("channel:telemetry", event_json)
    except Exception as e:
        logger.error(f"Failed to store telemetry: {e}")

async def process_stream_event(event: dict):
    logger.info(f"Stream processing event from source: {event.get('source', 'unknown')}")
    
    # Store in Redis buffer
    await store_telemetry(event)
    
    payload = event.get("payload", {})
    user_id = payload.get("user_id", 0)
    event_type = payload.get("event_type", "unknown")
    
    score_data = {
        "user_id": user_id,
        "event_type": event_type,
        "metadata": payload.get("metadata", {})
    }
    
    # Forward to AI Engine for ML scoring
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1. Ask AI Engine to score the Risk
            risk_resp = await client.post(f"{AI_ENGINE_URL}/score/risk", json=score_data)
            if risk_resp.status_code == 200:
                risk_result = risk_resp.json()
                logger.info(f"Risk Score Received: {risk_result}")
                
                # Store scored result
                if redis_client:
                    await redis_client.lpush("telemetry:scored", json.dumps({
                        "type": "risk",
                        "user_id": user_id,
                        "result": risk_result,
                        "timestamp": time.time()
                    }))
                    await redis_client.ltrim("telemetry:scored", 0, MAX_BUFFER_SIZE - 1)
                
            # 2. Ask AI Engine to score the Behavior
            behav_resp = await client.post(f"{AI_ENGINE_URL}/score/behavior", json=score_data)
            if behav_resp.status_code == 200:
                behav_result = behav_resp.json()
                logger.info(f"Behavior Score Received: {behav_result}")
                
                if redis_client:
                    await redis_client.lpush("telemetry:scored", json.dumps({
                        "type": "behavior",
                        "user_id": user_id,
                        "result": behav_result,
                        "timestamp": time.time()
                    }))
                    await redis_client.ltrim("telemetry:scored", 0, MAX_BUFFER_SIZE - 1)
                
        except httpx.RequestError as exc:
            logger.error(f"Failed to connect to AI Engine: {exc}")

@app.get("/health")
async def health_check():
    redis_ok = False
    buffer_size = 0
    if redis_client:
        try:
            await redis_client.ping()
            redis_ok = True
            buffer_size = await redis_client.llen("telemetry:raw")
        except Exception:
            pass
    return {
        "status": "healthy",
        "service": "ai-stream",
        "redis": redis_ok,
        "buffer_size": buffer_size
    }

@app.post("/ingest")
async def ingest_telemetry(event: TelemetryEvent, background_tasks: BackgroundTasks):
    logger.info(f"Ingested telemetry from {event.source}")
    background_tasks.add_task(process_stream_event, event.dict())
    return {"status": "received", "event_source": event.source}

@app.get("/replay")
async def replay_events(count: int = 50):
    """Replay the last N raw telemetry events from the buffer."""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    
    try:
        raw = await redis_client.lrange("telemetry:raw", 0, min(count, MAX_BUFFER_SIZE) - 1)
        events = [json.loads(r) for r in raw]
        return {"count": len(events), "events": events}
    except Exception as e:
        logger.error(f"Replay failed: {e}")
        raise HTTPException(status_code=500, detail="Replay error")

@app.get("/scored")
async def get_scored_events(count: int = 50):
    """Retrieve recently scored telemetry events."""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    
    try:
        raw = await redis_client.lrange("telemetry:scored", 0, min(count, MAX_BUFFER_SIZE) - 1)
        events = [json.loads(r) for r in raw]
        return {"count": len(events), "events": events}
    except Exception as e:
        logger.error(f"Scored retrieval failed: {e}")
        raise HTTPException(status_code=500, detail="Retrieval error")
