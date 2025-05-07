// Main JavaScript for Affilichat

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    setupTabs();
    
    // Set up chat input field
    setupInputField();
    
    // Handle form submissions
    setupForms();
    
    // Fetch namespaces on page load
    fetchNamespaces();
    
    // Set up navigation links
    setupNavigation();
});

// Tab navigation functionality
function setupTabs() {
    const crawlTabLink = document.getElementById('crawl-tab-link');
    const chatTabLink = document.getElementById('chat-tab-link');
    const crawlTab = document.getElementById('crawl-tab');
    const chatTab = document.getElementById('chat-tab');
    
    if (!crawlTabLink || !chatTabLink || !crawlTab || !chatTab) return;
    
    // Set initial tab state
    crawlTabLink.classList.remove('active');
    chatTabLink.classList.add('active');
    crawlTab.style.display = 'none';
    chatTab.style.display = 'block';
    
    // Add click event listeners to tab links
    crawlTabLink.addEventListener('click', function(e) {
        e.preventDefault();
        crawlTabLink.classList.add('active');
        chatTabLink.classList.remove('active');
        crawlTab.style.display = 'block';
        chatTab.style.display = 'none';
    });
    
    chatTabLink.addEventListener('click', function(e) {
        e.preventDefault();
        chatTabLink.classList.add('active');
        crawlTabLink.classList.remove('active');
        chatTab.style.display = 'block';
        crawlTab.style.display = 'none';
    });
}

// Setup navigation links
function setupNavigation() {
    // Set up "Chat" navigation link
    const chatNav = document.getElementById('chat-nav');
    if (chatNav) {
        chatNav.addEventListener('click', function(e) {
            const chatTabLink = document.getElementById('chat-tab-link');
            if (chatTabLink) {
                chatTabLink.click();
            }
        });
    }
    
    // Set up "Crawler" navigation link
    const crawlNav = document.getElementById('crawl-nav');
    if (crawlNav) {
        crawlNav.addEventListener('click', function(e) {
            const crawlTabLink = document.getElementById('crawl-tab-link');
            if (crawlTabLink) {
                crawlTabLink.click();
            }
        });
    }
    
    // Set up "Start Chatting" button
    const startChatBtn = document.getElementById('start-chat-btn');
    if (startChatBtn) {
        startChatBtn.addEventListener('click', function(e) {
            const chatTabLink = document.getElementById('chat-tab-link');
            if (chatTabLink) {
                chatTabLink.click();
            }
        });
    }
    
    // Set up "Back to Top" link
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo(0, 0);
        });
    }
}

// Handle direction and bidi control for input field
function setupInputField() {
    const messageInput = document.getElementById('message');
    const langStatus = document.getElementById('lang-status');
    if (!messageInput || !langStatus) return;
    
    // Handle input events for dynamic directionality
    messageInput.addEventListener('input', function() {
        // Check if input contains RTL text (especially Hebrew)
        const hasHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(this.value);
        const hasRTL = hasHebrew || containsRTL(this.value);
        
        // Set direction based on content
        this.setAttribute('dir', hasRTL ? 'rtl' : 'ltr');
        
        // Apply Hebrew-specific font if needed
        if (hasHebrew) {
            this.classList.add('hebrew-text');
            langStatus.textContent = 'עברית (Hebrew)';
            langStatus.style.direction = 'rtl';
            langStatus.style.textAlign = 'right';
        } else {
            this.classList.remove('hebrew-text');
            langStatus.textContent = 'English';
            langStatus.style.direction = 'ltr';
            langStatus.style.textAlign = 'left';
        }
    });
    
    // Add keyboard layout switching hints
    messageInput.title = "Alt+Shift to switch between English and Hebrew keyboard";
}

// Set up form handlers
function setupForms() {
    // Handle chat form submission
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    // Handle crawl form submission
    const crawlForm = document.getElementById('crawl-form');
    if (crawlForm) {
        crawlForm.addEventListener('submit', handleCrawlSubmit);
    }
}

// Handle chat form submission
function handleChatSubmit(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Disable the send button to prevent duplicate submissions
    const sendButton = document.getElementById('send-btn');
    sendButton.disabled = true;
    
    try {
        // Add user message to the chat
        appendMessage(message, 'user');
        
        // Get other form values
        const namespace = document.getElementById('namespace').value;
        const serviceStyle = document.getElementById('service_style').value;
        const conversationId = document.getElementById('conversation_id').value;
        const history = document.getElementById('history').value;
        
        // Create FormData
        const formData = new FormData();
        formData.append('message', message);
        formData.append('namespace', namespace);
        formData.append('service_style', serviceStyle);
        formData.append('conversation_id', conversationId);
        formData.append('history', history);
        
        // Display loading indicator
        const chatMessages = document.getElementById('chat-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message assistant-message';
        loadingDiv.textContent = 'Thinking...';
        loadingDiv.id = 'loading-message';
        chatMessages.appendChild(loadingDiv);
        
        // Clear input and re-enable send after a short delay
        messageInput.value = '';
        
        // Send request to server
        fetch('/api/chat', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept-Charset': 'UTF-8'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data received:', data);
            
            // Remove loading indicator
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            if (!data.success) {
                throw new Error(data.message || 'Unknown error occurred');
            }
            
            // Update conversation ID and history
            document.getElementById('conversation_id').value = data.conversation_id || '';
            document.getElementById('history').value = JSON.stringify(data.history || []);
            
            // Check if response exists and handle it properly, especially if it's Hebrew
            if (data.response) {
                // Check if response contains Hebrew (for debugging)
                const responseContainsHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(data.response);
                if (responseContainsHebrew) {
                    console.log('Response contains Hebrew text');
                }
                
                appendMessage(data.response, 'assistant');
            } else {
                throw new Error('No response received from server');
            }
        })
        .catch(error => {
            console.error('Error in chat request:', error);
            
            // Remove loading indicator if it exists
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Add error message to chat
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message system-message';
            errorDiv.textContent = `Error: ${error.message || 'Could not get response'}`;
            document.getElementById('chat-messages').appendChild(errorDiv);
        })
        .finally(() => {
            // Re-enable the send button
            sendButton.disabled = false;
        });
    } catch (error) {
        console.error('Error processing message:', error);
        sendButton.disabled = false;
    }
}

// Handle crawl form submission
function handleCrawlSubmit(e) {
    e.preventDefault();
    
    // Show status message
    const crawlStatus = document.getElementById('crawl-status');
    const crawlResult = document.getElementById('crawl-result');
    
    crawlStatus.style.display = 'block';
    crawlResult.innerHTML = '';
    
    // Get form data
    const formData = new FormData(e.target);
    
    // Send request to server
    fetch('/api/crawl', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Hide status message
        crawlStatus.style.display = 'none';
        
        // Show result
        if (data.success) {
            crawlResult.innerHTML = `<div style="color: green;">Success: ${data.message}</div><div>Namespace: ${data.namespace}</div>`;
            
            // Refresh namespaces
            fetchNamespaces();
        } else {
            crawlResult.innerHTML = `<div style="color: red;">Error: ${data.message}</div>`;
        }
    })
    .catch(error => {
        // Hide status message
        crawlStatus.style.display = 'none';
        
        // Show error
        crawlResult.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
    });
}

// Function to fetch namespaces
function fetchNamespaces() {
    fetch('/api/namespaces')
    .then(response => response.json())
    .then(data => {
        const namespaceSelect = document.getElementById('namespace');
        namespaceSelect.innerHTML = '';
        
        if (data.namespaces.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No namespaces available - crawl a website first';
            namespaceSelect.appendChild(option);
        } else {
            data.namespaces.forEach(namespace => {
                const option = document.createElement('option');
                option.value = namespace;
                option.textContent = namespace;
                namespaceSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching namespaces:', error);
    });
}

// Function to append a message to the chat
function appendMessage(message, sender) {
    console.log(`Adding ${sender} message:`, message);
    
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('Could not find chat-messages element');
        return;
    }
    
    const messageDiv = document.createElement('div');
    
    // Detect directionality - special handling for Hebrew
    const containsHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(message);
    const containsRTL = containsHebrew || /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(message);
    const dir = containsRTL ? 'rtl' : 'ltr';
    
    messageDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'assistant-message'}`;
    
    // Create wrapper element for better layout control
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';
    
    // Create inner element for text with appropriate direction
    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';
    textSpan.setAttribute('dir', dir);
    
    // Apply language and font settings
    if (containsRTL) {
        textSpan.classList.add('rtl-text');
        
        if (containsHebrew) {
            textSpan.classList.add('hebrew-text');
            textSpan.lang = 'he';
        }
    }
    
    // Set text content directly without processing
    textSpan.textContent = message;
    
    // Add the span to the wrapper, then to the message div
    wrapper.appendChild(textSpan);
    messageDiv.appendChild(wrapper);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Process bidirectional text after adding the message
    // Use requestAnimationFrame to ensure it's done after layout but before painting
    requestAnimationFrame(() => {
        try {
            if (containsRTL) {
                enhanceBidiText(textSpan);
            }
        } catch (error) {
            console.error('Error applying bidi handling:', error);
        }
    });
    
    console.log('Message added successfully');
}

// Function to enhance bidirectional text display
function enhanceBidiText(element) {
    if (!element || !element.textContent) return;
    
    const text = element.textContent;
    const containsHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text);
    
    // Early exit if no Hebrew or RTL content
    if (!containsHebrew && !/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text)) {
        return;
    }
    
    // Add unicode control marks for cleaner RTL text segmentation
    try {
        // Create fragment to build the enhanced content
        const fragment = document.createDocumentFragment();
        
        // Split text into segments - preserving original line breaks
        const lines = text.split(/\r?\n/);
        
        // Process each line
        lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                // Add line break between lines
                fragment.appendChild(document.createElement('br'));
            }
            
            // Process segments in line - handle special elements
            
            // Split text into different types of elements
            let segments = [];
            
            // Find and isolate special patterns
            // 1. URLs and email addresses
            const urlPattern = /(https?:\/\/[^\s]+|[\w.-]+@[\w.-]+\.\w+)/g;
            let lastIndex = 0;
            let match;
            
            while ((match = urlPattern.exec(line)) !== null) {
                // Add text before the URL/email
                if (match.index > lastIndex) {
                    segments.push({
                        type: 'text',
                        content: line.substring(lastIndex, match.index)
                    });
                }
                
                // Add the URL/email
                segments.push({
                    type: 'ltr',
                    content: match[0]
                });
                
                lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text after last match
            if (lastIndex < line.length) {
                segments.push({
                    type: 'text',
                    content: line.substring(lastIndex)
                });
            }
            
            // If no segments were created, use the whole line
            if (segments.length === 0) {
                segments.push({
                    type: 'text',
                    content: line
                });
            }
            
            // Process numeric patterns in each text segment
            const processedSegments = [];
            segments.forEach(segment => {
                if (segment.type === 'text') {
                    // Handle numbers, times, and other formatted values
                    let content = segment.content;
                    content = content.replace(/(\d+(?:\.\d+)?(?:%)?)/g, '<span class="bidi-num">$1</span>');
                    processedSegments.push({
                        type: 'html',
                        content: content
                    });
                } else {
                    processedSegments.push(segment);
                }
            });
            
            // Create DOM elements for each segment
            processedSegments.forEach(segment => {
                if (segment.type === 'ltr') {
                    const span = document.createElement('span');
                    span.className = 'ltr-segment';
                    span.textContent = segment.content;
                    fragment.appendChild(span);
                } else if (segment.type === 'html') {
                    const container = document.createElement('span');
                    container.innerHTML = segment.content;
                    fragment.appendChild(container);
                } else {
                    const textNode = document.createTextNode(segment.content);
                    fragment.appendChild(textNode);
                }
            });
        });
        
        // Replace the element's content with the enhanced fragment
        element.innerHTML = '';
        element.appendChild(fragment);
        
    } catch (error) {
        console.error('Error processing bidirectional text:', error);
        // Fallback - maintain original text if processing fails
        element.textContent = text;
    }
}

// Detect if the text contains RTL characters
function containsRTL(text) {
    const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlChars.test(text);
} 