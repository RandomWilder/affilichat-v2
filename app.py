from flask import Flask, render_template, request, jsonify, url_for, flash, redirect, session
import asyncio
import sys
import os
import logging
import time
from urllib.parse import urlparse
import json
import re
import aiohttp
import io
import locale
from flask_cors import CORS  # Add CORS support
from flask_login import LoginManager, current_user, login_required
from dotenv import load_dotenv
from config.settings import get_settings

# Load environment variables
load_dotenv()

# Get application settings
settings = get_settings()

# Initialize Firebase Admin SDK
import firebase_admin
from firebase_admin import auth, credentials

try:
    # Check if credentials file exists
    cred_path = 'firebase-key.json'
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized with service account credentials")
    else:
        # Alternative: Use environment variables approach
        firebase_admin.initialize_app()
        print("Firebase Admin SDK initialized with application default credentials")
except Exception as e:
    print(f"Firebase initialization error: {str(e)}")

# Import your existing RAG components
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.pipeline.rag_pipeline import RAGPipeline
from src.persona.persona_extractor import PersonaExtractor
from src.persona.persona_manager import PersonaManager
from crawler import generate_namespace, execute_crawl
from src.vectorstore.pinecone_manager import PineconeManager

# Import authentication components
from src.auth.models import User
from src.auth import auth_bp

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = os.environ.get('SECRET_KEY', 'dev_key')  # Added secret key for sessions
CORS(app)  # Enable CORS for all routes

# Initialize login manager for authentication
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Register authentication blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    try:
        from firebase_admin import auth
        user = auth.get_user(user_id)
        return User(user.uid, user.email, user.display_name)
    except:
        return None

# Configure response headers for UTF-8
@app.after_request
def add_header(response):
    if response.mimetype == 'application/json':
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

# Configure logging with UTF-8 encoding
class UTF8StreamHandler(logging.StreamHandler):
    def __init__(self, stream=None):
        super().__init__(stream)
        self.encoding = 'utf-8'
        
    def emit(self, record):
        try:
            msg = self.format(record)
            stream = self.stream
            stream.write(msg + self.terminator)
            self.flush()
        except Exception:
            self.handleError(record)

# Set up logging handlers
logging.basicConfig(level=logging.INFO, 
                   handlers=[
                       UTF8StreamHandler(),
                       logging.FileHandler('rag_chat_app.log', encoding='utf-8')
                   ],
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

# Force UTF-8 for console output (helps with Windows systems)
if os.name == 'nt':  # Windows systems
    try:
        # Try to set console to UTF-8 mode
        os.system('chcp 65001')
    except Exception as e:
        logger.warning(f"Could not set console code page to UTF-8: {e}")

# Initialize global components
pipeline = RAGPipeline()
persona_manager = PersonaManager()
persona_extractor = PersonaExtractor(pipeline.vector_store, pipeline.query_engine)

@app.route('/')
def index():
    # List namespaces from both personas folder and Pinecone
    namespaces = []
    
    # Get namespaces from personas folder
    personas_dir = './personas'
    if os.path.exists(personas_dir):
        for file in os.listdir(personas_dir):
            if file.endswith('.json'):
                namespaces.append(file.replace('.json', ''))
    
    # Get namespaces from Pinecone
    try:
        pinecone_manager = PineconeManager()
        pinecone_namespaces = pinecone_manager.list_namespaces()
        # Add Pinecone namespaces if not already in the list
        for namespace in pinecone_namespaces:
            if namespace not in namespaces:
                namespaces.append(namespace)
    except Exception as e:
        logger.error(f"Error fetching Pinecone namespaces: {str(e)}")
    
    return render_template('index.html', namespaces=namespaces)

# Protect these routes with login_required
@app.route('/api/crawl', methods=['POST'])
@login_required  # Added protection
def crawl():
    # Extract parameters from request
    url = request.form.get('url')
    depth = int(request.form.get('depth', 2))
    max_pages = int(request.form.get('max_pages', 20))
    
    # Generate namespace from URL
    namespace = generate_namespace(url)
    
    try:
        # MODIFIED: Create a pipeline instance
        pipeline = RAGPipeline()
        
        # MODIFIED: Set namespace directly on the vector_store
        pipeline.vector_store.namespace = namespace
        
        # MODIFIED: Call process_website WITH the namespace parameter
        indexed_count = asyncio.run(pipeline.process_website(url, depth, namespace=namespace))
        
        return jsonify({
            'success': True,
            'message': f'Successfully crawled and indexed {indexed_count} documents',
            'namespace': namespace
        })
    except Exception as e:
        logger.error(f"Crawl error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error during crawling: {str(e)}'
        }), 500

@app.route('/api/namespaces', methods=['GET'])
def list_namespaces():
    # List namespaces from both personas folder and Pinecone
    namespaces = []
    
    # Get namespaces from personas folder
    personas_dir = './personas'
    if os.path.exists(personas_dir):
        for file in os.listdir(personas_dir):
            if file.endswith('.json'):
                namespaces.append(file.replace('.json', ''))
    
    # Get namespaces from Pinecone
    try:
        pinecone_manager = PineconeManager()
        pinecone_namespaces = pinecone_manager.list_namespaces()
        # Add Pinecone namespaces if not already in the list
        for namespace in pinecone_namespaces:
            if namespace not in namespaces:
                namespaces.append(namespace)
    except Exception as e:
        logger.error(f"Error fetching Pinecone namespaces: {str(e)}")
    
    return jsonify({'namespaces': namespaces})

# Protect chat API with login_required
@app.route('/api/chat', methods=['POST'])
@login_required  # Added protection
def chat():
    namespace = request.form.get('namespace')
    message = request.form.get('message')
    conversation_id = request.form.get('conversation_id', '')
    service_style = request.form.get('service_style', 'informational')
    
    # Check for Hebrew characters and log accordingly
    has_hebrew = bool(re.search(r'[\u0590-\u05FF\uFB1D-\uFB4F]', message))
    logger.info(f"Chat request - Namespace: {namespace}, Message length: {len(message)}, Contains Hebrew: {has_hebrew}")
    
    if has_hebrew:
        logger.info(f"Hebrew message detected. First 10 chars (if available): {message[:10] if len(message) >= 10 else message}")
    
    # Initialize or retrieve conversation history
    try:
        if not conversation_id:
            conversation_id = f"{namespace}_{int(time.time())}"
            conversation_history = []
            logger.info(f"Created new conversation: {conversation_id}")
        else:
            # Load conversation history from the request
            history_json = request.form.get('history', '[]')
            logger.info(f"Processing existing conversation: {conversation_id}")
            try:
                if isinstance(history_json, str):
                    conversation_history = json.loads(history_json)
                else:
                    conversation_history = history_json
                logger.info(f"Loaded history with {len(conversation_history)} messages")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid history JSON: {str(e)}")
                conversation_history = []
    except Exception as e:
        logger.error(f"Error processing conversation history: {str(e)}")
        conversation_history = []
    
    try:
        # Get or create persona
        persona = asyncio.run(persona_manager.get_or_create_persona(namespace, persona_extractor))
        logger.info(f"Loaded persona for {namespace}")
        
        # Set service style if provided
        if service_style:
            previous_style = persona.get('service_orientation', 'none')
            if previous_style != service_style:
                logger.info(f"Changing service style from {previous_style} to {service_style}")
            persona['service_orientation'] = service_style
            persona_manager.save_persona(namespace, persona)
        
        # Set up conversation state tracking
        is_first_interaction = len(conversation_history) == 0
        if is_first_interaction:
            logger.info("This is the first interaction in the conversation")
        
        # Retrieve context - making sure the namespace propagation is correct
        logger.info(f"Setting namespace to: {namespace}")
        pipeline.vector_store.namespace = namespace
        
        # Ensure query engine uses same vector store instance
        pipeline.query_engine.vector_store = pipeline.vector_store
        
        # Verify namespace propagation
        logger.info(f"Vector store namespace: {pipeline.vector_store.namespace}")
        logger.info(f"Query engine namespace: {pipeline.query_engine.vector_store.namespace}")
        
        # Execute retrieval with more robust error handling for Hebrew text
        try:
            context = asyncio.run(pipeline.query_system(message, top_k=3))
            logger.info(f"Retrieved {len(context)} results")
            
            # Format context
            context_text = "\n\n---\n\n".join([
                f"[Source: {result['url']}]\n{result['content']}"
                for result in context
            ])
        except UnicodeEncodeError as ue:
            logger.error(f"Unicode encoding error during context retrieval: {str(ue)}")
            # Fallback to simple retrieval without the problematic encoding
            context_text = "Sorry, there was an encoding issue retrieving context for this query."
            context = []
        except Exception as e:
            logger.error(f"Error during context retrieval: {str(e)}", exc_info=True)
            context_text = "Error retrieving context."
            context = []
        
        # Generate response with more robust error handling for Hebrew
        try:
            response = asyncio.run(generate_response(message, context_text, persona, conversation_history, is_first_interaction))
            logger.info(f"Generated response of length: {len(response)}")
            
            # Check if response has Hebrew for debugging
            has_hebrew_response = bool(re.search(r'[\u0590-\u05FF\uFB1D-\uFB4F]', response))
            if has_hebrew_response:
                logger.info(f"Hebrew response detected. First 10 chars (if available): {response[:10] if len(response) >= 10 else response}")
        except UnicodeEncodeError as ue:
            logger.error(f"Unicode encoding error during response generation: {str(ue)}")
            if has_hebrew:
                # Special response for Hebrew encoding issues
                response = "אירעה שגיאת קידוד. אנא נסה שוב או פנה למנהל המערכת."
            else:
                response = "An encoding error occurred. Please try again or contact the system administrator."
        except Exception as e:
            logger.error(f"Error during response generation: {str(e)}", exc_info=True)
            response = "Error generating response. Please try again."
            return jsonify({
                'success': False,
                'message': f'Error during chat: {str(e)}'
            }), 500
        
        # Update conversation history
        conversation_history.append({"role": "user", "content": message})
        conversation_history.append({"role": "assistant", "content": response})
        
        # Trim history if too long (but keep more than just 10 messages)
        if len(conversation_history) > 20:
            logger.info(f"Trimming conversation history from {len(conversation_history)} to 20 messages")
            conversation_history = conversation_history[-20:]
        
        return jsonify({
            'success': True,
            'response': response,
            'conversation_id': conversation_id,
            'history': conversation_history
        })
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': f'Error during chat: {str(e)}'
        }), 500

# Add protected routes for chat and crawler UI
@app.route('/chat')
@login_required
def chat_interface():
    return render_template('chat.html')

@app.route('/crawler')
@login_required
def crawler_interface():
    return render_template('crawler.html')

@app.route('/get-firebase-config')
def get_firebase_config():
    """
    Provide Firebase configuration to the client-side JavaScript
    """
    try:
        # Get the application settings
        settings = get_settings()
        
        # Log the existence of Firebase settings (without exposing the values)
        logger.info(f"Providing Firebase configuration. API Key exists: {bool(settings.FIREBASE_API_KEY)}")
        logger.info(f"Auth Domain: {settings.FIREBASE_AUTH_DOMAIN}")
        logger.info(f"Project ID: {settings.FIREBASE_PROJECT_ID}")
        
        # Detailed environment logging for troubleshooting
        logger.info(f"Running in environment: {os.environ.get('FLASK_ENV', 'not set')}")
        logger.info(f"Domain being accessed: {request.host}")
        
        # Validate configuration
        if not settings.FIREBASE_API_KEY:
            logger.error("Firebase API key is missing")
            return jsonify({'error': 'Firebase API key is missing'}), 500
            
        if not settings.FIREBASE_AUTH_DOMAIN:
            logger.error("Firebase Auth Domain is missing")
            return jsonify({'error': 'Firebase Auth Domain is missing'}), 500
            
        if not settings.FIREBASE_PROJECT_ID:
            logger.error("Firebase Project ID is missing")
            return jsonify({'error': 'Firebase Project ID is missing'}), 500
        
        # Create configuration object
        config = {
            'apiKey': settings.FIREBASE_API_KEY,
            'authDomain': settings.FIREBASE_AUTH_DOMAIN,
            'projectId': settings.FIREBASE_PROJECT_ID,
            'storageBucket': settings.FIREBASE_STORAGE_BUCKET or "",
            'messagingSenderId': settings.FIREBASE_MSG_SENDER_ID or "",
            'appId': settings.FIREBASE_APP_ID or ""
        }
        
        # Filter out empty values for optional fields
        config = {k: v for k, v in config.items() if v}
        
        # Verify that we have the minimum required configuration
        required_fields = ['apiKey', 'authDomain', 'projectId']
        missing_fields = [field for field in required_fields if not config.get(field)]
        
        if missing_fields:
            logger.error(f"Firebase configuration is incomplete. Missing: {', '.join(missing_fields)}")
            return jsonify({'error': f'Firebase configuration is incomplete. Missing required fields: {", ".join(missing_fields)}'}), 500
            
        return jsonify(config)
    except Exception as e:
        logger.error(f"Error providing Firebase configuration: {str(e)}", exc_info=True)
        # Additional debug info
        logger.error(f"Environment variables: {[k for k in os.environ.keys() if 'FIREBASE' in k]}")
        return jsonify({'error': str(e)}), 500

async def generate_response(user_query, context, persona, conversation_history, is_first_interaction):
    """Simplified response generation for web interface with enhanced Hebrew support"""
    # Detect language properly with regex
    hebrew_pattern = re.compile(r'[\u0590-\u05FF\uFB1D-\uFB4F]')
    query_language = "Hebrew" if hebrew_pattern.search(user_query) else "English"
    
    # Log the detected language
    logger.info(f"Message language detected as: {query_language}")
    
    # Get service style
    service_style = persona.get("service_orientation", "informational")
    
    # Build prompt with robust language instruction
    if query_language == "Hebrew":
        # Enhanced Hebrew-specific instructions
        system_prompt = f"""You are a knowledgeable assistant. Use the following context to answer the user's question accurately. If the context doesn't contain relevant information, say so.

Context:
{context}

CRITICALLY IMPORTANT: The user has asked the question in Hebrew. You MUST respond in Hebrew. Your entire response should be in Hebrew only.

MORE IMPORTANT INSTRUCTIONS:
1. ALWAYS respond in Hebrew.
2. DO NOT mix Hebrew and English in your response. ONLY use Hebrew.
3. Make your response appropriate for right-to-left (RTL) reading.
4. Keep your response concise and to the point.
"""
    else:
        # Standard English prompt
        system_prompt = f"""You are a knowledgeable assistant. Use the following context to answer the user's question accurately. If the context doesn't contain relevant information, say so.

Context:
{context}
"""
    
    # Add persona directive
    if "directive" in persona:
        system_prompt += f"\nPERSONA DIRECTIVE:\n{persona['directive']}\n"
    
    # Add service style instructions
    style_instructions = get_service_style_instructions(service_style)
    system_prompt += f"\nSERVICE STYLE: {service_style}\n{style_instructions}\n"
    
    # Control introduction based on conversation state
    if is_first_interaction:
        system_prompt += "\nThis is the first message. You may briefly introduce yourself with your name and title, but keep it to ONE short sentence before addressing the query.\n"
    else:
        system_prompt += "\nIMPORTANT: This is an ongoing conversation. DO NOT introduce yourself again. DO NOT mention your name or title. The user already knows who you are. Just answer their question directly without any self-reference.\n"
    
    system_prompt += "\nProvide a clear, concise response based on the context provided."
    
    # Get settings for API key
    from config.settings import get_settings
    settings = get_settings()
    
    # Debug log for API key (not printing actual key, just length and first/last 2 chars)
    if settings.OPENROUTER_API_KEY:
        key_prefix = settings.OPENROUTER_API_KEY[:2]
        key_suffix = settings.OPENROUTER_API_KEY[-2:]
        logger.info(f"OpenRouter API key length: {len(settings.OPENROUTER_API_KEY)}, prefix: {key_prefix}, suffix: {key_suffix}")
    else:
        logger.error("OpenRouter API key is missing")
    
    # Use OpenRouter API directly
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Prepare conversation history correctly - convert from string if needed
    processed_history = []
    for msg in conversation_history:
        if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
            processed_history.append(msg)
        else:
            logger.warning(f"Skipping invalid message in history: {msg}")
    
    payload = {
        "model": "google/gemma-3-27b-it:free",
        "messages": [
            {"role": "system", "content": system_prompt},
            *processed_history,
            {"role": "user", "content": user_query}
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    # Add specific Hebrew handling parameters if necessary
    if query_language == "Hebrew":
        logger.info("Adding Hebrew-specific configuration to API request")
        
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "RAG Chat Interface",
        "Accept-Charset": "UTF-8"  # Explicitly request UTF-8 responses
    }
    
    try:
        timeout = aiohttp.ClientTimeout(total=60)  # 60 second timeout
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    # Ensure we're decoding response as UTF-8
                    data = await response.json(encoding='utf-8')
                    response_text = data['choices'][0]['message']['content']
                    
                    # Verify if query is in Hebrew but response isn't
                    if query_language == "Hebrew" and not hebrew_pattern.search(response_text):
                        logger.warning("Query was in Hebrew but response is not. Returning fallback Hebrew message.")
                        return "אני מתנצל, אך התרחשה שגיאה. אנא נסה שוב או נסח את השאלה בצורה אחרת."
                    
                    return response_text
                else:
                    error_text = await response.text()
                    logger.error(f"OpenRouter API error ({response.status}): {error_text}")
                    
                    # Return language-appropriate error message
                    if query_language == "Hebrew":
                        return "אירעה שגיאה בזמן יצירת התשובה. אנא נסה שוב מאוחר יותר."
                    else:
                        return f"Error: Unable to generate response ({response.status})"
    except asyncio.TimeoutError:
        logger.error("Request to OpenRouter API timed out")
        if query_language == "Hebrew":
            return "פג זמן הבקשה. אנא נסה שוב מאוחר יותר."
        else:
            return "Request timed out. Please try again later."
    except Exception as e:
        logger.error(f"Error calling OpenRouter API: {str(e)}", exc_info=True)
        if query_language == "Hebrew":
            return "אירעה שגיאה. אנא נסה שוב."
        else:
            return f"Error: {str(e)}"

def get_service_style_instructions(style):
    """Get service style specific instructions"""
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
    
    length_constraint = """
CRITICAL - RESPONSE LENGTH: Keep your response concise and impactful. Use no more than 3-5 sentences
for most responses. Never exceed 150 words total. Prioritize clarity and directness over comprehensiveness.
Focus on answering the specific question without tangents or unnecessary elaboration.
"""
    
    return style_instructions.get(style, style_instructions["informational"]) + length_constraint

if __name__ == '__main__':
    app.run(debug=True, port=5000)