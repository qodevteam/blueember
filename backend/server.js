require('dotenv').config({ path: './api.env' });
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter API Key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- Chatbot Route (OpenRouter) ---
app.post('/api/chat', async (req, res) => {
    const { message, model, enableReasoning } = req.body;
    const selectedModel = model || 'openai/gpt-oss-20b:free'; // Default to GPT-OSS

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
        return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }

    try {
        const requestBody = {
            model: selectedModel,
            messages: [
                { role: 'system', content: 'You are Evora AI, a helpful assistant for Evora Electronics. Keep answers concise.' },
                { role: 'user', content: message }
            ]
        };

        // Add reasoning for GPT-OSS model
        if (enableReasoning) {
            requestBody.reasoning = { enabled: true };
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://blueember.com',
                'X-Title': 'Blue Ember Chatbot'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'OpenRouter API error');
        }

        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid response from OpenRouter');
        }

        const botReply = data.choices[0].message.content;
        res.json({ reply: botReply });

    } catch (error) {
        console.error('AI Error:', error.message);
        res.status(500).json({ error: error.message || 'Error processing request' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
