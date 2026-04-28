import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
import os

def create_synthetic_data(n_samples=1000):
    np.random.seed(42)
    
    event_types = ['login', 'logout', 'view_file', 'download_file', 'execute_script', 'malicious_command', 'privilege_escalation', 'nmap_scan']
    
    data = []
    for _ in range(n_samples):
        event = np.random.choice(event_types)
        hour = np.random.randint(0, 24)
        duration = np.random.randint(1, 300)
        
        # Risk formulation
        if event in ['malicious_command', 'privilege_escalation', 'nmap_scan']:
            risk_score = np.random.uniform(70.0, 99.0)
            behavior_score = np.random.uniform(70.0, 99.0)
        elif event == 'execute_script' or (hour < 6 or hour > 22):
            risk_score = np.random.uniform(30.0, 69.0)
            behavior_score = np.random.uniform(30.0, 69.0)
        else:
            risk_score = np.random.uniform(1.0, 29.0)
            behavior_score = np.random.uniform(1.0, 29.0)
            
        data.append({
            'event_type': event,
            'hour_of_day': hour,
            'duration': duration,
            'risk_score': risk_score,
            'behavior_score': behavior_score
        })
        
    return pd.DataFrame(data)

def train_and_save_models():
    print("Generating synthetic data...")
    df = create_synthetic_data(5000)
    
    X = df[['event_type', 'hour_of_day', 'duration']]
    y_risk = df['risk_score']
    y_behavior = df['behavior_score']
    
    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['event_type'])
        ],
        remainder='passthrough'
    )
    
    # Pipelines
    risk_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    behavior_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    print("Training Risk Score Model...")
    risk_pipeline.fit(X, y_risk)
    
    print("Training Behavior Score Model...")
    behavior_pipeline.fit(X, y_behavior)
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(risk_pipeline, 'models/risk_model.joblib')
    joblib.dump(behavior_pipeline, 'models/behavior_model.joblib')
    print("Models saved to 'models/' directory successfully.")

if __name__ == "__main__":
    train_and_save_models()
