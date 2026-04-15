/* ========================================
   Chat Functionality with buzz0xclaw AI
   ======================================== */

// Chat state
const chatState = {
    history: [],
    isTyping: false,
    sessionKey: null
};

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

async function initChat() {
    // Load chat history from localStorage
    loadChatHistory();
    
    // Setup event listeners
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        chatInput.addEventListener('input', autoResize);
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // If on chat page directly, load messages
    if (document.getElementById('chatMessages')) {
        renderMessages();
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('buzzweb_chat_history');
        if (saved) {
            chatState.history = JSON.parse(saved);
        }
    } catch (err) {
        console.log('Could not load chat history');
    }
}

function saveChatHistory() {
    try {
        localStorage.setItem('buzzweb_chat_history', JSON.stringify(chatState.history));
    } catch (err) {
        console.log('Could not save chat history');
    }
}

function autoResize() {
    const textarea = document.getElementById('chatInput');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addToHistory('user', message);
    input.value = '';
    autoResize();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to OpenClaw via sessions_send
        const response = await sendToOpenClaw(message);
        hideTypingIndicator();
        addToHistory('ai', response);
    } catch (err) {
        hideTypingIndicator();
        addToHistory('ai', 'Maaf, terjadi kesalahan. Silakan coba lagi.\n\nError: ' + err.message);
    }
}

async function sendToOpenClaw(message) {
    // Use the OpenClaw messaging API to send to the current session
    // This integrates with the main buzz0xclaw agent
    return new Promise((resolve, reject) => {
        // Get current session key from URL or use default
        const sessionKey = window.sessionKey || 'agent:main:telegram:direct:6937273891';
        
        // Use fetch to call OpenClaw's internal API
        fetch('/api/sessions/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionKey: sessionKey,
                message: message
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        })
        .then(data => {
            resolve(data.reply || data.message || 'Pesan terkirim');
        })
        .catch(err => {
            // Fallback: simulate AI response for demo
            console.log('OpenClaw API not available, using fallback');
            resolve(getSimulatedResponse(message));
        });
    });
}

function getSimulatedResponse(message) {
    // Fallback responses for demo purposes
    const lower = message.toLowerCase();
    
    if (lower.includes('solana') || lower.includes('trading')) {
        return 'Untuk Solana trading, kita sudah setup DexScreener scanner dan riset Jupiter vs GMGN. Perlu lanjut ke implementasi bot execution?';
    }
    if (lower.includes('airdrop')) {
        return 'Airdrop farming masih dalam riset. protocol yang belum token dan worth di-farm perlu dicek lebih lanjut. Mau saya research spesifik?';
    }
    if (lower.includes('yield') || lower.includes('lst')) {
        return 'LST yield research: JitoSOL ~5-7%, mSOL ~4-6%, bSOL ~3-5%, stSOL ~3-5%. JitoSOL paling tinggi tapi juga lebih baru.';
    }
    if (lower.includes('help') || lower.includes('bantuan')) {
        return 'Saya bisa bantu untuk:\n- Solana ecosystem analysis\n- Trading bot setup\n- Airdrop farming research\n- Business analysis\n- General questions\n\nMau tanya apa?';
    }
    
    return 'Oke, saya understand. Ada yang mau di-follow up dari conversation sebelumnya? Topics yang available: Solana Trading Bot, Airdrop Farming, LST Yield, Polymarket, Business Ideas.';
}

function addToHistory(type, content) {
    chatState.history.push({
        type: type,
        content: content,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 messages
    if (chatState.history.length > 50) {
        chatState.history = chatState.history.slice(-50);
    }
    
    saveChatHistory();
    renderMessages();
    
    // Scroll to bottom
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = chatState.history.map(msg => {
        const avatar = msg.type === 'ai' ? '🤝' : '👤';
        const avatarClass = msg.type === 'ai' ? 'ai' : 'user';
        
        return `
            <div class="chat-message ${msg.type}">
                <div class="chat-message-avatar">${avatar}</div>
                <div class="chat-message-content">${formatMessage(msg.content)}</div>
            </div>
        `;
    }).join('');
}

function formatMessage(content) {
    // Basic markdown-like formatting
    let formatted = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
}

function showTypingIndicator() {
    chatState.isTyping = true;
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'chat-message ai';
    indicator.innerHTML = `
        <div class="chat-message-avatar">🤝</div>
        <div class="chat-message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    chatState.isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function clearChatHistory() {
    if (confirm('Yakin mau hapus semua chat history?')) {
        chatState.history = [];
        saveChatHistory();
        renderMessages();
    }
}

// Export to global
window.sendMessage = sendMessage;
window.clearChatHistory = clearChatHistory;