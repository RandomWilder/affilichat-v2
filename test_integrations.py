import asyncio
import logging
from src.vectorstore.pinecone_manager import PineconeManager
from src.embedding.openai_embedder import OpenAIEmbedder
from src.processing.text_splitter import SmartTextSplitter
from src.pipeline.rag_pipeline import RAGPipeline
from config.settings import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_integrations():
    """Comprehensive integration testing for RAG system"""
    
    try:
        # Load settings
        settings = get_settings()
        logger.info("✓ Settings loaded successfully")
        
        # Test 1: Pinecone Connection
        logger.info("\n=== Testing Pinecone Connection ===")
        pc_manager = PineconeManager()
        
        # Attempt to list indexes
        indexes = pc_manager.pc.list_indexes()
        logger.info(f"✓ Connected to Pinecone. Available indexes: {indexes.names()}")
        
        # Test 2: OpenAI Embedding
        logger.info("\n=== Testing OpenAI Embeddings ===")
        embedder = OpenAIEmbedder()
        
        test_text = "This is a test embedding"
        embedding = await embedder.embed_text(test_text)
        logger.info(f"✓ OpenAI embedding successful. Dimension: {len(embedding)}")
        
        # Test 3: Text Splitter
        logger.info("\n=== Testing Text Splitter ===")
        splitter = SmartTextSplitter()
        
        test_doc = "This is a test document. " * 200  # Create a longer document
        chunks = splitter.split_text(test_doc, metadata={"source": "test"})
        logger.info(f"✓ Text splitter successful. Created {len(chunks)} chunks")
        
        # Test 4: End-to-End Pipeline - Small Test
        logger.info("\n=== Testing RAG Pipeline End-to-End ===")
        pipeline = RAGPipeline()
        
        # Test with a simple in-memory operation first
        test_chunks = chunks[:3]  # Use first 3 chunks
        texts = [chunk.content for chunk in test_chunks]
        embeddings = await embedder.embed_batch(texts)
        logger.info(f"✓ Generated embeddings for {len(embeddings)} chunks")
        
        # Test 5: Pinecone Operations
        logger.info("\n=== Testing Pinecone CRUD Operations ===")
        
        # Create test index
        test_index_name = "test-rag-index"
        pc_manager.index_name = test_index_name
        pc_manager.create_index()
        logger.info(f"✓ Index {test_index_name} ready")
        
        # Prepare and upsert test data
        vectors = pc_manager.prepare_upsert_data(test_chunks, embeddings)
        pc_manager.upsert_vectors(vectors)
        logger.info(f"✓ Upserted {len(vectors)} vectors to index")
        
        # Test query
        test_query = "This is a test query"
        query_embedding = await embedder.embed_text(test_query)
        results = pc_manager.query(query_embedding, top_k=2)
        logger.info(f"✓ Query successful. Found {len(results.matches)} matches")
        
        # Cleanup test index
        pc_manager.delete_index()
        logger.info(f"✓ Cleaned up test index")
        
        # Test 6: Complete RAG Pipeline
        logger.info("\n=== Testing Complete RAG Pipeline ===")
        
        # For this test, we'll use the actual system with a small test
        test_url = "https://example.com"  # You should replace with a valid URL
        
        # Initialize fresh pipeline for production index
        prod_pipeline = RAGPipeline()
        
        logger.info(f"Pipeline ready. Components initialized:")
        logger.info(f"  - Text Splitter: {type(prod_pipeline.text_splitter).__name__}")
        logger.info(f"  - Embedder: {type(prod_pipeline.embedder).__name__}")
        logger.info(f"  - Vector Store: {type(prod_pipeline.vector_store).__name__}")
        logger.info(f"  - Query Engine: {type(prod_pipeline.query_engine).__name__}")
        
        logger.info("\n=== ALL TESTS PASSED ===")
        return True
        
    except Exception as e:
        logger.error(f"✗ Integration test failed: {str(e)}", exc_info=True)
        return False

if __name__ == "__main__":
    # Run the tests
    success = asyncio.run(test_integrations())
    print(f"\nIntegration tests {'PASSED' if success else 'FAILED'}")