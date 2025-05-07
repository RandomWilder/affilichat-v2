from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Optional
import uuid
from config.settings import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class PineconeManager:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME
        self.index = None
        self.namespace = None  # Initialize namespace attribute
    
    def create_index(self, dimension: int = None):
        """Create Pinecone index if it doesn't exist"""
        dimension = dimension or settings.EMBEDDING_DIMENSION
        
        # Updated API call for listing indexes
        if self.index_name not in self.pc.list_indexes().names():
            # Using ServerlessSpec for modern serverless architecture
            self.pc.create_index(
                name=self.index_name,
                dimension=dimension,
                metric=settings.PINECONE_METRIC,
                spec=ServerlessSpec(
                    cloud="aws",
                    region=settings.PINECONE_REGION
                )
            )
            logger.info(f"Created index: {self.index_name}")
        
        # Updated index initialization
        self.index = self.pc.Index(self.index_name)
    
    def upsert_vectors(self, vectors: List[Dict], batch_size: int = 100, namespace: str = None):
        """Upsert vectors to Pinecone in batches"""
        if not self.index:
            self.create_index()
        
        # If namespace parameter is provided, set it as instance attribute
        if namespace is not None:
            self.namespace = namespace
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            # Explicitly include namespace in upsert operation
            self.index.upsert(
                vectors=batch,
                namespace=self.namespace
            )
            logger.info(f"Upserted batch of {len(batch)} vectors to namespace: {self.namespace}")
    
    def query(self, vector: List[float], top_k: int = 5, include_metadata: bool = True) -> Dict:
        """Query Pinecone index with explicit namespace"""
        if not self.index:
            self.index = self.pc.Index(self.index_name)
        
        # Log query context and parameters
        logger.info(f"Querying namespace: {self.namespace}")
        
        # Explicitly pass namespace parameter in query
        result = self.index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=include_metadata,
            namespace=self.namespace
        )
        
        # Log query results for debugging
        match_count = len(result.matches) if hasattr(result, 'matches') else 0
        logger.info(f"Query returned {match_count} matches")
        
        return result
    
    def prepare_upsert_data(self, chunks: List, embeddings: List[List[float]], namespace: str = None) -> List[Dict]:
        """Prepare data with strict metadata validation"""
        # If namespace parameter is provided, set it as instance attribute
        if namespace is not None:
            self.namespace = namespace
        
        vectors = []
        for chunk, embedding in zip(chunks, embeddings):
            # Ensure all metadata values comply with Pinecone requirements
            sanitized_metadata = self._sanitize_metadata({
                "content": chunk.content,
                "url": chunk.metadata.get("url", "unknown"),
                "title": chunk.metadata.get("title", "untitled"),
                "token_count": chunk.token_count
            })
            
            vector = {
                "id": str(uuid.uuid4()),
                "values": embedding,
                "metadata": sanitized_metadata
            }
            vectors.append(vector)
        return vectors
    
    def _sanitize_metadata(self, metadata: Dict) -> Dict:
        """Enforce Pinecone metadata type requirements"""
        sanitized = {}
        for key, value in metadata.items():
            if value is None:
                sanitized[key] = "null_value"  # Convert null to string representation
            elif isinstance(value, str) and value == "":
                sanitized[key] = "empty_string"  # Prevent empty string issues
            elif isinstance(value, (bool, int, float)):
                sanitized[key] = value
            elif isinstance(value, list):
                # Ensure all list elements are strings
                sanitized[key] = [str(item) for item in value if item is not None]
            else:
                sanitized[key] = str(value)  # Convert to string as fallback
        return sanitized
    
    def delete_index(self):
        """Delete the index - use with caution"""
        if self.index_name in self.pc.list_indexes().names():
            self.pc.delete_index(self.index_name)
            logger.info(f"Deleted index: {self.index_name}")
            
    def list_namespaces(self):
        """Get list of all namespaces in the Pinecone index"""
        if not self.index:
            self.index = self.pc.Index(self.index_name)
        
        try:
            # Get stats to extract namespaces
            stats = self.index.describe_index_stats()
            # Extract namespaces from stats
            if hasattr(stats, 'namespaces'):
                return list(stats.namespaces.keys())
            elif 'namespaces' in stats:
                return list(stats['namespaces'].keys())
            return []
        except Exception as e:
            logger.error(f"Error listing namespaces: {str(e)}")
            return []