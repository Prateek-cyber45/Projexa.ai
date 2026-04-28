"""
ml/engine.py
─────────────
Lightweight ML pipeline:
  1. Isolation Forest  – anomaly detection
  2. Random Forest     – threat label classification

Models are trained once via train_models.py and serialised with joblib.
At runtime we load them and call enrich_log() for every new log entry.
"""

import os
import numpy as np
import joblib
import logging
from pathlib import Path

from backend.config import settings

logger = logging.getLogger(__name__)

# ── Label map used by the classifier ─────────────────────────────────────────
THREAT_LABELS = [
    "benign",
    "brute_force",
    "sql_injection",
    "ransomware",
    "ddos",
    "lateral_movement",
    "data_exfil",
    "phishing",
    "zero_day",
]

# ── Model singletons (lazy-loaded) ────────────────────────────────────────────
_anomaly_model = None
_classifier_model = None


def _load_models():
    global _anomaly_model, _classifier_model

    anomaly_path = Path(settings.ANOMALY_MODEL_PATH)
    classifier_path = Path(settings.CLASSIFIER_MODEL_PATH)

    if anomaly_path.exists():
        _anomaly_model = joblib.load(anomaly_path)
        logger.info("Anomaly model loaded from %s", anomaly_path)
    else:
        logger.warning("Anomaly model not found at %s – using heuristic fallback", anomaly_path)

    if classifier_path.exists():
        _classifier_model = joblib.load(classifier_path)
        logger.info("Threat classifier loaded from %s", classifier_path)
    else:
        logger.warning("Classifier model not found at %s – using rule-based fallback", classifier_path)


# Load on import
_load_models()


def _extract_features(log_data: dict) -> np.ndarray:
    """
    Convert a raw log dict into a fixed-length numeric feature vector.
    Features (in order):
      0: dest_port / 1000  (normalised)
      1: source_port / 65535
      2: protocol_encoded  (TCP=0, UDP=1, ICMP=2, SMTP=3, N/A=4)
      3: payload_length / 1000
      4: severity_encoded  (low=0, medium=1, high=2, critical=3)
    """
    proto_map = {"TCP": 0, "UDP": 1, "ICMP": 2, "SMTP": 3}
    sev_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    severity = log_data.get("severity")
    severity_str = severity.value if hasattr(severity, "value") else str(severity or "low")

    features = np.array([
        float(log_data.get("dest_port", 0)) / 1000,
        float(log_data.get("source_port", 0)) / 65535,
        float(proto_map.get(log_data.get("protocol", "TCP"), 4)),
        len(log_data.get("raw_payload", "")) / 1000,
        float(sev_map.get(severity_str, 0)),
    ], dtype=np.float32).reshape(1, -1)

    return features


def _rule_based_label(log_data: dict) -> str:
    """Fallback when the ML model isn't available yet."""
    event = log_data.get("event_type", "").upper()
    mapping = {
        "SSH": "brute_force",
        "SQLI": "sql_injection",
        "RANSOMWARE": "ransomware",
        "EXFIL": "data_exfil",
        "FLOOD": "ddos",
        "KERBERO": "lateral_movement",
        "PHISH": "phishing",
        "ZERO_DAY": "zero_day",
        "C2_BEACON": "lateral_movement",
        "RDP": "lateral_movement",
    }
    for keyword, label in mapping.items():
        if keyword in event:
            return label
    return "benign"


def enrich_log(log_data: dict) -> dict:
    """
    Returns:
      {
        "anomaly_score": float,      # higher = more anomalous (0–1)
        "is_anomaly": bool,
        "threat_label": str,
      }
    """
    features = _extract_features(log_data)

    # ── Anomaly detection ─────────────────────────────────────────────────────
    if _anomaly_model is not None:
        # Isolation Forest returns -1 for anomalies, +1 for normal
        raw_score = _anomaly_model.decision_function(features)[0]
        # Normalise to 0-1 range (approximate)
        anomaly_score = float(np.clip(1 - (raw_score + 0.5), 0, 1))
        is_anomaly = _anomaly_model.predict(features)[0] == -1
    else:
        # Heuristic: high/critical = anomaly
        sev = str(log_data.get("severity", "low"))
        is_anomaly = sev in ("high", "critical")
        anomaly_score = 0.9 if sev == "critical" else (0.7 if sev == "high" else 0.2)

    # ── Threat classification ─────────────────────────────────────────────────
    if _classifier_model is not None:
        pred = _classifier_model.predict(features)[0]
        threat_label = THREAT_LABELS[int(pred)] if int(pred) < len(THREAT_LABELS) else "unknown"
    else:
        threat_label = _rule_based_label(log_data)

    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_anomaly": bool(is_anomaly),
        "threat_label": threat_label,
    }
