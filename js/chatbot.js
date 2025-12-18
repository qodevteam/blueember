document.addEventListener('DOMContentLoaded', () => {
    // 🧠 Smart URL Detection
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

    // --- 🎯 LOCAL RESPONSE ENGINE ---
    const localResponses = [
        // Contact & Support (5 patterns)
        { patterns: ['contact', 'reach you', 'get in touch', 'support', 'help desk'], response: "You can contact us through our <a href='contact.html' class='chat-link'>Contact Page</a>. We're here to help!" },
        { patterns: ['email', 'mail address', 'send an email'], response: "Email us at support@blueember.com or visit our <a href='contact.html' class='chat-link'>Contact Page</a>." },
        { patterns: ['phone', 'call', 'telephone'], response: "Call us at +1-800-EMBER or visit the <a href='contact.html' class='chat-link'>Contact Page</a> for more options." },
        { patterns: ['office hours', 'when open', 'business hours'], response: "We're available Monday-Friday, 9 AM - 6 PM EST. Visit our <a href='contact.html' class='chat-link'>Contact Page</a> for details." },
        { patterns: ['location', 'address', 'where are you'], response: "We're located in New York. Full details on our <a href='contact.html' class='chat-link'>Contact Page</a>." },

        // Product Categories (10 patterns)
        { patterns: ['laptop', 'laptops', 'notebook'], response: "Check out our <a href='products.html?category=laptops' class='chat-link'>Laptops Collection</a>!" },
        { patterns: ['phone', 'smartphone', 'mobile'], response: "Browse our <a href='products.html?category=phones' class='chat-link'>Smartphones</a>!" },
        { patterns: ['tablet', 'ipad'], response: "Explore our <a href='products.html?category=tablets' class='chat-link'>Tablets</a>!" },
        { patterns: ['headphone', 'earbuds', 'airpods'], response: "Discover our <a href='products.html?category=audio' class='chat-link'>Audio Products</a>!" },
        { patterns: ['watch', 'smartwatch', 'wearable'], response: "See our <a href='products.html?category=wearables' class='chat-link'>Wearables</a>!" },
        { patterns: ['camera', 'photography'], response: "View our <a href='products.html?category=cameras' class='chat-link'>Cameras</a>!" },
        { patterns: ['gaming', 'console', 'playstation', 'xbox'], response: "Check out <a href='products.html?category=gaming' class='chat-link'>Gaming Gear</a>!" },
        { patterns: ['accessory', 'accessories', 'charger', 'case'], response: "Browse <a href='products.html?category=accessories' class='chat-link'>Accessories</a>!" },
        { patterns: ['desktop', 'pc', 'computer'], response: "Explore our <a href='products.html?category=computers' class='chat-link'>Computers</a>!" },
        { patterns: ['tv', 'television', 'monitor'], response: "See our <a href='products.html?category=displays' class='chat-link'>Displays & TVs</a>!" },

        // Shopping & Orders (10 patterns)
        { patterns: ['cart', 'shopping cart', 'basket'], response: "View your <a href='cart.html' class='chat-link'>Shopping Cart</a> here!" },
        { patterns: ['checkout', 'pay', 'payment'], response: "Ready to checkout? Go to your <a href='cart.html' class='chat-link'>Cart</a>!" },
        { patterns: ['track order', 'order status', 'where is my order'], response: "Track your order on the <a href='account.html' class='chat-link'>Account Page</a>!" },
        { patterns: ['return', 'refund', 'cancel order'], response: "Visit our <a href='returns.html' class='chat-link'>Returns & Refunds</a> page or <a href='contact.html' class='chat-link'>contact support</a>." },
        { patterns: ['shipping', 'delivery', 'how long'], response: "Standard shipping takes 3-5 business days. Express available! Details on <a href='shipping.html' class='chat-link'>Shipping Info</a>." },
        { patterns: ['free shipping'], response: "Free shipping on orders over $50! See <a href='shipping.html' class='chat-link'>details</a>." },
        { patterns: ['discount', 'coupon', 'promo code'], response: "Check our <a href='deals.html' class='chat-link'>Deals Page</a> for current promotions!" },
        { patterns: ['compare', 'comparison'], response: "Use our <a href='compare.html' class='chat-link'>Product Comparison Tool</a>!" },
        { patterns: ['deals', 'sale', 'offers'], response: "See all <a href='deals.html' class='chat-link'>Current Deals</a>!" },
        { patterns: ['warranty', 'guarantee'], response: "All products come with a 1-year warranty. Details in <a href='warranty.html' class='chat-link'>Warranty Info</a>." },

        // Business Info (10 patterns)
        { patterns: ['who are you', 'about', 'company'], response: "We're Blue Ember - your trusted tech marketplace! Learn more on our <a href='about.html' class='chat-link'>About Page</a>." },
        { patterns: ['mission', 'vision', 'values'], response: "We believe in quality tech for everyone. Read our story on the <a href='about.html' class='chat-link'>About Page</a>." },
        { patterns: ['privacy', 'data', 'personal information'], response: "Your privacy matters. See our <a href='privacy.html' class='chat-link'>Privacy Policy</a>." },
        { patterns: ['terms', 'conditions', 'legal'], response: "Review our <a href='terms.html' class='chat-link'>Terms & Conditions</a>." },
        { patterns: ['career', 'job', 'hiring'], response: "We're hiring! Check <a href='careers.html' class='chat-link'>Careers</a> for openings." },
        { patterns: ['partner', 'business inquiry', 'collaborate'], response: "Interested in partnership? <a href='contact.html' class='chat-link'>Contact us</a>!" },
        { patterns: ['social media', 'facebook', 'instagram', 'twitter'], response: "Follow us on Instagram, Twitter, and Facebook! Links in the footer." },
        { patterns: ['newsletter', 'subscribe', 'updates'], response: "Subscribe to our newsletter for exclusive deals! Sign up at the bottom of any page." },
        { patterns: ['blog', 'articles', 'news'], response: "Read tech insights on our <a href='blog.html' class='chat-link'>Blog</a>!" },
        { patterns: ['reviews', 'testimonials', 'ratings'], response: "See what customers say on our <a href='reviews.html' class='chat-link'>Reviews Page</a>!" },

        // General Q&A (15+ patterns)
        { patterns: ['hello', 'hi', 'hey', 'greetings'], response: "Hi there! 👋 How can I help you today?" },
        { patterns: ['thanks', 'thank you', 'appreciate'], response: "You're welcome! Let me know if you need anything else." },
        { patterns: ['goodbye', 'bye', 'see you'], response: "Goodbye! Come back anytime. 😊" },
        { patterns: ['how are you', 'how\'s it going'], response: "I'm doing great! Ready to help you find what you need." },
        { patterns: ['what can you do', 'help me', 'features'], response: "I can help you navigate products, answer questions, or direct you to support. Ask me anything!" },
        { patterns: ['name', 'who are you', 'your name'], response: "I'm Evora, your Blue Ember shopping assistant!" },
        { patterns: ['joke', 'funny', 'make me laugh'], response: "Why did the computer go to the doctor? Because it had a virus! 😄" },
        { patterns: ['best product', 'recommend', 'suggestion'], response: "That depends on your needs! Browse our <a href='products.html' class='chat-link'>Products</a> or tell me what you're looking for." },
        { patterns: ['price', 'cost', 'how much'], response: "Prices vary by product. Check our <a href='products.html' class='chat-link'>Products Page</a> for details!" },
        { patterns: ['payment methods', 'how to pay', 'credit card'], response: "We accept Visa, Mastercard, PayPal, and more. Secure checkout guaranteed!" },
        { patterns: ['secure', 'safe', 'security'], response: "Your data is encrypted and secure. We use industry-standard SSL protection." },
        { patterns: ['gift card', 'voucher'], response: "Gift cards available! Perfect for tech lovers. <a href='giftcards.html' class='chat-link'>Get One</a>." },
        { patterns: ['student discount', 'education'], response: "Students get 10% off! Verify with your .edu email at checkout." },
        { patterns: ['bulk order', 'wholesale'], response: "For bulk orders, please <a href='contact.html' class='chat-link'>contact our B2B team</a>." },
        { patterns: ['international', 'ship abroad', 'worldwide'], response: "Yes! We ship to 50+ countries. Check <a href='shipping.html' class='chat-link'>International Shipping</a>." }
    ];

    // Pattern Matcher
    function getLocalResponse(message) {
        const lowerMsg = message.toLowerCase();
        for (const entry of localResponses) {
            if (entry.patterns.some(pattern => lowerMsg.includes(pattern))) {
                return entry.response;
            }
        }
        return null; // No match, use API
    }

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

        // 🎯 Check Local Responses First
        const localReply = getLocalResponse(message);
        if (localReply) {
            setTimeout(() => {
                addMessage(localReply, 'bot', true);
                chatInput.disabled = false;
                chatInput.focus();
            }, 300); // Simulate natural delay
            return;
        }

        // Fallback to API
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
            if (isLocal) msg += " Is 'npm start' running?";
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







