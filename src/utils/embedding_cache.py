# src/utils/embedding_cache.py
import hashlib
import json
import os
from typing import Optional, List, Dict
import aiofiles
import asyncio

class EmbeddingCache:
    def __init__(self, cache_dir: str = ".embedding_cache"):
        self.cache_dir = cache_dir
        self.ensure_cache_dir()
        self.lock = asyncio.Lock()
    
    def ensure_cache_dir(self):
        """Ensure cache directory exists"""
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def get_cache_key(self, text: str, model: str) -> str:
        """Generate cache key for text and model combination"""
        content = f"{text}:{model}"
        return hashlib.md5(content.encode()).hexdigest()
    
    async def get_embedding(self, text: str, model: str) -> Optional[List[float]]:
        """Retrieve embedding from cache if exists"""
        cache_key = self.get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        try:
            async with aiofiles.open(cache_file, 'r') as f:
                data = await f.read()
                cache_data = json.loads(data)
                return cache_data.get('embedding')
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    async def set_embedding(self, text: str, model: str, embedding: List[float]):
        """Store embedding in cache"""
        cache_key = self.get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        async with self.lock:
            cache_data = {
                'text': text,
                'model': model,
                'embedding': embedding
            }
            
            async with aiofiles.open(cache_file, 'w') as f:
                await f.write(json.dumps(cache_data))