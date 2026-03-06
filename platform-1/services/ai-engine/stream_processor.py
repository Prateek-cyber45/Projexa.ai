import redis
import requests
import time
import json

# Connect to the internal Redis instance [cite: 26, 43]
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

STREAM_KEY = 'labs_event_stream'
SCORING_API_URL = 'http://127.0.0.1:5000/score/fuse' # Internal FastAPI endpoint

def process_stream():
    """
    Consumes Redis Streams from Labs & Academy for feature extraction, 
    time-windowing, and aggregation[cite: 24, 43].
    """
    # Start reading only new messages. 
    # In production, use Redis Consumer Groups (XREADGROUP) for reliability.
    last_id = '$' 
    
    print(f"[*] Stream Processor active. Listening to {STREAM_KEY}...")
    
    # In-memory buffer to aggregate events per user session
    session_windows = {}

    while True:
        # Block for 5 seconds waiting for new events to maintain < 50ms latency target 
        events = redis_client.xread({STREAM_KEY: last_id}, count=100, block=5000)
        
        if not events:
            continue
            
        for stream, message_list in events:
            for message_id, message in message_list:
                last_id = message_id
                
                user_id = message.get('user_id')
                action = message.get('action')
                timestamp = float(message.get('timestamp', time.time()))
                
                # Initialize window for a new user session
                if user_id not in session_windows:
                    session_windows[user_id] = []
                    
                # Append the event to the user's current sequence
                session_windows[user_id].append({
                    "action": action, 
                    "timestamp": timestamp
                })
                
                # Trigger scoring when the user explicitly submits a task
                if action == 'submit':
                    print(f"[*] Submission detected for User {user_id}. Aggregating data...")
                    
                    # Construct the payload for the Fusion Engine
                    payload = {
                        "user_id": int(user_id),
                        "task_id": message.get("task_id", "default_lab_1"),
                        "task_type": "soc_sim", # Example task type
                        "user_submission": message.get("payload", ""),
                        "reference_answer": "Expected SOC playbook actions", # Normally fetched from DB
                        "required_techniques": ["isolate", "analyze"],
                        "event_sequence": session_windows[user_id]
                    }
                    
                    # Send aggregated data to the AI Scoring models 
                    try:
                        response = requests.post(SCORING_API_URL, json=payload)
                        print(f"[+] Score Output: {response.json()}")
                    except Exception as e:
                        print(f"[-] Error reaching Fusion Engine: {e}")
                        
                    # Clear the window after scoring
                    del session_windows[user_id]

if __name__ == "__main__":
    process_stream()
