from typing import List, Dict
from dataclasses import dataclass
import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config.settings import get_settings

settings = get_settings()

@dataclass
class TextChunk:
    content: str
    metadata: Dict[str, any]
    token_count: int

class SmartTextSplitter:
    def __init__(self):
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=self._count_tokens,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def split_text(self, text: str, metadata: Dict[str, any] = None) -> List[TextChunk]:
        """
        Split text into semantically meaningful chunks
        """
        chunks = self.splitter.split_text(text)
        result = []
        
        for chunk in chunks:
            token_count = self._count_tokens(chunk)
            chunk_metadata = metadata.copy() if metadata else {}
            chunk_metadata.update({
                "chunk_length": len(chunk),
                "token_count": token_count
            })
            
            result.append(TextChunk(
                content=chunk,
                metadata=chunk_metadata,
                token_count=token_count
            ))
        
        return result
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.tokenizer.encode(text))