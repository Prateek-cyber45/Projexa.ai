"""
config.py — centralised settings loaded from .env
All modules import `settings` — never read os.environ directly.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────────────────────────────
    APP_NAME: str = "SOC Simulation Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://soc_user:soc_pass@localhost:5432/soc_db"
    DATABASE_SYNC_URL: str = "postgresql://soc_user:soc_pass@localhost:5432/soc_db"

    # ── Auth ───────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_MINIMUM_32_CHARS"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── ML ─────────────────────────────────────────────────────────────────────
    ANOMALY_MODEL_PATH: str = "backend/ml/models/anomaly_model.pkl"
    CLASSIFIER_MODEL_PATH: str = "backend/ml/models/threat_classifier.pkl"

    @property
    def ml_models_dir(self) -> str:
        """Directory where all ML pickle files are stored."""
        return os.path.dirname(self.ANOMALY_MODEL_PATH)

    # ── Scoring thresholds ────────────────────────────────────────────────────
    response_time_threshold: float = 30.0   # seconds – target decision speed

    # ── Honeypot ───────────────────────────────────────────────────────────────
    HONEYPOT_LOG_INTERVAL_SECONDS: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
