from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Factura"

    # API Configuration
    OPENROUTER_API_KEY: str = "placeholder_for_tests"
    AI_MODEL_NAME: str = "qwen/qwen2.5-vl-72b-instruct"

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/invoice_db"

    # Firebase
    FIREBASE_PROJECT_ID: str = "factura-d1b25"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
    ]

    # Redis/Celery Configuration (future)
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
