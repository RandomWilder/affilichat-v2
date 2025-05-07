import asyncio
from typing import List
from src.scraper.web_crawler import WebCrawler, ScrapedContent
from src.processing.text_splitter import SmartTextSplitter
from src.embedding.openai_embedder import OpenAIEmbedder
from src.vectorstore.pinecone_manager import PineconeManager
from src.retriever.query_engine import QueryEngine
import logging

logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self):
        self.text_splitter = SmartTextSplitter()
        self.embedder = OpenAIEmbedder()
        self.vector_store = PineconeManager()
        self.query_engine = QueryEngine()
    
    async def process_website(self, url: str, max_depth: int = 3, namespace: str = None):
        """Enhanced processing with content validation"""
        logger.info(f"Starting to process website: {url}")
        
        # Crawl website
        crawler = WebCrawler(url, max_depth=max_depth)
        scraped_contents = await crawler.crawl()
        
        logger.info(f"Scraped {len(scraped_contents)} pages")
        
        # Validate and filter content
        valid_contents = []
        for content in scraped_contents:
            if self._validate_content(content):
                valid_contents.append(content)
            else:
                logger.warning(f"Skipping invalid content from {content.url}")
        
        # Process only validated content
        all_chunks = []
        for content in valid_contents:
            chunks = self.text_splitter.split_text(
                content.content,
                metadata={
                    "url": content.url,
                    "title": content.title,
                    "namespace": namespace,
                    **content.metadata
                }
            )
            all_chunks.extend(chunks)
        
        logger.info(f"Created {len(all_chunks)} chunks")
        
        # Generate embeddings
        texts = [chunk.content for chunk in all_chunks]
        embeddings = await self.embedder.embed_batch(texts)
        
        # Prepare for Pinecone with namespace
        vectors = self.vector_store.prepare_upsert_data(all_chunks, embeddings, namespace=namespace)
        
        # Upsert to Pinecone with namespace
        self.vector_store.upsert_vectors(vectors, namespace=namespace)
        
        logger.info("Successfully indexed website content")
        
        return len(vectors)
    
    async def query_system(self, query: str, top_k: int = 5, namespace: str = None):
        """
        Query the RAG system, optionally filtering by namespace
        """
        results = await self.query_engine.query(query, top_k=top_k, namespace=namespace)
        return results
    
    def _validate_content(self, content: ScrapedContent) -> bool:
        """Validate content before processing"""
        if not content.url or content.url == "":
            return False
        if not content.content:
            return False
        # Add additional validation rules as needed
        return True