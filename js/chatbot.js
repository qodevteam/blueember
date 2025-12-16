document.addEventListener('DOMContentLoaded', () => {
    // 🧠 Smart URL Detection
    // 🧠 Smart URL Detection
    // Local Dev = Connect to localhost:3000 (Includes "file://" protocol)
    // Production = Connect to Vercel relative path
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';

    const API_URL = isLocal ? 'http://localhost:3000/api/chat' : '/api/chat';

    console.log(`Evora v2 Init. Environment: ${isLocal ? 'Local' : 'Production'}`);

    // DOM Elements
    const chatBtn = document.getElementById('chat-bubble-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const modelSelector = document.getElementById('chat-model-selector');

    // UI Toggles
    const toggleChat = () => {
        chatWindow.classList.toggle('active');
        const icon = chatBtn.querySelector('i');
        if (chatWindow.classList.contains('active')) {
            icon.classList.remove('fa-comments');
            icon.classList.add('fa-xmark');
            setTimeout(() => chatInput.focus(), 300);
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-comments');
        }
    };

    chatBtn?.addEventListener('click', toggleChat);
    closeBtn?.addEventListener('click', toggleChat);

    // Message Logic
    async function sendMessage() {
        const message = chatInput.value.trim();
        const model = modelSelector ? modelSelector.value : 'openai/gpt-oss-20b:free';

        if (!message) return;

        // UI Updates
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.disabled = true;

        const loaderId = addLoader();

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, model })
            });

            const data = await res.json();
            removeLoader(loaderId);

            if (res.ok) {
                // Parse Markdown if available
                const content = typeof marked !== 'undefined' ? marked.parse(data.reply) : data.reply;
                addMessage(content, 'bot', true);
            } else {
                console.error('API Error:', data);
                addMessage(`⚠️ System Error: ${data.error || 'Unknown error'}`, 'bot');
            }

        } catch (error) {
            removeLoader(loaderId);
            console.error('Fetch Error:', error);

            let msg = "Connection Failed.";
            if (isLocal) msg += " Is 'node server.js' running?";
            else msg += " Check Vercel Logs.";

            addMessage(msg, 'bot');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    }

    // Helpers
    function addMessage(text, sender, isHtml = false) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        isHtml ? (div.innerHTML = text) : (div.textContent = text);
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addLoader() {
        const id = 'loader-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.classList.add('message', 'bot');
        div.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>';
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function removeLoader(id) {
        document.getElementById(id)?.remove();
    }

    // Events
    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (chatWindow.classList.contains('active') &&
            !chatWindow.contains(e.target) &&
            !chatBtn.contains(e.target)) {
            toggleChat();
        }
    });
});
