import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

# Ensure model directory exists
model_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(model_dir, exist_ok=True)

print("Generating synthetic data...")
# Synthetic data generation
np.random.seed(42)
n_samples = 500

event_types = ['login', 'cmd_exec', 'file_read', 'malicious_command', 'data_exfiltration', 'scan', 'unknown']
events = np.random.choice(event_types, n_samples)
hours = np.random.randint(0, 24, n_samples)
durations = np.random.exponential(10, n_samples) + 1

# Generate synthetic scores based on rules
behavior_scores = []
risk_scores = []

for evt, hr, dur in zip(events, hours, durations):
    b_score = 10.0
    r_score = 5.0
    
    if evt == 'malicious_command':
        b_score += 70.0
        r_score += 60.0
    elif evt == 'data_exfiltration':
        b_score += 80.0
        r_score += 90.0
    elif evt == 'scan':
        b_score += 40.0
        r_score += 30.0
        
    # Uncanny hours penalty
    if hr < 6 or hr > 22:
        b_score += 15.0
        r_score += 20.0
        
    # Duration penalties
    if dur > 50:
        b_score += 10.0
        
    # Add some noise
    b_score += np.random.normal(0, 5)
    r_score += np.random.normal(0, 5)
    
    behavior_scores.append(np.clip(b_score, 0, 100))
    risk_scores.append(np.clip(r_score, 0, 100))

df = pd.DataFrame({
    'event_type': events,
    'hour_of_day': hours,
    'duration': durations,
    'behavior_score': behavior_scores,
    'risk_score': risk_scores
})

print("Training pipelines...")
# Features and target
X = df[['event_type', 'hour_of_day', 'duration']]
y_b = df['behavior_score']
y_r = df['risk_score']

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['event_type'])
    ],
    remainder='passthrough'
)

# Behavior Model Pipeline
b_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Risk Model Pipeline
r_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

print("Fitting Behavior Model...")
b_pipeline.fit(X, y_b)
print("Fitting Risk Model...")
r_pipeline.fit(X, y_r)

# Serialize and save
b_model_path = os.path.join(model_dir, 'behavior_model.joblib')
r_model_path = os.path.join(model_dir, 'risk_model.joblib')

joblib.dump(b_pipeline, b_model_path)
joblib.dump(r_pipeline, r_model_path)

print(f"Models saved successfully to {model_dir}")
