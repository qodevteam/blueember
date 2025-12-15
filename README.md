# Blue Ember - Electronics E-Commerce with AI Chatbot

Premium electronics e-commerce website featuring an intelligent AI-powered chatbot with multiple free AI models.

## 🚀 Features

- **Modern E-Commerce UI** - Clean, responsive design
- **Dark Mode** - Full site dark mode support
- **AI Chatbot** - Intelligent customer support with 4 free AI models:
  - GPT-OSS 20B (with reasoning)
  - Mistral Devstral
  - Meta Llama 3.2 3B
  - Google Gemma 3n 2B
- **Markdown Support** - Formatted AI responses with code blocks
- **Product Catalog** - Samsung, LG, and more brands

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Font Awesome icons
- Marked.js for markdown rendering

**Backend:**
- Node.js + Express
- OpenRouter API (multi-model AI)
- Vercel serverless deployment

## 📦 Local Development

### Prerequisites
- Node.js 14+ installed
- OpenRouter API key (free at https://openrouter.ai/keys)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/blue-ember.git
cd blue-ember
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure API key**
Create `backend/api.env`:
```env
OPENROUTER_API_KEY=your_key_here
```

4. **Start backend**
```bash
npm start
```
Backend runs at: http://localhost:3000

5. **Start frontend**
```bash
cd ..
npm start
```
Frontend runs at: http://localhost:3001

6. **Open in browser**
Visit: http://localhost:3001

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions:
- Backend: Vercel (serverless)
- Frontend: GitHub Pages (static)

Quick deploy:
```bash
# Backend
cd backend
vercel

# Frontend  
git push origin main
# Enable GitHub Pages in repo settings
```

## 🤖 Chatbot Models

| Model | Provider | Speed | Best For |
|-------|----------|-------|----------|
| GPT-OSS 20B | OpenAI | Medium | Complex reasoning |
| Mistral Devstral | Mistral | Fast | Code & dev tasks |
| Llama 3.2 3B | Meta | Very Fast | General chat |
| Gemma 3n 2B | Google | Ultra Fast | Quick responses |

All models are **100% free** via OpenRouter.

## 📁 Project Structure

```
blue-ember/
├── backend/
│   ├── server.js          # Express API server
│   ├── vercel.json        # Vercel config
│   ├── package.json
│   └── api.env            # API keys (local only)
│
├── js/
│   ├── chatbot.js         # Chatbot logic
│   └── app.js             # Main app logic
│
├── chatbot.css            # Chatbot styles
├── index.html             # Homepage
├── Contact.html           # Contact page
└── README.md
```

## 🔧 Configuration

### API URL (chatbot.js)
The chatbot automatically detects localhost vs production:
```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/chat'
    : 'https://your-backend.vercel.app/api/chat';
```

### Supported Models
Add/remove models in `index.html`:
```html
<option value="model-name:free">Model Display Name</option>
```

## 🎨 Customization

### Change Colors
Edit CSS variables in `universal.css`:
```css
:root {
    --primary-color: #0099ff;
    --secondary-color: #333;
}
```

### Update Chatbot System Prompt
Edit `backend/server.js`:
```javascript
{ 
  role: 'system', 
  content: 'You are Evora AI, a helpful assistant...' 
}
```

## 🐛 Troubleshooting

**Chatbot not responding?**
- Check backend is running (`npm start` in `/backend`)
- Verify API key in `api.env`
- Check browser console for errors

**CORS errors?**
- Ensure backend CORS is enabled (already configured)
- Check API URL in `chatbot.js`

**Models not loading?**
- Verify OpenRouter API key is valid
- Check model names match OpenRouter's list

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Visit OpenRouter docs: https://openrouter.ai/docs

---

**Built with ❤️ by [Your Name]**
