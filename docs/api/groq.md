# Groq AI - Chatbot

Complete guide for setting up Groq AI to power the intelligent chatbot.

## Overview

**Groq AI** provides ultra-fast inference for large language models, powering EquiAlert's AI chatbot with market insights.

**Purpose:** AI-powered chatbot for market analysis and stock insights

**Required:** ⚠️ Optional (chatbot feature only)

**Free Tier:** 14,400 requests/day (very generous)

**Cost:** Currently free during preview period

**Official Website:** [https://console.groq.com/](https://console.groq.com/)

---

## 🚀 Getting Your API Key

### Step 1: Sign Up

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Click **"Sign In"** or **"Start Building"** button
3. Sign up using:
   - **Google account** (recommended)
   - **GitHub account**
   - **Email and password**

### Step 2: Access API Keys

1. After logging in, you'll land on the Groq Console
2. Navigate to [API Keys](https://console.groq.com/keys) section
3. Or click your profile → "API Keys"

### Step 3: Create API Key

1. Click **"Create API Key"** button
2. Give your key a descriptive name:
   - Examples: "EquiAlert Production", "Dev Environment", "Testing"
3. Click **"Submit"** or **"Create"**

### Step 4: Copy and Save API Key

Your API key will look like:
```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Critical:**
- The key is shown **only once**
- Copy it immediately
- Save it securely
- You won't be able to see it again
- If lost, you must create a new key

---

## ⚙️ Configuration

### Add to Environment Variables

Edit your `.env` file:

```bash
# Groq AI - Chatbot powered by Llama 3.3 70B
GROQ_API_KEY="gsk_your_groq_api_key_here"
```

### Verify Configuration

Test your API key:

```bash
# Test with curl
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_GROQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Expected response:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      }
    }
  ]
}
```

---

## 🤖 Available Models

### Llama 3.3 70B Versatile (Recommended)

**Model ID:** `llama-3.3-70b-versatile`

**Best for:**
- Complex reasoning
- Market analysis
- Technical explanations
- Multi-turn conversations

**Specs:**
- **Context window:** 128K tokens
- **Speed:** ~100 tokens/second
- **Quality:** Highest available

**Usage:**
```typescript
model: "llama-3.3-70b-versatile"
```

### Llama 3.1 8B Instant

**Model ID:** `llama-3.1-8b-instant`

**Best for:**
- Quick responses
- Simple queries
- High-volume requests
- Lower resource usage

**Specs:**
- **Context window:** 128K tokens
- **Speed:** ~800 tokens/second (8x faster)
- **Quality:** Good for simple tasks

**Usage:**
```typescript
model: "llama-3.1-8b-instant"
```

### Mixtral 8x7B

**Model ID:** `mixtral-8x7b-32768`

**Best for:**
- Alternative to Llama
- Multilingual support
- Balanced performance

**Specs:**
- **Context window:** 32K tokens
- **Speed:** ~450 tokens/second
- **Quality:** Good overall

---

## 💬 Usage in EquiAlert

### How We Use Groq AI

EquiAlert's chatbot uses Groq AI for:
1. **Market insights** - Explain market movements
2. **Stock analysis** - Analyze specific stocks
3. **Educational content** - Teach investment concepts
4. **Portfolio advice** - Review watchlists
5. **News interpretation** - Explain market news

### API Integration

Our server integrates Groq AI in `server/routes.ts`:

```typescript
import OpenAI from "openai";

// Initialize Groq client (OpenAI-compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, context = [] } = req.body;
  
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant specializing in Indian stock markets.
          Provide accurate, data-driven advice about NSE and BSE stocks.`
        },
        ...context,
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    res.json({
      response: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Groq AI error:", error);
    res.status(500).json({ 
      error: "Chatbot unavailable" 
    });
  }
});
```

### System Prompt

Customize chatbot personality:

```typescript
const systemPrompt = `You are an expert financial advisor specializing in Indian stock markets (NSE/BSE).

Your expertise includes:
- Technical and fundamental analysis
- Market trends and patterns
- Risk management strategies
- Investment recommendations

Your communication style:
- Professional yet approachable
- Data-driven and factual
- Clear and concise
- Educational and helpful

Important guidelines:
- Always mention investment risks
- Don't guarantee returns
- Encourage user research
- Cite data sources when possible
- Current date: ${new Date().toLocaleDateString('en-IN')}`;
```

---

## 💰 Pricing & Limits

### Free Tier (Current)

Groq AI is currently **FREE** during preview:
- **14,400 requests per day**
- **30 requests per minute**
- **Up to 128K context tokens**
- **All models available**
- No credit card required

### Rate Limits

| Metric | Limit |
|--------|-------|
| **Requests/day** | 14,400 |
| **Requests/minute** | 30 |
| **Requests/second** | 2 |
| **Context window** | 128K tokens |
| **Max tokens/request** | 32K tokens |

### Our Usage

Typical usage patterns:
- **Average messages/day:** ~100-200
- **Tokens per message:** ~500-1000
- **Daily token usage:** ~50K-200K tokens
- **Well within limits:** ✅

---

## 🔧 Advanced Configuration

### Request Parameters

Available parameters:

```typescript
{
  model: "llama-3.3-70b-versatile",    // Model to use
  messages: [...],                      // Conversation history
  temperature: 0.7,                     // Creativity (0-2)
  max_tokens: 1000,                     // Response length limit
  top_p: 1.0,                          // Nucleus sampling
  stop: ["\n\n"],                      // Stop sequences
  stream: false,                        // Enable streaming
  presence_penalty: 0.0,                // Penalize repetition
  frequency_penalty: 0.0,               // Penalize frequency
}
```

### Temperature Settings

| Temperature | Use Case | Behavior |
|-------------|----------|----------|
| **0.0-0.3** | Factual data, analysis | Deterministic, consistent |
| **0.4-0.7** | General chat, advice | Balanced creativity |
| **0.8-1.5** | Creative writing | More diverse responses |
| **1.6-2.0** | Experimental | Very creative/random |

**Recommended for EquiAlert:** `0.7`

### Streaming Responses

For real-time display:

```typescript
app.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;
  
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: message }],
    stream: true,
  });
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }
  
  res.end();
});
```

### Context Management

Limit context for better performance:

```typescript
// Keep only last 10 messages
const limitContext = (context: Message[], limit = 10) => {
  return context.slice(-limit);
};

// Calculate token usage
const estimateTokens = (text: string) => {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
};

// Smart context trimming
const trimContext = (context: Message[], maxTokens = 4000) => {
  let totalTokens = 0;
  const trimmed = [];
  
  for (let i = context.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(context[i].content);
    if (totalTokens + tokens > maxTokens) break;
    trimmed.unshift(context[i]);
    totalTokens += tokens;
  }
  
  return trimmed;
};
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# ✅ Correct
GROQ_API_KEY="gsk_..."

# ❌ Wrong
const API_KEY = "gsk_...";
```

### 2. Server-Side Only
- Never expose API key in client
- All requests through backend
- Use proxy endpoints

### 3. Input Sanitization
```typescript
const sanitizeInput = (message: string) => {
  // Remove potential injection attempts
  return message
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 2000); // Limit length
};
```

### 4. Rate Limiting
```typescript
const chatLimits = new Map<string, number[]>();

const checkChatLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = chatLimits.get(userId) || [];
  
  // Keep only requests from last minute
  const recent = userRequests.filter(time => now - time < 60000);
  
  if (recent.length >= 10) {
    return false; // Limit: 10 messages per minute
  }
  
  chatLimits.set(userId, [...recent, now]);
  return true;
};
```

---

## 🐛 Troubleshooting

### "API key not configured"

**Problem:** Missing or invalid Groq API key

**Solutions:**
```bash
# Check .env file
cat .env | grep GROQ_API_KEY

# Verify key starts with "gsk_"
# If not, regenerate key at console.groq.com

# Restart server
npm run dev
```

### Rate Limit Exceeded

**Problem:** Too many requests

**Solutions:**
```bash
# Current limits:
# - 30 requests/minute
# - 14,400 requests/day

# Check your usage:
# Visit https://console.groq.com/usage

# Implement backoff:
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
  const response = await groq.chat.completions.create({...});
} catch (error) {
  if (error.status === 429) {
    await delay(2000); // Wait 2 seconds
    // Retry request
  }
}
```

### Slow Responses

**Problem:** Chatbot takes too long

**Solutions:**
1. **Switch to faster model:**
   ```typescript
   model: "llama-3.1-8b-instant" // 8x faster
   ```

2. **Reduce max_tokens:**
   ```typescript
   max_tokens: 500 // Shorter responses
   ```

3. **Enable streaming:**
   ```typescript
   stream: true // Show response as it generates
   ```

4. **Check network:**
   ```bash
   ping api.groq.com
   curl -w "@curl-format.txt" https://api.groq.com
   ```

### Context Too Long

**Problem:** "Maximum context length exceeded"

**Solutions:**
```typescript
// Trim conversation history
const MAX_CONTEXT_TOKENS = 4000;
const trimmedContext = trimContext(context, MAX_CONTEXT_TOKENS);

// Or use sliding window (keep recent messages)
const recentContext = context.slice(-10);
```

### Generic Responses

**Problem:** Chatbot gives vague answers

**Solutions:**
1. **Improve system prompt:**
   - Add more context
   - Provide examples
   - Be specific about requirements

2. **Include market data:**
   ```typescript
   const stockData = await getStockPrice(symbol);
   const prompt = `Current ${symbol} price: ₹${stockData.price}. ${userMessage}`;
   ```

3. **Use higher temperature:**
   ```typescript
   temperature: 0.8 // More creative responses
   ```

---

## 📊 Monitoring & Analytics

### Usage Dashboard

View usage at [Groq Console](https://console.groq.com/usage):
- Request count (hourly/daily)
- Token usage
- Error rates
- Response times
- Model usage breakdown

### Logging Best Practices

```typescript
// Log important metrics
app.post("/api/chat", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const completion = await groq.chat.completions.create({...});
    
    const duration = Date.now() - startTime;
    console.log(`✅ Chat response: ${duration}ms`);
    
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error(`❌ Chat error: ${error.message}`);
    res.status(500).json({ error: "Chatbot unavailable" });
  }
});
```

---

## 📚 Related Documentation

- **[Chatbot Guide](../guides/chatbot.md)** - Complete chatbot feature documentation
- **[API Endpoints](endpoints.md#chatbot-endpoints)** - Chat API endpoints
- **[Setup Guide](../guides/setup.md)** - Initial configuration

## 🔗 External Resources

- **[Groq Documentation](https://console.groq.com/docs)** - Official API docs
- **[Model Comparison](https://console.groq.com/docs/models)** - Model specifications
- **[API Reference](https://console.groq.com/docs/api-reference)** - Complete API reference
- **[Rate Limits](https://console.groq.com/docs/rate-limits)** - Detailed rate limit info
- **[Community](https://groq.com/community/)** - Groq community forum

---

**Last Updated:** October 2025
