# src/embedding/openai_embedder.py
from openai import AsyncOpenAI
from typing import List
import numpy as np
from config.settings import get_settings
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from src.utils.rate_limiter import RateLimiter, RateLimitConfig

settings = get_settings()

class OpenAIEmbedder:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION
        
        # Initialize rate limiter
        self.rate_limiter = RateLimiter(RateLimitConfig(
            requests_per_minute=50,  # Conservative limit
            tokens_per_minute=90000,
            concurrent_requests=3
        ))
    
    @retry(
        wait=wait_exponential(multiplier=2, min=4, max=60),
        stop=stop_after_attempt(5),
        retry_error_cls=Exception
    )
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text with rate limiting"""
        # Estimate tokens (rough approximation)
        estimated_tokens = len(text.split()) * 1.3
        
        await self.rate_limiter.acquire(int(estimated_tokens))
        
        try:
            response = await self.client.embeddings.create(
                input=text,
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            if "429" in str(e):
                # Exponential backoff for rate limits
                raise
            raise
    
    async def embed_batch(self, texts: List[str], batch_size: int = 20) -> List[List[float]]:
        """Optimized batch processing with rate control"""
        embeddings = []
        
        # Process in smaller batches to respect rate limits
        for i in range(0, len(texts), min(batch_size, 5)):
            batch = texts[i:i + min(batch_size, 5)]
            
            # Estimate total tokens for batch
            total_tokens = sum(len(text.split()) * 1.3 for text in batch)
            
            await self.rate_limiter.acquire(int(total_tokens))
            
            try:
                response = await self.client.embeddings.create(
                    input=batch,
                    model=self.model
                )
                batch_embeddings = [item.embedding for item in response.data]
                embeddings.extend(batch_embeddings)
            except Exception as e:
                if "429" in str(e):
                    # Fallback to individual processing
                    for text in batch:
                        emb = await self.embed_text(text)
                        embeddings.append(emb)
                else:
                    raise
        
        return embeddings