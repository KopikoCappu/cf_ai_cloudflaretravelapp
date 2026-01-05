Optional Assignment: See instructions below for Cloudflare AI app assignment. SUBMIT GitHub repo URL for the AI project here. (Please do not submit irrelevant repositories.)
Optional Assignment Instructions: We plan to fast track review of candidates who complete an assignment to build a type of __AI-powered application__ on Cloudflare. An AI-powered application should include the following components:
* LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice
* Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
* User input via chat or voice (recommend using Pages or Realtime)
* Memory or state
Find additional documentation __here__.

just help me flesh out a basic working model for this application

I'll help you build an AI-powered application on Cloudflare that meets all the requirements. Here's a strategic approach:
Recommended Project: AI-Powered Personal Assistant
Why this works well:

Demonstrates all required components clearly
Shows real-world application understanding
Highlights Cloudflare's infrastructure capabilities

Architecture Breakdown
1. LLM Component

Use Llama 3.3 70B via Workers AI for intelligent responses
Alternative: Claude via Anthropic API for more sophisticated reasoning
Implement streaming responses for better UX

2. Workflow/Coordination

Cloudflare Workflows for multi-step operations (data retrieval → LLM processing → response)
Durable Objects for managing conversation state and concurrent users
Workers for API endpoints and request handling

3. User Interface

Cloudflare Pages for the frontend (React-based chat interface)
WebSocket support for real-time streaming
Clean, professional UI with conversation history

4. Memory/State

Durable Objects for conversation persistence
KV or D1 for user preferences and chat history
Session management with context window handling