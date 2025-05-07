from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core configurations with type hints
    OPENAI_API_KEY: str
    PINECONE_API_KEY: str
    
    # Model configurations
    OPENAI_MODEL: str = "text-embedding-3-large"
    EMBEDDING_DIMENSION: int = 3072
    
    # Pinecone settings
    PINECONE_INDEX_NAME: str = "affilichat11"
    PINECONE_ENVIRONMENT: str = "gcp-starter"  # Kept for backward compatibility
    PINECONE_REGION: str = "us-east-1"  # Added for ServerlessSpec
    PINECONE_METRIC: str = "cosine"

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str  # Required for chat interface
    
    # Firebase Authentication Configuration
    FIREBASE_API_KEY: Optional[str] = None
    FIREBASE_AUTH_DOMAIN: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    FIREBASE_MSG_SENDER_ID: Optional[str] = None
    FIREBASE_APP_ID: Optional[str] = None
    
    # Performance tuning
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Crawler settings
    MAX_DEPTH: int = 3
    MAX_PAGES: int = 1000
    REQUEST_TIMEOUT: int = 30
    
    # Encoding settings for international content
    CONTENT_ENCODING: str = "utf-8"
    LANGUAGE_DETECTION: bool = True
    
    # Cost control
    MAX_DAILY_SPEND: float = 10.0  # USD
    COST_PER_1K_TOKENS: float = 0.0004  # text-embedding-3-large pricing
    
    @property
    def estimated_daily_token_limit(self) -> int:
        """Calculate daily token limit based on budget"""
        return int((self.MAX_DAILY_SPEND / self.COST_PER_1K_TOKENS) * 1000)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings():
    return Settings()
    