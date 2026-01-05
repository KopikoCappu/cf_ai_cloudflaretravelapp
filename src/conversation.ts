// src/conversation.ts - Durable Object for storing conversation state

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class Conversation {
  state: DurableObjectState;
  messages: Message[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;
    // Load messages when initialized
    this.state.blockConcurrencyWhile(async () => {
      this.messages = (await this.state.storage.get<Message[]>('messages')) || [];
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Get all messages
    if (url.pathname === '/messages' && request.method === 'GET') {
      return new Response(JSON.stringify(this.messages), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add a new message
    if (url.pathname === '/messages' && request.method === 'POST') {
      const message: Message = await request.json();
      this.messages.push(message);
      await this.state.storage.put('messages', this.messages);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clear conversation
    if (url.pathname === '/clear' && request.method === 'POST') {
      this.messages = [];
      await this.state.storage.delete('messages');
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}