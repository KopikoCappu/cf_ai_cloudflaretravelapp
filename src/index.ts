// src/index.ts - Main Worker entry point

export { Conversation } from './conversation';

interface Env {
  AI: Ai;
  CONVERSATIONS: DurableObjectNamespace;
}

interface ChatRequest {
  conversationId?: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve the frontend
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML_CONTENT, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // API: Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json() as ChatRequest;
        const { conversationId, message, history } = body;

        if (!message) {
          return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get or create Durable Object
        const id = env.CONVERSATIONS.idFromName(conversationId || 'default');
        const stub = env.CONVERSATIONS.get(id);

        // Save user message
        await stub.fetch('https://fake/messages', {
          method: 'POST',
          body: JSON.stringify({
            role: 'user',
            content: message,
            timestamp: Date.now()
          })
        });

        // Build conversation history for AI
        const messages = [
          {
            role: 'system',
            content: `You are an expert AI travel planner. Help users plan amazing trips with:
- Detailed day-by-day itineraries
- Restaurant and accommodation recommendations  
- Budget estimates
- Local tips and cultural insights
- Best times to visit

Format responses clearly with sections. Be enthusiastic and helpful!`
          },
          ...(history || []).slice(-4), // Last 4 messages for context
          { role: 'user', content: message }
        ];

        // Call Workers AI
        const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages,
          temperature: 0.7,
          max_tokens: 800
        }) as any;

        // Handle response - it could be a string or an object
        let aiMessage: string;
        if (typeof aiResponse === 'string') {
          aiMessage = aiResponse;
        } else if (aiResponse && typeof aiResponse === 'object') {
          aiMessage = aiResponse.response || JSON.stringify(aiResponse);
        } else {
          aiMessage = 'Sorry, I could not generate a response.';
        }

        // Save AI response
        await stub.fetch('https://fake/messages', {
          method: 'POST',
          body: JSON.stringify({
            role: 'assistant',
            content: aiMessage,
            timestamp: Date.now()
          })
        });

        return new Response(JSON.stringify({ response: aiMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error: any) {
        console.error('Chat error:', error);
        return new Response(JSON.stringify({ 
          error: error.message || 'Unknown error' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // API: Get conversation history
    if (url.pathname.startsWith('/api/conversation/')) {
      const conversationId = url.pathname.split('/').pop() || 'default';
      const id = env.CONVERSATIONS.idFromName(conversationId);
      const stub = env.CONVERSATIONS.get(id);
      
      const response = await stub.fetch('https://fake/messages');
      const messages = await response.json();
      
      return new Response(JSON.stringify(messages), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};

// Embedded HTML for simplicity
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Travel Planner</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h1 class="text-3xl font-bold text-blue-600 mb-2">✈️ AI Travel Planner</h1>
      <p class="text-gray-600">Powered by Cloudflare Workers AI + Durable Objects</p>
    </div>

    <div id="chat" class="bg-white rounded-lg shadow-lg p-6 mb-4 h-96 overflow-y-auto">
      <div class="text-gray-400 text-center mt-20">
        Start planning your trip...<br>
        <span class="text-sm">Try: "Plan a 5-day trip to Paris" or "Beach vacation ideas"</span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-4 flex gap-2">
      <input 
        id="input" 
        type="text" 
        placeholder="Where would you like to go?"
        class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        id="send"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>

    <div class="mt-4 text-center text-sm text-gray-500">
      <p>💡 Tip: Be specific about duration, budget, and interests for better recommendations!</p>
    </div>
  </div>

  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const send = document.getElementById('send');
    let conversationId = 'conv_' + Date.now();
    let history = [];

    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Add user message to UI
      addMessage('user', message);
      input.value = '';

      // Add to history
      history.push({ role: 'user', content: message });

      // Show loading
      const loadingId = 'loading_' + Date.now();
      chat.innerHTML += \`<div id="\${loadingId}" class="mb-4 text-gray-400">✈️ Planning your trip...</div>\`;
      chat.scrollTop = chat.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message, history })
        });

        const data = await response.json();
        
        // Remove loading
        document.getElementById(loadingId)?.remove();

        if (data.error) {
          addMessage('assistant', '❌ Error: ' + data.error);
        } else {
          addMessage('assistant', data.response);
          history.push({ role: 'assistant', content: data.response });
        }

      } catch (error) {
        document.getElementById(loadingId)?.remove();
        addMessage('assistant', '❌ Error: ' + error.message);
      }
    }

    function addMessage(role, content) {
      const isUser = role === 'user';
      const div = document.createElement('div');
      div.className = \`mb-4 \${isUser ? 'text-right' : 'text-left'}\`;
      
      // Format content with line breaks
      const formattedContent = content
        .replace(/\\n/g, '<br>')
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      
      div.innerHTML = \`
        <div class="inline-block max-w-2xl text-left \${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-4 shadow">
          \${formattedContent}
        </div>
      \`;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Clear initial message when first interaction
    input.addEventListener('focus', () => {
      if (history.length === 0) chat.innerHTML = '';
    }, { once: true });
  </script>
</body>
</html>`;