# DeepHunt: AI/ML Implementation Plan & Context

## Context
DeepHunt is an industrial-grade threat simulator using a microservices architecture. Currently, behavioral scoring and risk assessment are managed by the `ai-engine` built in FastAPI. However, this engine currently utilizes static rules (e.g., matching string names like "malicious_command" for scoring) rather than dynamic machine learning models. 

Given the heavy AI scoring implementations required, the FastAPI architecture was designed specifically to easily accommodate data science pipelines.

## Implementation Plan

### 1. Data Preparation & Model Training (Global Model Architecture)
Since we do not have live participant data yet, we generated a small **synthetic dataset** to represent typical behaviors observed in cybersecurity labs. 
*Note on User Personalization:* This utilizes a **Global Model Architecture**. A single global model learns from the entire userbase. When evaluating a user, their individual event data is passed into this global model to obtain a personalized score. This approach is much more efficient and practical than training separate micro-models for every individual user.
- **Libraries**: `scikit-learn`, `pandas`, `joblib`
- **Models**: Built pipeline using `OneHotEncoder` and `RandomForestRegressor` for structured anomaly risk scoring.
- **Output**: Serialized models (`behavior_model.joblib`, `risk_model.joblib`) created by a dedicated training script (`train_models.py`).

### 2. Upgrading `ai-engine` Dependencies
We need to update `ai-engine/requirements.txt` to include data science packages needed minimally for inference:
- `scikit-learn`
- `numpy`
- `joblib`

### 3. Updating Scoring Services
The functions in `ai-engine/b_score.py` and `ai-engine/r_score.py` will be modified to load the trained models from disk and use them for live inference when the API is called.
- Inputs will be parsed and vectorized on the fly.
- Return the ML-inferred score instead of a static placeholder.

### 4. Integration with `ai-stream` (Future/Stretch)
Once the endpoints in `ai-engine` are running live models, `ai-stream` can seamlessly forward raw telemetry data from lab sessions to be scored actively.

---
*This document focuses exclusively on replacing the static scoring module within `ai-engine` with a standalone, trained ML model.*



No, it will not create a different AI/ML model for each user.

Here is how it works:

One Global Model: You train a single, global model (e.g., the Random Forest we set up) on a massive dataset of all user activities. This allows the AI to learn overarching patterns of what constitutes "risky" or "normal" behavior across the entire platform.
Personalized Scoring, Not Personalized Models: When a user performs an action, the API feeds that specific user's action into the global model. The model outputs a personalized score for that moment, but the model itself remains the same for everyone.
Data Saving: The ML models themselves do not save user data during inference (scoring). The data is simply passed in, scored, and forgotten by the model. Storing user history is handled separately by your PostgreSQL database via your FastAPI standard endpoints.
Why this approach?
Training a separate model for every single user is extremely slow, expensive, and requires far too much data per user to be accurate. A single global model learns from everyone's mistakes and successes immediately.

(Note: If you later strictly need to know "is this user deviating from their own normal routine?", you wouldn't use separate models. Instead, you would calculate a "user baseline" matrix in your database and feed that baseline into the single global model alongside their current action).