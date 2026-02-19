"""
config.py
─────────
Centralised settings loaded from .env via pydantic-settings.
Import `settings` anywhere in the app – never read os.environ directly.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SOC Simulation Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://soc_user:soc_pass@localhost:5432/soc_db"
    DATABASE_SYNC_URL: str = "postgresql://soc_user:soc_pass@localhost:5432/soc_db"

    # Auth
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ML
    ANOMALY_MODEL_PATH: str = "backend/ml/models/anomaly_model.pkl"
    CLASSIFIER_MODEL_PATH: str = "backend/ml/models/threat_classifier.pkl"

    # Honeypot
    HONEYPOT_LOG_INTERVAL_SECONDS: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
