import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Set, Dict, List, Optional
from dataclasses import dataclass
import logging
from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

@dataclass
class ScrapedContent:
    url: str
    title: str
    content: str
    metadata: Dict[str, str]

class WebCrawler:
    def __init__(self, 
                 start_url: str, 
                 max_depth: int = None,
                 max_pages: int = None):
        self.start_url = start_url
        self.max_depth = max_depth or settings.MAX_DEPTH
        self.max_pages = max_pages or settings.MAX_PAGES
        self.visited_urls: Set[str] = set()
        self.domain = urlparse(start_url).netloc
        
    async def crawl(self) -> List[ScrapedContent]:
        """
        Asynchronously crawl website with depth control
        """
        contents = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        async with aiohttp.ClientSession(headers=headers) as session:
            await self._crawl_page(session, self.start_url, 0, contents)
        return contents
    
    async def _crawl_page(self, 
                         session: aiohttp.ClientSession,
                         url: str, 
                         depth: int,
                         contents: List[ScrapedContent]):
        if depth > self.max_depth or len(self.visited_urls) >= self.max_pages:
            return
            
        if url in self.visited_urls:
            return
            
        self.visited_urls.add(url)
        
        try:
            async with session.get(url, timeout=settings.REQUEST_TIMEOUT) as response:
                if response.status != 200:
                    logger.warning(f"Non-200 status code ({response.status}) for {url}")
                    return
                    
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract content - fixed method signature
                content = self._extract_content(soup, url, depth)
                if content:
                    contents.append(content)
                
                # Find and crawl links
                if depth < self.max_depth:
                    links = self._extract_links(soup, url)
                    tasks = []
                    for link in links:
                        if self._should_crawl(link):
                            tasks.append(self._crawl_page(session, link, depth + 1, contents))
                    
                    if tasks:
                        await asyncio.gather(*tasks)
                        
        except Exception as e:
            logger.error(f"Error crawling {url}: {e}")
    
    def _extract_content(self, soup: BeautifulSoup, current_url: str, depth: int = 0) -> Optional[ScrapedContent]:
        """Extract meaningful content from page with guaranteed URL attribution and depth context"""
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        if text:
            return ScrapedContent(
                url=current_url,
                title=soup.title.string if soup.title else "",
                content=text,
                metadata={
                    "headers": [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3'])],
                    "meta_description": self._get_meta_description(soup),
                    "page_depth": depth  # Now properly scoped
                }
            )
        return None
    
    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all valid links from page"""
        links = []
        for tag in soup.find_all('a', href=True):
            url = urljoin(base_url, tag['href'])
            links.append(url)
        return links
    
    def _should_crawl(self, url: str) -> bool:
        """Check if URL should be crawled"""
        parsed = urlparse(url)
        return (parsed.netloc == self.domain and 
                url not in self.visited_urls and
                not url.endswith(('.pdf', '.jpg', '.png', '.zip')))
    
    def _get_meta_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description"""
        meta = soup.find('meta', attrs={'name': 'description'})
        return meta.get('content', '') if meta else ""