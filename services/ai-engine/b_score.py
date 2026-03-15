import numpy as np
from sklearn.ensemble import IsolationForest

# In a production environment, this model would be loaded from MLflow
# after being trained on historical "normal" user behaviour.
# For now, we initialize an untrained model for the structural skeleton.
anomaly_detector = IsolationForest(contamination=0.1, random_state=42)

def evaluate_b_score(event_sequence: list) -> dict:
    """
    Calculates the B_score (0-100) based on command sequences and timing.
    Detects unusual speed, pattern replay, or copy-paste bursts.
    """
    if not event_sequence or len(event_sequence) < 2:
        # Not enough data to judge behaviour; return a neutral/default score
        return {"b_score": 50.0, "confidence": "low", "cheating_risk": False}

    # 1. Feature Extraction (e.g., Keystroke dynamics, command sequence & timing)
    # We calculate the time difference between consecutive events
    time_deltas = []
    for i in range(1, len(event_sequence)):
        delta = event_sequence[i]['timestamp'] - event_sequence[i-1]['timestamp']
        time_deltas.append(delta)
    
    # 2. Anomaly Detection (Isolation Forest)
    # Reshape for scikit-learn: [[delta1], [delta2], ...]
    X_times = np.array(time_deltas).reshape(-1, 1)
    
    # Fit and predict (1 = normal, -1 = anomaly/too fast)
    # Note: In production, you only predict() using a pre-trained model
    anomaly_detector.fit(X_times)
    predictions = anomaly_detector.predict(X_times)
    
    # Calculate what percentage of actions were flagged as abnormally fast (copy-paste)
    anomalies_count = list(predictions).count(-1)
    anomaly_rate = anomalies_count / len(predictions)
    
    # 3. Calculate Final B_score
    # Base score of 100, penalized by the anomaly rate
    b_score = 100.0 - (anomaly_rate * 100.0)
    
    # Flag cheating risk if anomalies are highly concentrated
    cheating_risk = bool(anomaly_rate > 0.4) 
    
    return {
        "b_score": round(max(0, b_score), 2), # Ensure it doesn't drop below 0
        "confidence": "high" if len(event_sequence) > 10 else "medium",
        "cheating_risk": cheating_risk,
        "metrics": {
            "total_events": len(event_sequence),
            "anomaly_rate": round(anomaly_rate, 2)
        }
    }


# --- Testing the Engine ---
if __name__ == "__main__":
    # Simulated input source: Keystroke dynamics and command timing
    normal_events = [
        {"action": "type", "timestamp": 100.0},
        {"action": "type", "timestamp": 102.5}, # 2.5s gap
        {"action": "type", "timestamp": 105.1}, # 2.6s gap
        {"action": "type", "timestamp": 108.0}, # 2.9s gap
    ]
    
    copy_paste_events = [
        {"action": "type", "timestamp": 200.0},
        {"action": "paste", "timestamp": 200.1}, # 0.1s gap! Anomaly
        {"action": "submit", "timestamp": 200.2}, # 0.1s gap! Anomaly
    ]
    
    print(f"Normal User: {evaluate_b_score(normal_events)}")
    print(f"Suspicious User: {evaluate_b_score(copy_paste_events)}")