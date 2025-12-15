document.addEventListener('DOMContentLoaded', () => {
    // API Configuration - Auto-detects localhost vs production
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/chat'
        : 'https://blueember-mruabw2n6-qodevs-projects.vercel.app/api/chat'; // Production Backend URL

    const chatBtn = document.getElementById('chat-bubble-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const modelSelector = document.getElementById('chat-model-selector'); // New selector

    // Toggle Chat Window
    function toggleChat() {
        chatWindow.classList.toggle('active');
        const icon = chatBtn.querySelector('i');
        if (chatWindow.classList.contains('active')) {
            icon.classList.remove('fa-comments');
            icon.classList.add('fa-xmark');
            // Focus input when opened
            setTimeout(() => chatInput.focus(), 300);
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-comments');
        }
    }

    chatBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Send Message Logic
    async function sendMessage() {
        const message = chatInput.value.trim();
        const model = modelSelector ? modelSelector.value : 'openai/gpt-oss-20b:free'; // Default to GPT-OSS

        if (message) {
            // Add User Message
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.disabled = true; // Disable input while waiting

            // Add Loading Indicator
            const loadingId = addLoadingIndicator();

            try {
                // Call Backend API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        model: model,
                        enableReasoning: model === 'openai/gpt-oss-20b:free' // Enable reasoning for GPT-OSS
                    })
                });

                // Remove Loading Indicator
                removeLoadingIndicator(loadingId);

                if (response.ok) {
                    const data = await response.json();
                    // Parse markdown if marked library is available
                    const parsedReply = typeof marked !== 'undefined' ? marked.parse(data.reply) : data.reply;
                    addMessage(parsedReply, 'bot', true);
                } else {
                    addMessage("I'm having trouble connecting to the server. Please make sure the backend is running.", 'bot');
                }
            } catch (error) {
                removeLoadingIndicator(loadingId);
                console.error('Chat Error:', error);
                addMessage("Connection error. Is the server running at localhost:3000?", 'bot');
            } finally {
                chatInput.disabled = false;
                chatInput.focus();
            }
        }
    }

    function addMessage(text, sender, isHtml = false) {
        const div = document.createElement('div');
        div.classList.add('message', sender);

        if (isHtml) {
            div.innerHTML = text; // Use innerHTML for markdown-parsed content
        } else {
            div.textContent = text; // Use textContent for plain text (user messages)
        }

        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.classList.add('message', 'bot');
        div.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>'; // Simple typing animation
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function removeLoadingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!chatWindow.contains(e.target) && !chatBtn.contains(e.target) && chatWindow.classList.contains('active')) {
            toggleChat();
        }
    });
});
