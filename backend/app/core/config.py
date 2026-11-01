from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisAI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret_aegis_ai_key_change_in_production_32bytes!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BACKEND_DIR.as_posix()}/aegis_ai.db"

    # LLM Settings
    DEFAULT_LLM_PROVIDER: str = "groq"  # groq, gemini, grok, openai, anthropic, ollama, mock
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROK_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    GROK_BASE_URL: str = "https://api.x.ai/v1"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=[str(ENV_PATH), ".env"],
        extra="ignore"
    )


settings = Settings()
