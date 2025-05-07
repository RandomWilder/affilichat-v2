# src/persona/persona_extractor.py
import asyncio
import logging
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class PersonaElement:
    """Core dataclass for persona elements"""
    confidence: float
    value: Any
    source_fragments: List[str]

class PersonaExtractor:
    """Extracts structured persona information from website content"""
    
    def __init__(self, vector_store, query_engine):
        """Initialize with vector store and query engine for content retrieval"""
        self.vector_store = vector_store
        self.query_engine = query_engine
        
    async def extract_persona(self, namespace: str) -> Dict[str, Any]:
        """Extract full persona profile from indexed content"""
        self.vector_store.namespace = namespace
        self.query_engine.vector_store = self.vector_store
        
        logger.info(f"Extracting persona from namespace: {namespace}")
        
        # Strategic queries focused on persona-relevant content
        persona_queries = [
            "אודות",              # About
            "מי אני",             # Who am I
            "ניצן דניאלי",        # Name of site owner
            "תזונאית קלינית",     # Clinical dietitian
            "שירותים",            # Services
            "פילוסופיה טיפולית",  # Treatment philosophy
            "צור קשר"             # Contact info
        ]
        
        # Collect content matching persona queries
        persona_content = await self._collect_persona_content(persona_queries)
        logger.info(f"Collected {len(persona_content)} persona-related content fragments")
        
        # Extract core identity elements
        entity_info = await self._extract_entity_information(persona_content)
        
        # Extract writing style and tone elements
        writing_style = self._analyze_writing_style(persona_content)
        
        # Extract expertise signals
        expertise_markers = self._extract_expertise_signals(persona_content)
        
        # Build comprehensive persona
        persona = {
            "entity_info": entity_info,
            "writing_style": writing_style,
            "expertise_markers": expertise_markers,
            "service_orientation": "informational"  # Default service orientation
        }
        
        # Generate directive for prompt engineering
        persona["directive"] = self._create_persona_directive(persona)
        
        logger.info(f"Successfully extracted persona: {persona['entity_info'].get('name', 'Unknown')}")
        return persona
    
    async def _collect_persona_content(self, queries: List[str]) -> List[str]:
        """Retrieve and collect content fragments relevant to persona"""
        all_content = []
        
        for query in queries:
            results = await self.query_engine.query(query, top_k=3)
            for result in results:
                if "content" in result and result["content"]:
                    all_content.append(result["content"])
        
        return all_content
    
    async def _extract_entity_information(self, content_fragments: List[str]) -> Dict[str, Any]:
        """Extract core identity information from content"""
        # Extract name using regex patterns
        name_pattern = re.compile(r'ניצן דניאלי|ניצן', re.UNICODE)
        name_matches = []
        
        for fragment in content_fragments:
            matches = name_pattern.findall(fragment)
            if matches:
                name_matches.extend(matches)
        
        # Extract occupation using regex patterns
        occupation_pattern = re.compile(r'תזונאית קלינית|דיאטנית|תזונאית', re.UNICODE)
        occupation_matches = []
        
        for fragment in content_fragments:
            matches = occupation_pattern.findall(fragment)
            if matches:
                occupation_matches.extend(matches)
        
        # Determine the most common occurrences
        name = "ניצן דניאלי" if name_matches else "מומחה תזונה"
        occupation = "תזונאית קלינית" if occupation_matches else "מומחה תזונה"
        
        # Build structured entity information
        return {
            "name": name,
            "occupation": occupation,
            "specialty": "תזונה קלינית",
            "professional_identity": "תזונאית"
        }
    
    def _analyze_writing_style(self, content_fragments: List[str]) -> Dict[str, Any]:
        """Analyze writing style characteristics"""
        # Placeholder for more sophisticated analysis
        total_length = sum(len(fragment) for fragment in content_fragments)
        avg_fragment_length = total_length / len(content_fragments) if content_fragments else 0
        
        # Default writing style profile with Hebrew characteristics
        return {
            "formality": "professional_approachable",
            "sentence_length": "medium",
            "technical_density": "moderate",
            "uses_questions": self._uses_questions(content_fragments),
            "first_person": self._uses_first_person(content_fragments)
        }
    
    def _extract_expertise_signals(self, content_fragments: List[str]) -> Dict[str, Any]:
        """Extract expertise markers and domain terminology"""
        # Extract technical terms
        nutrition_terms = [
            "תזונה", "דיאטה", "קלוריות", "חלבון", "פחמימות", 
            "שומנים", "ויטמינים", "מינרלים", "סיבים תזונתיים"
        ]
        
        found_terms = []
        for term in nutrition_terms:
            for fragment in content_fragments:
                if term in fragment:
                    found_terms.append(term)
                    break
        
        return {
            "domain": "תזונה קלינית",
            "terminology": list(set(found_terms)),
            "credentials": ["תזונאית קלינית"]
        }
    
    def _uses_questions(self, content_fragments: List[str]) -> bool:
        """Determine if the content uses questions as a rhetorical style"""
        for fragment in content_fragments:
            if "?" in fragment:
                return True
        return False
    
    def _uses_first_person(self, content_fragments: List[str]) -> bool:
        """Determine if content uses first person perspective"""
        first_person_patterns = [
            r'\bאני\b', r'\bשלי\b', r'\bלי\b', r'\bאנו\b', r'\bאנחנו\b'
        ]
        
        for pattern in first_person_patterns:
            regex = re.compile(pattern, re.UNICODE)
            for fragment in content_fragments:
                if regex.search(fragment):
                    return True
        return False
    
    def _create_persona_directive(self, persona: Dict[str, Any]) -> str:
        """Generate comprehensive persona directive for prompt engineering"""
        entity_info = persona.get("entity_info", {})
        writing_style = persona.get("writing_style", {})
        expertise = persona.get("expertise_markers", {})
        
        # Construct detailed directive with Hebrew-specific elements
        directive = f"""
כשאתה עונה, התנהג כאילו אתה {entity_info.get('name', 'מומחה תזונה')}, {entity_info.get('occupation', 'תזונאי')}. 
השתמש בטון {writing_style.get('formality', 'מקצועי וידידותי')}. 
דבר בסמכותיות על {expertise.get('domain', 'תזונה')}.
"""
        
        # Add writing style guidance
        if writing_style.get("uses_questions", False):
            directive += "\nמדי פעם, שלב שאלות רטוריות כדי לעורר מחשבה."
        
        if writing_style.get("first_person", False):
            directive += "\nדבר בגוף ראשון (אני) כאשר זה מתאים."
        
        # Add domain expertise markers
        if expertise.get("terminology", []):
            terms = ", ".join(expertise.get("terminology", []))
            directive += f"\nהשתמש במונחים מקצועיים כמו {terms} כאשר זה רלוונטי."
        
        return directive.strip()