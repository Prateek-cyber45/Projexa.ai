import os
from logger import setup_logger
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis.asyncio as redis
import json
import b_score
import r_score

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/3")

logger = setup_logger('ai-engine', 'logs/ai_engine.log')
app = FastAPI(title="AI Engine API")

redis_client = None

@app.on_event("startup")
async def startup():
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("Connected to Redis")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        redis_client = None

@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()

class EventData(BaseModel):
    user_id: int
    event_type: str
    metadata: dict

@app.get("/health")
async def health_check():
    redis_ok = False
    if redis_client:
        try:
            await redis_client.ping()
            redis_ok = True
        except Exception:
            pass
    return {"status": "healthy", "service": "ai-engine", "redis": redis_ok}

@app.post("/score/behavior")
async def analyze_behavior(data: EventData):
    logger.info(f"Scoring behavior for user {data.user_id}, event: {data.event_type}")
    score = b_score.calculate_behavior_score(data.dict())
    
    # Cache result in Redis
    if redis_client:
        try:
            cache_key = f"bscore:{data.user_id}:{data.event_type}"
            await redis_client.setex(cache_key, 3600, json.dumps({
                "user_id": data.user_id,
                "behavior_score": score,
                "event_type": data.event_type
            }))
            # Publish to telemetry channel
            await redis_client.publish("channel:scores", json.dumps({
                "type": "behavior_score",
                "user_id": data.user_id,
                "score": score,
                "event_type": data.event_type
            }))
        except Exception as e:
            logger.error(f"Redis cache/publish failed: {e}")
    
    logger.info(f"Behavior score for user {data.user_id}: {score}")
    return {"user_id": data.user_id, "behavior_score": score}

@app.post("/score/risk")
async def analyze_risk(data: EventData):
    logger.info(f"Scoring risk for user {data.user_id}, event: {data.event_type}")
    score = r_score.calculate_risk_score(data.dict())
    
    # Cache result in Redis
    if redis_client:
        try:
            cache_key = f"rscore:{data.user_id}:{data.event_type}"
            await redis_client.setex(cache_key, 3600, json.dumps({
                "user_id": data.user_id,
                "risk_score": score,
                "event_type": data.event_type
            }))
            await redis_client.publish("channel:scores", json.dumps({
                "type": "risk_score",
                "user_id": data.user_id,
                "score": score,
                "event_type": data.event_type
            }))
        except Exception as e:
            logger.error(f"Redis cache/publish failed: {e}")
    
    logger.info(f"Risk score for user {data.user_id}: {score}")
    return {"user_id": data.user_id, "risk_score": score}

@app.get("/scores/history/{user_id}")
async def get_score_history(user_id: int):
    """Retrieve cached ML scores for a user from Redis."""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    
    try:
        keys = []
        async for key in redis_client.scan_iter(f"bscore:{user_id}:*"):
            keys.append(key)
        async for key in redis_client.scan_iter(f"rscore:{user_id}:*"):
            keys.append(key)
        
        results = []
        for key in keys:
            val = await redis_client.get(key)
            if val:
                results.append(json.loads(val))
        
        return {"user_id": user_id, "cached_scores": results}
    except Exception as e:
        logger.error(f"Failed to retrieve score history: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
