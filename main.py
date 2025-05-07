import asyncio
from src.pipeline.rag_pipeline import RAGPipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    # Initialize pipeline
    pipeline = RAGPipeline()
    
    # Process a website
    url = "https://example.com"
    indexed_count = await pipeline.process_website(url, max_depth=2)
    logger.info(f"Indexed {indexed_count} documents")
    
    # Query the system
    query = "What is artificial intelligence?"
    results = await pipeline.query_system(query)
    
    print("\nQuery Results:")
    for i, result in enumerate(results):
        print(f"\n{i+1}. [{result['score']:.4f}] {result['title']}")
        print(f"   URL: {result['url']}")
        print(f"   Content: {result['content'][:150]}...")

if __name__ == "__main__":
    asyncio.run(main())