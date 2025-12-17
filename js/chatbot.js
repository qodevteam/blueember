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






const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch'); // Removed: Use native Node 18+ fetch

// Load environment variables locally
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './api.env' });
}

const app = express();
const port = 3000;

// Middleware - OPEN CORS POLICY (As requested)
app.use(cors({ origin: '*' }));
app.use(cors({ origin: '*' }));
app.use(express.json());

// EXTREME DEBUGGING: Log every request path
app.use((req, res, next) => {
    console.log(`[EXTREME DEBUG] Method: ${req.method} | URL: ${req.url} | Path: ${req.path}`);
    next();
});

// --- 🧠 Smart Routing System ---

// Local Response System
const getLocalResponse = (message) => {
    const msg = message.toLowerCase().trim();

    // Contact related
    if (msg.includes('contact') || msg.includes('support') || msg.includes('help') || msg.includes('customer service')) {
        return "For contact information and support, please visit our [Contact page](Contact.html). We're here to help!";
    }

    // Product categories
    if (msg.includes('refrigerator') || msg.includes('fridge')) {
        return "Check out our wide selection of refrigerators from top brands like Haier, Bosch, and Electrolux. Visit our [Refrigerators page](product2.html) to browse and compare models.";
    }

    if (msg.includes('washer') || msg.includes('dryer') || msg.includes('laundry')) {
        return "Explore our washers and dryers collection featuring energy-efficient models from Bosch, Whirlpool, and more. Visit our [Washers & Dryers page](product2.html) for the best deals.";
    }

    if (msg.includes('air conditioner') || msg.includes('ac') || msg.includes('cooling')) {
        return "Stay cool with our air conditioners from Haier, Electrolux, and LG. Visit our [Air Conditioners page](product2.html) to find the perfect cooling solution.";
    }

    if (msg.includes('microwave') || msg.includes('oven')) {
        return "Discover our microwave ovens and cooking appliances from Panasonic, Bosch, and Samsung. Visit our [Microwaves page](product2.html) for convection and grill options.";
    }

    if (msg.includes('dishwasher')) {
        return "Make cleaning easier with our dishwashers from Bosch, Electrolux, and Whirlpool. Visit our [Dishwashers page](product2.html) to see quiet and efficient models.";
    }

    if (msg.includes('cooktop') || msg.includes('stove') || msg.includes('range')) {
        return "Find the perfect cooktop or range for your kitchen from Bosch, Electrolux, and Whirlpool. Visit our [Cooktops & Ovens page](product2.html) for gas and electric options.";
    }

    if (msg.includes('vacuum') || msg.includes('cleaner')) {
        return "Keep your home spotless with our vacuum cleaners from Bosch, Electrolux, and other brands. Visit our [Vacuum Cleaners page](product2.html) for robotic and upright models.";
    }

    if (msg.includes('coffee') || msg.includes('espresso')) {
        return "Start your day right with our coffee makers and espresso machines. Visit our [Small Appliances page](product2.html) for premium brewing options.";
    }

    if (msg.includes('blender') || msg.includes('mixer') || msg.includes('kitchen appliance')) {
        return "Enhance your cooking with our blenders, mixers, and small kitchen appliances from Bosch and other brands. Visit our [Small Appliances page](product2.html).";
    }

    // Brands
    if (msg.includes('bosch')) {
        return "BOSCH offers premium home appliances with German engineering. Visit our [BOSCH page](BOSCH-productpage.html) to explore their full range.";
    }

    if (msg.includes('haier')) {
        return "Haier provides reliable and affordable appliances for modern homes. Visit our [Haier page](Haier-productpage.html) to see their latest products.";
    }

    if (msg.includes('lg')) {
        return "LG appliances combine innovation and style. Visit our [LG page](LG-productpage.html) for smart home solutions.";
    }

    if (msg.includes('samsung')) {
        return "Samsung delivers cutting-edge technology in appliances. Visit our [Samsung page](samsung-productpage.html) for their premium lineup.";
    }

    if (msg.includes('whirlpool')) {
        return "Whirlpool is known for durable and efficient appliances. Visit our [Whirlpool page](Whirlpool-productpage.html) for quality you can trust.";
    }

    if (msg.includes('electrolux')) {
        return "Electrolux offers Scandinavian design and performance. Visit our [Electrolux page](Electrolux-productpage.html) for elegant appliances.";
    }

    if (msg.includes('panasonic')) {
        return "Panasonic delivers reliable Japanese engineering. Visit our [Panasonic page](Panasonic-productpage.html) for quality appliances.";
    }

    if (msg.includes('sony')) {
        return "Sony brings entertainment and innovation to appliances. Visit our [Sony page](Sony-productpage.html) for their unique products.";
    }

    if (msg.includes('apple')) {
        return "Apple products combine technology and design. Visit our [Apple page](Apple-productpage.html) for their premium electronics.";
    }

    // Common questions
    if (msg.includes('shipping') || msg.includes('delivery')) {
        return "We offer fast and reliable shipping across the US. Standard delivery takes 3-5 business days, with expedited options available. Visit our [Contact page](Contact.html) for shipping details.";
    }

    if (msg.includes('warranty') || msg.includes('guarantee')) {
        return "All our appliances come with manufacturer warranties. Most products include 1-2 year parts and labor coverage. Check product details or contact us for specific warranty information.";
    }

    if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange')) {
        return "We have a 30-day return policy for most items. Visit our [Refund and Exchange page](Refund and Exchange.html) for complete details on returns, exchanges, and refunds.";
    }

    if (msg.includes('installation') || msg.includes('setup')) {
        return "We provide professional installation services for all major appliances. Our certified technicians ensure proper setup and safety. Contact us for installation quotes.";
    }

    if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive')) {
        return "We offer competitive pricing with frequent sales and discounts. Use our comparison tool to find the best deals. Prices may vary by location and availability.";
    }

    if (msg.includes('energy efficient') || msg.includes('energy star')) {
        return "Many of our appliances are ENERGY STAR certified, helping you save on electricity bills. Look for the Energy Star badge on product pages for certified models.";
    }

    if (msg.includes('compare') || msg.includes('comparison')) {
        return "Use our product comparison tool to easily compare features, prices, and specifications. Visit our [Compare page](compare.html) to get started.";
    }

    if (msg.includes('brands') || msg.includes('manufacturers')) {
        return "We carry appliances from trusted global brands including Bosch, Haier, LG, Samsung, Whirlpool, Electrolux, Panasonic, and Sony. Visit our [Brands page](BRANDS.HTML) to explore all options.";
    }

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! Welcome to Evora Electronics. How can I help you find the perfect appliance today?";
    }

    if (msg.includes('thank you') || msg.includes('thanks')) {
        return "You're welcome! If you have any more questions about our appliances or need help with your purchase, feel free to ask.";
    }

    // Store information
    if (msg.includes('location') || msg.includes('store') || msg.includes('address')) {
        return "Our main location is at 196 Burton Ave, Hasbrouck Heights, NJ 07604, USA. We serve customers nationwide with shipping and delivery services.";
    }

    if (msg.includes('hours') || msg.includes('open')) {
        return "We're open Monday to Friday 9 AM - 7 PM, Saturday 9 AM - 5 PM, and Sunday 11 AM - 4 PM EST. Contact us anytime for support.";
    }

    if (msg.includes('about') || msg.includes('company')) {
        return "Evora Electronics has been providing premium home appliances since 2005. We partner with top global brands to offer energy-efficient, reliable products with expert support.";
    }

    // Product features
    if (msg.includes('smart') || msg.includes('wifi') || msg.includes('connected')) {
        return "Many of our appliances feature smart connectivity. Look for WiFi-enabled models from LG, Samsung, and Bosch that can be controlled via mobile apps.";
    }

    if (msg.includes('quiet') || msg.includes('noise')) {
        return "We carry quiet operation models from various brands. Check product specifications for decibel ratings. Bosch and LG often have some of the quietest appliances.";
    }

    if (msg.includes('capacity') || msg.includes('size')) {
        return "Appliance capacities vary by type. Refrigerators range from 10-30 cu ft, washers from 3-6 cu ft, and dishwashers from 12-18 place settings. Check individual product specs.";
    }

    // Shopping assistance
    if (msg.includes('recommend') || msg.includes('suggest')) {
        return "I'd be happy to help you find the right appliance! Tell me your budget, space constraints, and must-have features, and I'll recommend some great options.";
    }

    if (msg.includes('best') || msg.includes('top')) {
        return "Our best-selling categories include refrigerators, washers, and air conditioners. Popular brands are Bosch, Haier, and LG. Visit our [Featured Products](index.html#products-overview) section.";
    }

    if (msg.includes('new') || msg.includes('latest')) {
        return "Check out our latest arrivals from top brands. We regularly update our inventory with the newest models featuring advanced technology and energy efficiency.";
    }

    if (msg.includes('sale') || msg.includes('discount') || msg.includes('deal')) {
        return "We frequently have sales and special offers. Sign up for our newsletter or check our [Home page](index.html) for current promotions and discounts.";
    }

    // Technical questions
    if (msg.includes('repair') || msg.includes('service')) {
        return "We offer repair services for most brands we carry. Contact our service department for diagnostics and repair quotes. Some manufacturers also offer extended warranties.";
    }

    if (msg.includes('maintenance') || msg.includes('cleaning')) {
        return "Regular maintenance extends appliance life. We recommend professional cleaning annually for most appliances. Check manufacturer guidelines for specific care instructions.";
    }

    if (msg.includes('voltage') || msg.includes('power') || msg.includes('electric')) {
        return "Most appliances require 110-120V standard household outlets. Larger appliances like ranges may need 220-240V. Always check product specifications and consult an electrician if unsure.";
    }

    // Environmental
    if (msg.includes('eco') || msg.includes('environment') || msg.includes('green')) {
        return "We prioritize eco-friendly appliances with Energy Star certification and efficient refrigerants. Look for models with high energy ratings to reduce your carbon footprint.";
    }

    if (msg.includes('recycle') || msg.includes('disposal')) {
        return "We offer recycling programs for old appliances. Many manufacturers have take-back programs. Contact us for information on responsible disposal and recycling options.";
    }

    // Payment and financing
    if (msg.includes('payment') || msg.includes('finance') || msg.includes('installment')) {
        return "We accept major credit cards, PayPal, and offer financing options through approved partners. Contact us for details on payment plans and special financing offers.";
    }

    if (msg.includes('tax') || msg.includes('fee')) {
        return "Taxes are calculated at checkout based on your shipping address. We don't charge additional fees for standard shipping within the continental US.";
    }

    // International
    if (msg.includes('international') || msg.includes('shipping') || msg.includes('outside us')) {
        return "We primarily serve customers in the United States. For international inquiries, please contact us directly to discuss shipping options and availability.";
    }

    // Miscellaneous
    if (msg.includes('career') || msg.includes('job') || msg.includes('work')) {
        return "We're always looking for talented individuals to join our team. Visit our [Contact page](Contact.html) to inquire about career opportunities at Evora Electronics.";
    }

    if (msg.includes('feedback') || msg.includes('review')) {
        return "We value your feedback! Please visit our [Contact page](Contact.html) to share your experience or leave a review. Your input helps us improve our service.";
    }

    if (msg.includes('privacy') || msg.includes('policy')) {
        return "Your privacy is important to us. Please review our [Privacy Policy](privacy policy.html) for information on how we collect, use, and protect your personal information.";
    }

    if (msg.includes('terms') || msg.includes('conditions')) {
        return "Please review our [Terms and Services](terms and services.html) for complete terms and conditions of use, including warranties, returns, and liability.";
    }

    // More specific questions
    if (msg.includes('how to') || msg.includes('guide') || msg.includes('tutorial')) {
        return "We have detailed guides and tutorials for appliance installation and maintenance. Visit our [Contact page](Contact.html) or check product manuals for step-by-step instructions.";
    }

    if (msg.includes('troubleshoot') || msg.includes('problem') || msg.includes('issue')) {
        return "Having appliance issues? Check our troubleshooting guides or contact our support team. Many common problems can be resolved with simple fixes.";
    }

    if (msg.includes('manual') || msg.includes('instructions')) {
        return "Product manuals and instructions are available on manufacturer websites or included with your purchase. Contact us if you need help finding specific documentation.";
    }

    if (msg.includes('parts') || msg.includes('accessories')) {
        return "We carry replacement parts and accessories for most appliances we sell. Contact us with your model number for availability and pricing.";
    }

    if (msg.includes('safety') || msg.includes('danger') || msg.includes('risk')) {
        return "Safety is our top priority. All our appliances meet safety standards. Always follow manufacturer guidelines and consult professionals for installation.";
    }

    if (msg.includes('certification') || msg.includes('standards')) {
        return "Our appliances meet UL, CE, and Energy Star certifications where applicable. We ensure all products comply with safety and efficiency standards.";
    }

    if (msg.includes('custom') || msg.includes('special order')) {
        return "We can special order many items not in stock. Contact us with specifications for pricing and availability on custom or special order appliances.";
    }

    if (msg.includes('demo') || msg.includes('showroom')) {
        return "Visit our showroom to see appliances in person and get expert advice. Our team can demonstrate features and help you make informed decisions.";
    }

    if (msg.includes('bulk') || msg.includes('wholesale')) {
        return "For bulk or wholesale inquiries, please contact our sales team. We offer special pricing for large orders and commercial accounts.";
    }

    if (msg.includes('gift') || msg.includes('present')) {
        return "Looking for appliance gifts? We have gift options and can help you choose the perfect item. Free gift wrapping available for special occasions.";
    }

    if (msg.includes('student') || msg.includes('discount')) {
        return "We offer student and military discounts on select items. Contact us or check our website for current promotional codes and special offers.";
    }

    if (msg.includes('senior') || msg.includes('elderly')) {
        return "Seniors receive special discounts and priority service. We also offer extended warranties and installation assistance for our senior customers.";
    }

    if (msg.includes('commercial') || msg.includes('business')) {
        return "For commercial or business appliance needs, we offer specialized products and services. Contact our commercial sales team for quotes and consultations.";
    }

    if (msg.includes('rental') || msg.includes('lease')) {
        return "We offer appliance rental options for short-term needs. Contact us to discuss rental terms, availability, and pricing for your specific requirements.";
    }

    if (msg.includes('trade') || msg.includes('in')) {
        return "We accept trade-ins on old appliances. Bring in your old appliance for evaluation and receive credit toward your new purchase.";
    }

    if (msg.includes('estimate') || msg.includes('quote')) {
        return "We provide free estimates for installation, delivery, and service. Contact us with your appliance details for accurate pricing.";
    }

    if (msg.includes('appointment') || msg.includes('schedule')) {
        return "Schedule service appointments, deliveries, or consultations online or by phone. Our team will confirm your preferred date and time.";
    }

    if (msg.includes('emergency') || msg.includes('urgent')) {
        return "For emergency repairs or urgent appliance needs, call our 24/7 emergency line. We prioritize critical appliance failures.";
    }

    if (msg.includes('warranty claim') || msg.includes('claim')) {
        return "To file a warranty claim, contact us with your purchase information and issue description. We'll guide you through the process with the manufacturer.";
    }

    if (msg.includes('upgrade') || msg.includes('update')) {
        return "Planning an appliance upgrade? We can help assess your current setup and recommend the best new models for your needs and budget.";
    }

    if (msg.includes('energy bill') || msg.includes('saving')) {
        return "Reduce your energy bills with our energy-efficient appliances. Many models pay for themselves through savings within a few years.";
    }

    if (msg.includes('water') || msg.includes('usage')) {
        return "Our water-efficient washers and dishwashers can save thousands of gallons annually. Look for WaterSense certified models for maximum savings.";
    }

    if (msg.includes('smart home') || msg.includes('integration')) {
        return "Integrate your appliances into a smart home system. We carry WiFi-enabled models that work with Alexa, Google Home, and Apple HomeKit.";
    }

    if (msg.includes('voice control') || msg.includes('alexa') || msg.includes('google')) {
        return "Many of our smart appliances support voice control through Alexa, Google Assistant, or Siri. Check product specs for compatibility.";
    }

    if (msg.includes('app') || msg.includes('mobile')) {
        return "Control and monitor your appliances remotely with manufacturer mobile apps. Download the app for your brand to access smart features.";
    }

    if (msg.includes('notification') || msg.includes('alert')) {
        return "Receive notifications about cycle completion, maintenance reminders, and error codes through smart appliance apps and connected services.";
    }

    if (msg.includes('remote') || msg.includes('monitor')) {
        return "Monitor your appliances remotely with smart features. Check energy usage, receive alerts, and control settings from anywhere.";
    }

    if (msg.includes('filter') || msg.includes('replacement')) {
        return "Replace filters regularly for optimal performance. We carry replacement filters for refrigerators, air purifiers, and other appliances.";
    }

    if (msg.includes('cleaning') || msg.includes('maintenance')) {
        return "Regular cleaning and maintenance extends appliance life. We offer professional cleaning services and maintenance plans.";
    }

    if (msg.includes('noise level') || msg.includes('decibel')) {
        return "Quiet operation is important for many households. Look for models rated below 45 dB for whisper-quiet performance.";
    }

    if (msg.includes('capacity') || msg.includes('size')) {
        return "Choose the right capacity for your household. Consider family size, usage patterns, and available space when selecting appliance sizes.";
    }

    if (msg.includes('dimension') || msg.includes('measurement')) {
        return "Check product dimensions before purchase to ensure proper fit. Measure your space and compare with appliance specifications.";
    }

    if (msg.includes('color') || msg.includes('finish')) {
        return "Appliances come in various colors and finishes. Popular options include stainless steel, black, white, and custom panel-ready models.";
    }

    if (msg.includes('handle') || msg.includes('design')) {
        return "Choose handles and designs that match your kitchen style. Options range from traditional to modern contemporary designs.";
    }

    // Default fallback for unmatched queries
    if (msg.length < 5) {
        return "I'd be happy to help! Could you please provide more details about what you're looking for?";
    }

    if (msg.includes('?')) {
        return "That's a great question! Let me help you find the information you need. Could you be more specific about what you're asking?";
    }

    // If no match, return null to use AI
    return null;
};

// 1. Key Harvester: Scans env vars for ANY number of keys
// Looks for: OPENROUTER_API_KEY, OPENROUTER_API_KEY_2, _3...
// Looks for: ROUTEWAY_API_KEY, ROUTEWAY_API_KEY_2, _3...
const getAllKeys = () => {
    const keys = [];

    Object.keys(process.env).forEach(key => {
        // OpenRouter Keys
        if (key.startsWith('OPENROUTER_API_KEY')) {
            const val = process.env[key];
            if (val && val.trim() !== '') {
                keys.push({
                    provider: 'OpenRouter',
                    url: 'https://openrouter.ai/api/v1',
                    key: val,
                    id: key
                });
            }
        }
        // Routeway Keys
        if (key.startsWith('ROUTEWAY_API_KEY')) {
            const val = process.env[key];
            if (val && val.trim() !== '') {
                keys.push({
                    provider: 'Routeway',
                    url: 'https://api.routeway.ai/v1',
                    key: val,
                    id: key
                });
            }
        }
    });
    return keys;
};

// 2. Failover Chain Builder (The "Logic")
const buildFailoverChain = (model, allKeys) => {
    // 🔍 Rule 1: GPT-OSS-20B (OpenRouter Only)
    if (model.includes('gpt-oss-20b')) {
        console.log(`Routing ${model} -> OpenRouter Chain Only`);
        return allKeys.filter(k => k.provider === 'OpenRouter');
    }

    // 🔍 Rule 2: GPT-OSS-120B (Hybrid: OR -> RW)
    if (model.includes('gpt-oss-120b')) {
        console.log(`Routing ${model} -> Hybrid Chain (OpenRouter First, then Routeway)`);
        const orKeys = allKeys.filter(k => k.provider === 'OpenRouter');
        const rwKeys = allKeys.filter(k => k.provider === 'Routeway');
        return [...orKeys, ...rwKeys];
    }

    // 🔍 Rule 3: Everything Else (Routeway Only)
    // Most models are Routeway exclusives in this setup
    console.log(`Routing ${model} -> Routeway Chain Only`);
    return allKeys.filter(k => k.provider === 'Routeway');
};

// --- API Route ---
app.post('/api/chat', async (req, res) => {
    const { message, model } = req.body;

    if (!message) return res.status(400).json({ error: 'Message required' });

    // Check for local response first
    const localResponse = getLocalResponse(message);
    if (localResponse) {
        console.log('Using local response for:', message.substring(0, 50) + '...');
        return res.json({ reply: localResponse });
    }

    // 1. Get Keys & Build Chain
    const allKeys = getAllKeys();
    const chain = buildFailoverChain(model || 'openai/gpt-oss-20b:free', allKeys);

    if (chain.length === 0) {
        return res.status(500).json({
            error: 'No valid API keys found for this model config.',
            details: 'Check your Vercel Env Vars. You need OPENROUTER_API_KEY_x or ROUTEWAY_API_KEY_x.'
        });
    }

    // 2. Execute Chain (The Loop)
    let lastError = null;

    for (const keyObj of chain) {
        console.log(`🔄 Trying ${keyObj.provider} (KeyID: ${keyObj.id})...`);

        try {
            const response = await fetch(`${keyObj.url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${keyObj.key}`,
                    'Content-Type': 'application/json',
                    // STEALTH MODE: Use standard browser headers
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://google.com' // Generic referer
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are Evora AI. Helpful and concise.' },
                        { role: 'user', content: message }
                    ]
                })
            });

            // Handle API Errors (HTTP level)
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || response.statusText;
                throw new Error(`${response.status} - ${errMsg}`);
            }

            const data = await response.json();

            // Success!
            if (data.choices?.[0]?.message?.content) {
                console.log(`✅ Success with ${keyObj.id}`);
                return res.json({ reply: data.choices[0].message.content });
            }

        } catch (error) {
            console.error(`❌ Failed ${keyObj.id}: ${error.message}`);
            lastError = error;
            // Continue to next key in chain...
            // Add a polite delay to act like a human/avoid WAF triggers
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // 3. All Failed
    console.error('🔥 All keys in chain failed.');
    res.status(500).json({
        error: 'All API providers failed.',
        details: lastError?.message || 'Unknown error',
        note: 'Check Vercel Logs for individual key errors.',
        chainLength: chain.length
    });
});

// Start Server
// Export for Vercel (Serverless)
module.exports = app;

// Local Development Support
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Evora Backend v2 running on port ${port}`);
        console.log(`Loaded ${getAllKeys().length} API Keys total.`);
    });
}
