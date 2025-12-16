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
app.use(express.json());

// --- 🧠 Smart Routing System ---

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
