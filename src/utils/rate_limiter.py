# src/utils/rate_limiter.py
import asyncio
import time
from dataclasses import dataclass
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

@dataclass
class RateLimitConfig:
    requests_per_minute: int = 50  # Conservative estimate
    tokens_per_minute: int = 90000
    concurrent_requests: int = 5

class RateLimiter:
    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.request_timestamps: list = []
        self.token_count: Dict[str, int] = {"tokens": 0, "window_start": time.time()}
        self.semaphore = asyncio.Semaphore(config.concurrent_requests)
        
    async def acquire(self, estimated_tokens: int = 1000):
        """Implement token bucket algorithm for rate limiting"""
        async with self.semaphore:
            current_time = time.time()
            
            # Clean old request timestamps
            self._clean_old_timestamps(current_time)
            
            # Check request rate
            if len(self.request_timestamps) >= self.config.requests_per_minute:
                sleep_time = 60 - (current_time - self.request_timestamps[0])
                if sleep_time > 0:
                    logger.info(f"Rate limit approaching. Sleeping for {sleep_time:.2f} seconds")
                    await asyncio.sleep(sleep_time)
            
            # Check token rate
            if self._check_token_limit(current_time, estimated_tokens):
                self.token_count["tokens"] += estimated_tokens
                self.request_timestamps.append(current_time)
            else:
                # Token limit reached, wait
                sleep_time = 60 - (current_time - self.token_count["window_start"])
                logger.info(f"Token limit approaching. Sleeping for {sleep_time:.2f} seconds")
                await asyncio.sleep(max(0, sleep_time))
                self.token_count = {"tokens": estimated_tokens, "window_start": time.time()}
    
    def _clean_old_timestamps(self, current_time: float):
        """Remove timestamps older than 1 minute"""
        cutoff = current_time - 60
        self.request_timestamps = [ts for ts in self.request_timestamps if ts > cutoff]
    
    def _check_token_limit(self, current_time: float, tokens: int) -> bool:
        """Check if adding tokens would exceed limit"""
        if current_time - self.token_count["window_start"] > 60:
            self.token_count = {"tokens": 0, "window_start": current_time}
        
        return self.token_count["tokens"] + tokens <= self.config.tokens_per_minute