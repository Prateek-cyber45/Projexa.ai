from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import redis
import asyncio
import time
import asyncssh

app = FastAPI(title="Labs Backend - SOC Dashboard")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection for stream processing
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(redis_url)

class LabSession(BaseModel):
    """Lab session request model"""
    user_id: str
    lab_id: str

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/session/start")
async def start_session(session: LabSession):
    """Start a new lab session"""
    # Return mock session with honeypot connection info
    return {
        "session_id": f"session-{session.user_id}-{session.lab_id}",
        "honeypot_host": "honeypot-cowrie",
        "honeypot_port": 2222,
        "terminal_url": f"wss://labs.main.com/ws/session-{session.user_id}-{session.lab_id}",
        "message": "Lab session created"
    }


async def forward_ws_to_ssh(websocket: WebSocket, stdin, session_id: str):
    """
    Reads user input from the browser, logs it to Redis Streams, 
    and writes it to the Honeypot's SSH stdin.
    """
    try:
        while True:
            data = await websocket.receive_text()
            redis_client.xadd("labs_event_stream", {
                "session_id": session_id,
                "action": "keystroke",
                "payload": data,
                "timestamp": str(time.time())
            })
            stdin.write(data)
    except WebSocketDisconnect:
        print(f"[-] Browser disconnected for session: {session_id}")


async def forward_ssh_to_ws(websocket: WebSocket, stdout):
    """
    Reads the terminal output from the Honeypot and pushes it 
    back to the React frontend to display in xterm.js.
    """
    try:
        while True:
            data = await stdout.read(1024)
            if not data:
                break
            await websocket.send_text(data)
    except Exception as e:
        print(f"[-] SSH Read Error: {e}")


@app.websocket("/ws/{session_id}")
async def terminal_session(websocket: WebSocket, session_id: str):
    """Proxy between browser WebSocket and Cowrie SSH session."""
    await websocket.accept()
    try:
        # establish SSH connection to honeypot
        async with asyncssh.connect(
            host='honeypot-cowrie',
            port=2222,
            username='root',
            password='password',
            known_hosts=None
        ) as conn:
            process = await conn.create_process(term_type='xterm')
            # start forwarding tasks
            ws_to_ssh = asyncio.create_task(forward_ws_to_ssh(websocket, process.stdin, session_id))
            ssh_to_ws = asyncio.create_task(forward_ssh_to_ws(websocket, process.stdout))
            await asyncio.gather(ws_to_ssh, ssh_to_ws)
    except asyncssh.Error as e:
        await websocket.send_text(f"\r\n[!] Connection to Cyber Range failed: {str(e)}\r\n")
    except WebSocketDisconnect:
        print(f"Session {session_id} disconnected.")
    except Exception as e:
        await websocket.send_text(f"\r\n[!] Unexpected error: {str(e)}\r\n")
    finally:
        await websocket.close()

@app.get("/session/{session_id}/events")
async def get_session_events(session_id: str):
    """Retrieve events from Redis stream for a lab session"""
    try:
        # Read from Redis stream (stub - no actual stream yet)
        return {
            "session_id": session_id,
            "events": [],
            "message": "No events available"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/session/{session_id}/end")
async def end_session(session_id: str):
    """End a lab session"""
    return {
        "session_id": session_id,
        "status": "ended",
        "message": "Lab session ended"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)