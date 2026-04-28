import joblib
import os
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'risk_model.joblib')
model = None

def load_model():
    global model
    if model is None and os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)

def calculate_risk_score(data: dict) -> float:
    load_model()
    if model:
        # Prepare data for prediction
        input_data = pd.DataFrame([{
            'event_type': data.get("event_type", "unknown"),
            'hour_of_day': data.get("metadata", {}).get("hour_of_day", 12),
            'duration': data.get("metadata", {}).get("duration", 10)
        }])
        score = model.predict(input_data)[0]
        return float(score)
    else:
        # Fallback if model not trained
        event_type = data.get("event_type", "")
        if event_type == "data_exfiltration":
            return 99.0
        return 15.0
