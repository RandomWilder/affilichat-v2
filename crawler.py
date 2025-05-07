# crawler.py - Dedicated content acquisition application
import asyncio
import argparse
import logging
from datetime import datetime
from urllib.parse import urlparse
from src.pipeline.rag_pipeline import RAGPipeline

# Configure operational logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'crawler_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def generate_namespace(url: str) -> str:
    """Create deterministic namespace from domain"""
    domain = urlparse(url).netloc.replace('.', '_').replace('-', '_')
    return f"domain_{domain}"[:63]

async def execute_crawl(url: str, depth: int, max_pages: int, namespace: str = None):
    """Execute crawling operation with specified parameters"""
    
    if namespace is None:
        namespace = generate_namespace(url)
    
    logger.info("=== Content Acquisition Initiative ===")
    logger.info(f"Target URL: {url}")
    logger.info(f"Crawl Depth: {depth}")
    logger.info(f"Max Pages: {max_pages}")
    logger.info(f"Namespace: {namespace}")
    
    # Initialize pipeline with namespace context
    pipeline = RAGPipeline()
    pipeline.vector_store.namespace = namespace
    
    # Configure crawler settings
    pipeline.crawler_config = {
        'max_depth': depth,
        'max_pages': max_pages
    }
    
    try:
        # Execute crawling and indexing
        indexed_count = await pipeline.process_website(url, depth, namespace=namespace)
        
        logger.info(f"Success: Indexed {indexed_count} documents")
        logger.info(f"Namespace: {namespace}")
        
        return indexed_count
        
    except Exception as e:
        logger.error(f"Crawling failed: {str(e)}", exc_info=True)
        raise

def main():
    parser = argparse.ArgumentParser(description='Website Content Acquisition Tool')
    parser.add_argument('--url', required=True, help='Target website URL')
    parser.add_argument('--depth', type=int, default=3, help='Crawl depth')
    parser.add_argument('--max-pages', type=int, default=100, help='Maximum pages to crawl')
    parser.add_argument('--namespace', help='Custom namespace (optional)')
    
    args = parser.parse_args()
    
    try:
        asyncio.run(execute_crawl(
            url=args.url,
            depth=args.depth,
            max_pages=args.max_pages,
            namespace=args.namespace
        ))
    except Exception as e:
        logger.error(f"Application failed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()