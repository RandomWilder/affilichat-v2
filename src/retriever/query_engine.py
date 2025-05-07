from typing import List, Dict, Optional
from src.embedding.openai_embedder import OpenAIEmbedder
from src.vectorstore.pinecone_manager import PineconeManager
import asyncio
import logging

logger = logging.getLogger(__name__)

class QueryEngine:
    def __init__(self):
        self.embedder = OpenAIEmbedder()
        self.vector_store = PineconeManager()
    
    async def query(self, query_text: str, top_k: int = 5, namespace: str = None) -> List[Dict]:
        """
        Query the RAG system and return relevant documents
        """
        # Set namespace if provided (otherwise use current setting)
        if namespace is not None:
            self.vector_store.namespace = namespace
            
        # Log query operation
        logger.info(f"Processing query: '{query_text}'")
        logger.info(f"Using namespace: {self.vector_store.namespace}")
        
        # Embed the query
        query_embedding = await self.embedder.embed_text(query_text)
        logger.info(f"Query embedding generated with dimension: {len(query_embedding)}")
        
        # Search Pinecone with explicit namespace context
        results = self.vector_store.query(query_embedding, top_k=top_k)
        
        # Format results
        documents = []
        if hasattr(results, 'matches'):
            for match in results.matches:
                doc = {
                    "content": match.metadata.get("content", ""),
                    "url": match.metadata.get("url", ""),
                    "title": match.metadata.get("title", ""),
                    "score": match.score
                }
                documents.append(doc)
        
        logger.info(f"Retrieved {len(documents)} documents")
        return documents