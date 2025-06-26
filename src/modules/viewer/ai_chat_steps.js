// AI Chat step type - embeds full chat interface in SPA

export function renderAiChatStep(step, container, responses, kit, module) {
  // Validate configuration
  if (!step.webhookUrl) {
    container.innerHTML = '<div class="error">Configuration error: Missing webhook URL</div>';
    return;
  }

  // Create chat interface container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'embedded-chat-container';
  chatContainer.innerHTML = `
    <div class="chat-interface" id="chat-${step.id}">
      <div class="usage-display" id="usage-${step.id}">
        <div class="usage-item token-usage" style="display: ${step.usageType === 'token' ? 'flex' : 'none'}">
          <span>💰 Credits:</span>
          <span class="usage-badge" id="tokens-${step.id}">${step.initialTokens || 50}</span>
        </div>
        <div class="usage-item attempt-usage" style="display: ${step.usageType === 'attempt' ? 'flex' : 'none'}">
          <span>🔄 Attempts:</span>
          <span class="usage-badge" id="attempts-${step.id}">${step.initialAttempts || 10}/10</span>
        </div>
      </div>
      
      <div class="chat-messages" id="messages-${step.id}">
        <div class="message system">
          ${step.welcomeMessage || 'Welcome! How can I help you today?'}
        </div>
      </div>
      
      <div class="chat-input-area">
        <textarea 
          id="input-${step.id}" 
          placeholder="${step.placeholder || 'Type your message...'}"
          rows="1"
          class="chat-input-field"
        ></textarea>
        <button id="send-${step.id}" class="chat-send-button" title="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      
      <div class="chat-loading" id="loading-${step.id}" style="display: none;">
        <span>AI is thinking</span>
        <div class="loading-dots">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      </div>
      
      <div class="chat-error" id="error-${step.id}" style="display: none;"></div>
    </div>
  `;

  // Add styles for embedded chat
  const chatStyles = document.createElement('style');
  chatStyles.textContent = `
    .embedded-chat-container {
      border: 1px solid var(--primary2, #34495e);
      border-radius: 8px;
      background: white;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .chat-interface {
      display: flex;
      flex-direction: column;
      height: 400px;
    }
    
    .usage-display {
      background: var(--background, #FCF7EF);
      padding: 8px 16px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 20px;
    }
    
    .usage-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .usage-badge {
      background: var(--primary1, #1D3B60);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .usage-badge.low {
      background: var(--highlight, #601d38);
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .message.user {
      background: var(--primary1, #1D3B60);
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
    
    .message.assistant {
      background: #f1f3f4;
      color: var(--primary2, #34495e);
      margin-right: auto;
      border-bottom-left-radius: 4px;
    }
    
    .message.system {
      background: var(--background, #FCF7EF);
      color: var(--primary1, #1D3B60);
      margin: 0 auto;
      font-style: italic;
      border: 1px solid var(--primary1, #1D3B60);
      text-align: center;
      max-width: 90%;
    }
    
    .chat-input-area {
      border-top: 1px solid #e9ecef;
      padding: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    
    .chat-input-field {
      flex: 1;
      border: 1px solid var(--primary2, #34495e);
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 14px;
      resize: none;
      font-family: var(--font-family, system-ui, sans-serif);
      max-height: 80px;
    }
    
    .chat-input-field:focus {
      outline: none;
      border-color: var(--primary1, #1D3B60);
    }
    
    .chat-send-button {
      background: var(--primary1, #1D3B60);
      color: white;
      border: none;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .chat-send-button:hover:not(:disabled) {
      background: var(--highlight, #601d38);
    }
    
    .chat-send-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .chat-loading {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary2, #34495e);
      font-style: italic;
      font-size: 14px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }
    
    .loading-dots {
      display: flex;
      gap: 3px;
    }
    
    .loading-dot {
      width: 4px;
      height: 4px;
      background: var(--primary2, #34495e);
      border-radius: 50%;
      animation: pulse 1.4s ease-in-out infinite both;
    }
    
    .loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .loading-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes pulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    
    .chat-error {
      padding: 8px 16px;
      background: #f8d7da;
      color: var(--highlight, #601d38);
      border-top: 1px solid #f5c6cb;
      font-size: 14px;
    }
  `;
  
  if (!document.head.querySelector('#chat-styles')) {
    chatStyles.id = 'chat-styles';
    document.head.appendChild(chatStyles);
  }

  container.appendChild(chatContainer);

  // Initialize chat functionality
  initializeChatInterface(step, kit, module);
}

function initializeChatInterface(step, kit, module) {
  const stepId = step.id;
  const inputField = document.getElementById(`input-${stepId}`);
  const sendButton = document.getElementById(`send-${stepId}`);
  const messagesContainer = document.getElementById(`messages-${stepId}`);
  const loadingDiv = document.getElementById(`loading-${stepId}`);
  const errorDiv = document.getElementById(`error-${stepId}`);
  const tokensDisplay = document.getElementById(`tokens-${stepId}`);
  const attemptsDisplay = document.getElementById(`attempts-${stepId}`);

  // State management
  let isLoading = false;
  let tokensLeft = step.initialTokens || 50;
  let attemptsLeft = step.initialAttempts || 10;
  const userId = 'demo-user-' + Math.random().toString(36).substr(2, 9);

  // Auto-resize textarea
  inputField.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // Send message on Enter (without Shift)
  inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Send button click
  sendButton.addEventListener('click', sendMessage);

  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message || isLoading) return;

    // Check usage limits
    if (step.usageType === 'token' && tokensLeft <= 0) {
      addMessage('system', 'No credits remaining. Please purchase more to continue.');
      return;
    }
    
    if (step.usageType === 'attempt' && attemptsLeft <= 0) {
      addMessage('system', 'No attempts remaining for this session.');
      return;
    }

    // Clear input and add user message
    inputField.value = '';
    inputField.style.height = 'auto';
    addMessage('user', message);
    
    // Show loading state
    isLoading = true;
    sendButton.disabled = true;
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';

    try {
      const response = await fetch(step.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: userId,
          usageType: step.usageType || 'token'
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update usage counters
      if (step.usageType === 'token' && data.tokensLeft !== undefined) {
        tokensLeft = data.tokensLeft;
        updateUsageDisplay();
      }
      if (step.usageType === 'attempt' && data.attemptsLeft !== undefined) {
        attemptsLeft = data.attemptsLeft;
        updateUsageDisplay();
      }

      // Add AI response
      addMessage('assistant', data.response);

    } catch (error) {
      console.error('Chat error:', error);
      errorDiv.textContent = `Error: ${error.message}`;
      errorDiv.style.display = 'block';
      addMessage('system', 'Sorry, there was an error processing your message.');
    } finally {
      isLoading = false;
      sendButton.disabled = false;
      loadingDiv.style.display = 'none';
    }
  }

  function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function updateUsageDisplay() {
    if (tokensDisplay) {
      tokensDisplay.textContent = tokensLeft;
      tokensDisplay.className = `usage-badge ${tokensLeft <= 5 ? 'low' : ''}`;
    }
    if (attemptsDisplay) {
      attemptsDisplay.textContent = `${attemptsLeft}/10`;
      attemptsDisplay.className = `usage-badge ${attemptsLeft <= 2 ? 'low' : ''}`;
    }
  }
}