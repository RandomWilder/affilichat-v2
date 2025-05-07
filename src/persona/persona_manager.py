# src/persona/persona_manager.py
import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class PersonaManager:
    """Manages persona storage, retrieval, and lifecycle"""
    
    def __init__(self, storage_path: str = "./personas"):
        """Initialize with storage directory path"""
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        logger.info(f"Initialized PersonaManager with storage at: {storage_path}")
    
    def save_persona(self, namespace: str, persona: Dict[str, Any]) -> None:
        """Persist persona data for future sessions"""
        # Sanitize namespace for filename
        safe_namespace = namespace.replace('/', '_').replace('\\', '_')
        file_path = os.path.join(self.storage_path, f"{safe_namespace}.json")
        
        # Write with UTF-8 encoding to support Hebrew
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(persona, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved persona for {namespace} to {file_path}")
    
    def load_persona(self, namespace: str) -> Optional[Dict[str, Any]]:
        """Retrieve pre-computed persona if available"""
        # Sanitize namespace for filename
        safe_namespace = namespace.replace('/', '_').replace('\\', '_')
        file_path = os.path.join(self.storage_path, f"{safe_namespace}.json")
        
        if not os.path.exists(file_path):
            logger.info(f"No existing persona found for {namespace}")
            return None
        
        try:
            # Read with UTF-8 encoding to support Hebrew
            with open(file_path, 'r', encoding='utf-8') as f:
                persona = json.load(f)
            
            logger.info(f"Loaded persona for {namespace} from {file_path}")
            return persona
        except json.JSONDecodeError as e:
            logger.error(f"Error loading persona for {namespace}: {e}")
            return None
    
    async def get_or_create_persona(self, namespace: str, persona_extractor) -> Dict[str, Any]:
        """Load existing persona or create new one"""
        # Try to load existing persona
        persona = self.load_persona(namespace)
        
        # If not found, extract new persona
        if not persona:
            logger.info(f"Creating new persona for {namespace}")
            persona = await persona_extractor.extract_persona(namespace)
            self.save_persona(namespace, persona)
            logger.info(f"Created and saved new persona for {namespace}")
        
        return persona