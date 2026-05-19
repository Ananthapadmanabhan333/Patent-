from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "PatentIQ"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # JWT
    SECRET_KEY: str = "supersecret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://patentiq:patentiq_pass@localhost:5432/patentiq_db"
    SYNC_DATABASE_URL: str = "postgresql://patentiq:patentiq_pass@localhost:5432/patentiq_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    
    # API Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_PATENTS_API_KEY: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # File paths
    UPLOAD_DIR: str = "./data/uploads"
    REPORT_DIR: str = "./data/reports"
    FAISS_INDEX_PATH: str = "./data/faiss_index"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
