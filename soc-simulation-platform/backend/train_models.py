"""
ml/train_models.py
──────────────────
One-time training script.  Run before starting the server:

    python -m backend.ml.train_models

Generates:
  backend/ml/models/anomaly_model.pkl
  backend/ml/models/threat_classifier.pkl

Uses synthetic data that mirrors the shape produced by log_generator.py.
In production, replace this with real honeypot log data.
"""

import os
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

OUTPUT_DIR = Path("backend/ml/models")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Feature schema (must match ml/engine.py _extract_features) ───────────────
# [dest_port/1000, src_port/65535, protocol_enc, payload_len/1000, severity_enc]
NUM_FEATURES = 5
LABELS = [
    "benign", "brute_force", "sql_injection", "ransomware",
    "ddos", "lateral_movement", "data_exfil", "phishing", "zero_day",
]


def _generate_synthetic_data(n_samples: int = 5000):
    """
    Generates labelled synthetic log feature vectors.
    Each class has distinct statistical properties to give the classifier
    something meaningful to learn.
    """
    rng = np.random.default_rng(42)
    X, y = [], []

    samples_per_class = n_samples // len(LABELS)

    class_profiles = {
        # label: (dest_port_mean, dest_port_std, severity_mean)
        "benign":           (0.08, 0.04, 0.2),
        "brute_force":      (0.022, 0.01, 2.1),   # port 22 SSH
        "sql_injection":    (0.08, 0.02, 1.8),    # port 80/443
        "ransomware":       (0.445, 0.05, 2.8),   # port 445 SMB
        "ddos":             (0.053, 0.03, 2.5),   # port 53 DNS
        "lateral_movement": (0.3389, 0.02, 2.3),  # port 3389 RDP
        "data_exfil":       (0.443, 0.02, 2.0),
        "phishing":         (0.025, 0.01, 1.5),
        "zero_day":         (0.808, 0.10, 2.9),
    }

    for label, (dp_mean, dp_std, sev_mean) in class_profiles.items():
        for _ in range(samples_per_class):
            features = [
                abs(rng.normal(dp_mean, dp_std)),                       # dest_port
                rng.uniform(0, 1),                                       # src_port
                rng.integers(0, 5),                                      # protocol
                abs(rng.normal(0.3, 0.15)),                              # payload len
                np.clip(rng.normal(sev_mean, 0.5), 0, 3),               # severity
            ]
            X.append(features)
            y.append(LABELS.index(label))

    return np.array(X, dtype=np.float32), np.array(y, dtype=int)


def train_anomaly_model(X_normal: np.ndarray):
    print("Training Isolation Forest anomaly detector...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_normal)
    path = OUTPUT_DIR / "anomaly_model.pkl"
    joblib.dump(model, path)
    print(f"  ✓ Saved to {path}")
    return model


def train_classifier(X: np.ndarray, y: np.ndarray):
    print("Training Random Forest threat classifier...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    print("\nClassification Report:")
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=LABELS))

    path = OUTPUT_DIR / "threat_classifier.pkl"
    joblib.dump(model, path)
    print(f"  ✓ Saved to {path}")
    return model


if __name__ == "__main__":
    X, y = _generate_synthetic_data(n_samples=9000)

    # Train anomaly model on "benign" samples only
    X_benign = X[y == LABELS.index("benign")]
    train_anomaly_model(X_benign)

    # Train classifier on all labelled data
    train_classifier(X, y)

    print("\n✅ Model training complete.")
