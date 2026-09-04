from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Factura"
    
    # API Configuration
    OPENROUTER_API_KEY: str = "placeholder_for_tests"
    AI_MODEL_NAME: str = "qwen/qwen2.5-vl-72b-instruct"
    
    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/invoice_db"
    
    # Redis/Celery Configuration (future)
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
