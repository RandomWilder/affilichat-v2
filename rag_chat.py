# rag_chat.py - Interactive RAG conversational interface
import asyncio
import json
import logging
import aiohttp
import re
from typing import Dict, Any
from src.pipeline.rag_pipeline import RAGPipeline
from src.persona.persona_extractor import PersonaExtractor
from src.persona.persona_manager import PersonaManager
from config.settings import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGConversationEngine:
    """Conversational RAG interface with OpenRouter integration"""
    
    def __init__(self):
        self.pipeline = RAGPipeline()
        self.settings = get_settings()
        self.openrouter_key = self.settings.OPENROUTER_API_KEY
        self.model = "google/gemma-3-27b-it:free"
        self.conversation_history = []
        
        # Initialize persona components
        self.persona_manager = PersonaManager()
        self.persona_extractor = PersonaExtractor(
            self.pipeline.vector_store, 
            self.pipeline.query_engine
        )
    
    async def retrieve_context(self, query: str, namespace: str, top_k: int = 3):
        """Retrieve relevant context from specified namespace"""
        # Configure namespace for query - critical for correct retrieval
        logger.info(f"Setting namespace to: {namespace}")
        self.pipeline.vector_store.namespace = namespace
        
        # Ensure query engine uses same vector store instance
        self.pipeline.query_engine.vector_store = self.pipeline.vector_store
        
        # Verify namespace propagation
        logger.info(f"Vector store namespace: {self.pipeline.vector_store.namespace}")
        logger.info(f"Query engine namespace: {self.pipeline.query_engine.vector_store.namespace}")
        
        # Execute retrieval
        results = await self.pipeline.query_system(query, top_k)
        logger.info(f"Retrieved {len(results)} results")
        
        # Log first result for debugging if available
        if results and len(results) > 0:
            logger.info(f"First result score: {results[0]['score']}")
        
        # Format context for LLM consumption
        context_blocks = []
        for result in results:
            context_blocks.append(f"[Source: {result['url']}]\n{result['content']}")
        
        context_text = "\n\n---\n\n".join(context_blocks)
        logger.info(f"Context length: {len(context_text)}")
        return context_text
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection based on character sets and patterns"""
        # Hebrew characters fall within this Unicode range
        hebrew_pattern = re.compile(r'[\u0590-\u05FF\uFB1D-\uFB4F]')
        if hebrew_pattern.search(text):
            return "Hebrew"
        return "English"  # Default fallback
    
    def _get_service_style_instructions(self, style: str) -> str:
        """Generate service style specific instructions for response generation"""
        style_instructions = {
            "informational": """Focus on providing accurate, educational information. Maintain a balanced, 
objective tone. Prioritize facts and clarity. Use a structured approach to convey information effectively.""",
            
            "sales": """Emphasize benefits and value. Include one relevant call to action. 
Highlight services that could address the user's needs. Use persuasive but honest language.
Mention specific next steps the user could take.""",
            
            "emotional_support": """Adopt an empathetic, supportive tone. Validate the user's concerns
and questions. Use reassuring language and acknowledge emotional aspects. Offer encouragement
and focus on wellbeing.""",
            
            "creative": """Use illustrative examples or brief analogies. Make the information vivid 
and memorable. Use engaging language while maintaining accuracy. Keep examples concise and relevant."""
        }
        
        # Universal length constraint that applies to all styles
        length_constraint = """
CRITICAL - RESPONSE LENGTH: Keep your response concise and impactful. Use no more than 3-5 sentences
for most responses. Never exceed 150 words total. Prioritize clarity and directness over comprehensiveness.
Focus on answering the specific question without tangents or unnecessary elaboration.
"""
        
        return style_instructions.get(style, style_instructions["informational"]) + length_constraint
    
    async def generate_response(self, user_query: str, context: str, persona: Dict = None):
        """Generate conversational response using OpenRouter with language, persona and service style alignment"""
        url = "https://openrouter.ai/api/v1/chat/completions"
        
        # Detect query language
        query_language = self._detect_language(user_query)
        
        # Get service orientation
        service_style = persona.get("service_orientation", "informational") if persona else "informational"
        
        # Get service style specific instructions
        style_instructions = self._get_service_style_instructions(service_style)
        
        # Determine if this is the first interaction
        is_first_interaction = len(self.conversation_history) == 0
        
        # Construct system prompt with context, language instruction, and persona
        system_prompt = f"""You are a knowledgeable assistant. Use the following context to answer the user's question accurately. If the context doesn't contain relevant information, say so.

    Context:
    {context}

    IMPORTANT: The user has asked the question in {query_language}. You must respond in the SAME LANGUAGE ({query_language}).
    """

        # Add persona directive if available
        if persona and "directive" in persona:
            system_prompt += f"\nPERSONA DIRECTIVE:\n{persona['directive']}\n"
        
        # Add service style instructions
        system_prompt += f"\nSERVICE STYLE: {service_style}\n{style_instructions}\n"
        
        # Add conversation state awareness - MODIFIED TO FIX INTRODUCTION ISSUE
        if is_first_interaction:
            # First message - allow introducing once with name but keep it brief
            system_prompt += "\nThis is the first message. You may briefly introduce yourself with your name and title, but keep it to ONE short sentence before addressing the query.\n"
        else:
            # Not first message - NEVER reintroduce
            system_prompt += "\nIMPORTANT: This is an ongoing conversation. DO NOT introduce yourself again. DO NOT mention your name or title. The user already knows who you are. Just answer their question directly without any self-reference.\n"
        
        system_prompt += "\nProvide a clear, concise response based on the context provided."
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                *self.conversation_history,
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "RAG Chat Interface"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return data['choices'][0]['message']['content']
                else:
                    error_text = await response.text()
                    logger.error(f"OpenRouter API error: {error_text}")
                    return f"Error: Unable to generate response ({response.status})"
    
    async def chat_session(self, namespace: str):
        """Interactive chat session with context retrieval and service style selection"""
        print(f"\n=== RAG Chat Interface ===")
        print(f"Namespace: {namespace}")
        print(f"Model: {self.model}")
        print("\nType 'exit' to end conversation")
        print("Type 'context' to see retrieved context for last query")
        print("-" * 50)
        
        # Load or create persona for the namespace
        print("Loading persona profile...")
        persona = await self.persona_manager.get_or_create_persona(
            namespace, self.persona_extractor
        )
        print(f"Loaded persona: {persona['entity_info']['name']}")
        
        # Service style selection
        print("\nSelect conversation service style:")
        print("1. Informational - Focus on providing factual, educational responses")
        print("2. Sales - Emphasize services, benefits, and calls to action")
        print("3. Emotional Support - More empathetic, supportive, and reassuring")
        print("4. Creative - More imaginative, engaging, and illustrative")
        
        # Get user selection with validation
        while True:
            try:
                style_choice = int(input("\nEnter style (1-4): ").strip())
                if 1 <= style_choice <= 4:
                    break
                print("Please enter a number between 1 and 4.")
            except ValueError:
                print("Please enter a valid number.")
        
        # Map selection to service style
        service_styles = {
            1: "informational",
            2: "sales",
            3: "emotional_support",
            4: "creative"
        }
        
        # Update persona with selected service style
        selected_style = service_styles[style_choice]
        persona["service_orientation"] = selected_style
        
        # Persist updated persona to disk
        self.persona_manager.save_persona(namespace, persona)
        
        print(f"\nService style set to: {selected_style}")
        
        last_context = ""
        
        while True:
            try:
                user_input = input("\nYou: ").strip()
                
                if user_input.lower() == 'exit':
                    break
                
                if user_input.lower() == 'context':
                    print(f"\nLast retrieved context:\n{last_context}")
                    continue
                
                # Retrieve relevant context
                context = await self.retrieve_context(user_input, namespace)
                last_context = context
                
                # Generate response with persona and service style
                response = await self.generate_response(user_input, context, persona)
                
                # Display response
                print(f"\nAssistant: {response}")
                
                # Update conversation history
                self.conversation_history.extend([
                    {"role": "user", "content": user_input},
                    {"role": "assistant", "content": response}
                ])
                
                # Trim history if too long
                if len(self.conversation_history) > 10:
                    self.conversation_history = self.conversation_history[-10:]
                
            except Exception as e:
                logger.error(f"Chat error: {str(e)}")
                print(f"\nError: {str(e)}")

async def list_available_namespaces():
    """Utility to display available content namespaces"""
    # This would integrate with Pinecone to list existing namespaces
    # Placeholder for actual implementation
    print("\nNote: Implement namespace listing functionality")
    print("For now, enter the namespace manually (e.g., 'domain_nitzandanieli_co_il')")

async def main():
    """Application entry point"""
    print("=== RAG Chat System ===")
    print("\nOptions:")
    print("1. List available namespaces")
    print("2. Start chat with specific namespace")
    
    choice = input("\nEnter choice (1/2): ").strip()
    
    if choice == '1':
        await list_available_namespaces()
    elif choice == '2':
        namespace = input("\nEnter namespace: ").strip()
        engine = RAGConversationEngine()
        await engine.chat_session(namespace)
    else:
        print("Invalid choice")

if __name__ == "__main__":
    asyncio.run(main())