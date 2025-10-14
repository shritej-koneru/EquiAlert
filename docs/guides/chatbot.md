# Chatbot Feature Guide

Learn how to use and customize the AI-powered chatbot in EquiAlert.

## Overview

The EquiAlert chatbot uses Groq AI's Llama 3.3 70B model to provide:
- Real-time market insights
- Stock analysis and recommendations
- Technical and fundamental analysis
- Market trend explanations
- Educational content about investing

---

## 🤖 Features

### Intelligent Responses
- Context-aware conversations
- Understands stock market terminology
- Provides data-driven insights
- Explains complex concepts simply

### Real-time Data Integration
- Accesses current stock prices
- References latest market news
- Tracks your watchlist
- Considers market conditions

### Multi-turn Conversations
- Remembers conversation context
- Follows up on previous questions
- Clarifies misunderstandings
- Provides detailed explanations

---

## 💬 Using the Chatbot

### Opening the Chat

1. Click the chatbot button (bottom-right corner)
2. Chat panel slides in from left
3. Start typing your question
4. Press Enter or click Send

### Example Questions

#### Stock Information
```
"What's happening with Reliance stock today?"
"Tell me about TCS performance"
"Why is HDFC Bank stock falling?"
"Compare Infosys and Wipro"
```

#### Market Analysis
```
"What's the current market sentiment?"
"Should I invest in tech stocks now?"
"What are the top gainers today?"
"Explain the recent NIFTY movement"
```

#### Technical Analysis
```
"What's the RSI for Reliance?"
"Is TCS overbought or oversold?"
"Identify support levels for HDFC Bank"
"What's the 50-day moving average for Infosys?"
```

#### Educational
```
"What is a PE ratio?"
"Explain market capitalization"
"How does dividend yield work?"
"What are blue chip stocks?"
```

#### Portfolio Help
```
"Review my watchlist"
"Suggest stocks for long-term investment"
"Should I buy or sell Reliance?"
"What's a good diversification strategy?"
```

---

## 🔧 Configuration

### Setting Up Groq AI

See [API Keys Guide](../api/api-keys.md#3-groq-ai-chatbot) for detailed setup.

Quick setup:
```bash
# Get API key from https://console.groq.com/keys
GROQ_API_KEY="gsk_your_key_here"
```

### Model Configuration

Located in `server/routes.ts`:

```typescript
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const model = "llama-3.3-70b-versatile"; // Best quality
// Alternative: "llama-3.1-8b-instant" for faster responses
```

### System Prompt

The chatbot's personality and knowledge base:

```typescript
const systemPrompt = `You are a helpful AI assistant specializing in Indian stock markets (NSE/BSE).
You have expertise in:
- Technical and fundamental analysis
- Market trends and news
- Investment strategies
- Risk management

Provide accurate, data-driven advice while being:
- Professional yet friendly
- Clear and concise
- Educational and helpful
- Risk-aware (always mention risks)

Current date: ${new Date().toLocaleDateString()}`;
```

Customize in `server/routes.ts` to change behavior.

---

## 💻 API Integration

### Send Message

```bash
curl -X POST "http://localhost:5000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Reliance stock price?",
    "context": []
  }'
```

Response:
```json
{
  "response": "Reliance Industries (RELIANCE:NSE) is currently trading at ₹2,456.75, up 1.88% today. The stock has shown strong momentum driven by robust retail and digital business performance.",
  "timestamp": "2025-10-14T10:30:00Z"
}
```

### With Conversation Context

```bash
curl -X POST "http://localhost:5000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should I buy it?",
    "context": [
      {"role": "user", "content": "What is Reliance stock price?"},
      {"role": "assistant", "content": "Reliance is at ₹2,456.75..."}
    ]
  }'
```

See [API Endpoints](../api/endpoints.md#chatbot-endpoints) for complete reference.

---

## 🎨 UI Customization

### Chatbot Button

Located in `client/src/components/ChatbotButton.tsx`

```tsx
<ChatbotButton 
  position="bottom-right"  // or "bottom-left"
  size="md"               // sm, md, lg
  color="primary"         // primary, secondary
  onClick={handleOpen}
/>
```

### Chat Panel

Located in `client/src/components/ChatbotPanel.tsx`

```tsx
<ChatbotPanel
  isOpen={isOpen}
  onClose={handleClose}
  initialMessage="How can I help you today?"
  placeholder="Ask about stocks, markets..."
/>
```

### Styling

Customize colors in `tailwind.config.ts`:

```typescript
colors: {
  chat: {
    user: '#2563eb',      // User message background
    assistant: '#1f2937', // Assistant message background
    text: '#f9fafb',      // Message text color
  }
}
```

---

## 🚀 Advanced Features

### Custom Actions

Add action buttons to responses:

```typescript
// server/routes.ts
const enhanceResponse = (response: string, stocks: string[]) => {
  return {
    text: response,
    actions: stocks.map(symbol => ({
      type: 'add_to_watchlist',
      label: `Add ${symbol}`,
      data: { symbol }
    }))
  };
};
```

### Stock Mentions Detection

Automatically detect stock mentions:

```typescript
const detectStocks = (message: string): string[] => {
  const stockPattern = /\b([A-Z]{2,10})\b/g;
  return [...message.matchAll(stockPattern)]
    .map(match => match[1])
    .filter(symbol => isValidStock(symbol));
};
```

### Context Enrichment

Add market data to context:

```typescript
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;
  
  // Detect stocks mentioned
  const stocks = detectStocks(message);
  
  // Fetch current prices
  const prices = await Promise.all(
    stocks.map(symbol => getStockPrice(symbol))
  );
  
  // Add to context
  const enrichedContext = [
    ...context,
    {
      role: "system",
      content: `Current prices: ${JSON.stringify(prices)}`
    },
    { role: "user", content: message }
  ];
  
  // Get response
  const completion = await groq.chat.completions.create({
    messages: enrichedContext,
    model: "llama-3.3-70b-versatile",
  });
  
  res.json({ response: completion.choices[0].message.content });
});
```

### Suggested Questions

Show suggested questions:

```typescript
const suggestedQuestions = [
  "What's the NIFTY 50 level today?",
  "Show me top gainers",
  "Analyze my watchlist",
  "What's moving the markets?",
  "Explain today's market trend"
];
```

---

## 📊 Usage Limits

### Groq AI Free Tier
- **14,400 requests per day**
- **30 requests per minute**
- **32K token context window**
- **Fast inference** (~100 tokens/sec)

### Rate Limiting

Built-in rate limiting (optional):

```typescript
// server/routes.ts
const chatRateLimiter = new Map<string, number[]>();

const checkChatLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = chatRateLimiter.get(userId) || [];
  
  // Filter requests in last minute
  const recentRequests = userRequests.filter(
    time => now - time < 60000
  );
  
  if (recentRequests.length >= 10) {
    return false; // Limit exceeded
  }
  
  chatRateLimiter.set(userId, [...recentRequests, now]);
  return true;
};
```

---

## 🔒 Best Practices

### 1. Privacy & Security
- Don't log sensitive conversations
- Sanitize user inputs
- Rate limit to prevent abuse
- Don't share user data with AI

### 2. Prompt Engineering
- Be specific in system prompts
- Provide examples of good responses
- Set clear boundaries
- Include disclaimers about financial advice

### 3. Error Handling
```typescript
try {
  const completion = await groq.chat.completions.create({...});
  res.json({ response: completion.choices[0].message.content });
} catch (error) {
  if (error.status === 429) {
    res.status(429).json({ 
      error: "Rate limit exceeded. Please try again in a moment." 
    });
  } else {
    res.status(500).json({ 
      error: "I'm having trouble connecting. Please try again." 
    });
  }
}
```

### 4. Context Management
- Limit context to last 10 messages
- Clear context periodically
- Include only relevant information

### 5. Response Quality
- Add disclaimers for financial advice
- Cite sources when possible
- Encourage user research
- Mention risks clearly

---

## 🐛 Troubleshooting

### Chatbot Not Responding

**Problem:** Messages sent but no response

**Solutions:**
1. Check Groq API key in `.env`
2. Verify key is active in [Groq Console](https://console.groq.com/keys)
3. Check server logs for errors
4. Test API directly:
   ```bash
   curl -X POST "http://localhost:5000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

### Rate Limit Errors

**Problem:** "Rate limit exceeded" message

**Solutions:**
1. Check current usage in Groq Console
2. Wait 1 minute before retrying
3. Implement client-side rate limiting
4. Consider upgrading plan if needed

### Slow Responses

**Problem:** Takes too long to respond

**Solutions:**
1. Use `llama-3.1-8b-instant` instead of 70B model
2. Reduce context window size
3. Enable response streaming
4. Check network latency

### Generic/Unhelpful Responses

**Problem:** Responses lack detail or relevance

**Solutions:**
1. Improve system prompt with examples
2. Add market data to context
3. Be more specific in questions
4. Include user's watchlist in context

---

## 💡 Example Implementations

### Streaming Responses

For real-time response display:

```typescript
app.post("/api/chat/stream", async (req, res) => {
  const { message, context } = req.body;
  
  const stream = await groq.chat.completions.create({
    messages: [...context, { role: "user", content: message }],
    model: "llama-3.3-70b-versatile",
    stream: true,
  });
  
  res.setHeader('Content-Type', 'text/event-stream');
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }
  
  res.end();
});
```

### Voice Input

Add speech-to-text:

```typescript
// client/src/components/ChatbotPanel.tsx
const handleVoiceInput = () => {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setMessage(transcript);
    sendMessage(transcript);
  };
  recognition.start();
};
```

### Quick Actions

Pre-defined action buttons:

```tsx
const quickActions = [
  { label: "📊 Market Summary", query: "Give me today's market summary" },
  { label: "📈 Top Gainers", query: "Show me top gainers today" },
  { label: "📉 Top Losers", query: "Show me top losers today" },
  { label: "💼 My Watchlist", query: "Analyze my watchlist" },
];
```

---

## 📚 Related Documentation

- [API Endpoints](../api/endpoints.md) - Chat API reference
- [API Keys Guide](../api/api-keys.md) - Groq AI setup
- [Setup Guide](setup.md) - Initial configuration

---

**Last Updated:** October 2025
