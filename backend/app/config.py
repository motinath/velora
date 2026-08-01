import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./velora.db"
    OPENAI_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    
    JWT_SECRET: str = "velora_super_secret_semiconductor_key_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    UPLOAD_DIR: str = "storage"
    MODEL_PROVIDER: str = "mock"  # 'mock', 'openai', 'anthropic', 'gemini', 'deepseek'
    MODEL_NAME: str = "mock-model"
    
    AUTH_ENABLED: bool = False


# Ensure storage directory exists
settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "docs"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "rtl"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "logs"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)
