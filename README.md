# AI Travel Planner

An intelligent travel planning assistant built on Cloudflare's edge platform.

## 🚀 Features

- 🤖 **AI-Powered Planning**: Uses Llama 3.3 70B via Cloudflare Workers AI
- 💬 **Conversational Interface**: Multi-turn chat with context awareness
- 💾 **Persistent Memory**: Durable Objects store conversation history
- ⚡ **Edge Computing**: Fast global response times
- 🎨 **Clean UI**: Simple, responsive chat interface

## 🏗️ Architecture

- **Frontend**: HTML + Tailwind CSS + Vanilla JavaScript
- **Backend**: Cloudflare Workers
- **LLM**: Workers AI (Llama 3.3 70B Instruct)
- **State Management**: Durable Objects
- **Deployment**: Cloudflare Workers Platform

## 📋 Components

### Required Components (All Implemented ✅)

1. **LLM**: Llama 3.3 70B via Workers AI
2. **Workflow/Coordination**: Multi-step chat processing with context
3. **User Input**: Chat interface
4. **Memory/State**: Durable Objects for conversation persistence

## 🛠️ Setup

### Prerequisites

- Node.js v18 or later
- Cloudflare account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/ai-travel-planner.git
cd ai-travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. Login to Cloudflare:
```bash
npx wrangler login
```

4. Run locally:
```bash
npm run dev
```

5. Deploy to Cloudflare:
```bash
npx wrangler deploy
```

## 💻 Local Development
```bash
npm run dev
# Visit http://localhost:8787
```

## 🌐 Deployment
```bash
npx wrangler deploy
```

Your app will be live at: `https://ai-travel-planner.YOUR_SUBDOMAIN.workers.dev`

## 🎯 Usage Examples

Try asking:
- "Plan a 5-day trip to Paris with a $2000 budget"
- "I want to visit Tokyo for a week, focusing on culture and food"
- "Beach vacation ideas for families"
- "Adventure travel recommendations in South America"

## 🏗️ Technical Details

### Durable Objects
Stores conversation state persistently across requests:
- Message history
- Conversation context
- User preferences

### Workers AI Integration
Uses Llama 3.3 70B Instruct model with:
- Temperature: 0.7 (balanced creativity)
- Max tokens: 800 (detailed responses)
- Context window: Last 4 messages

### API Endpoints

- `POST /api/chat` - Send message and get AI response
- `GET /api/conversation/:id` - Retrieve conversation history

## 📝 License

MIT

## 👤 Author

Minh Tran](https://github.com/KopikoCappu)

## 🙏 Acknowledgments

Built for Cloudflare AI Application Assignment