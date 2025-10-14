# NewsAPI - Market News

Complete guide for setting up NewsAPI to fetch financial news articles.

## Overview

**NewsAPI** provides access to news articles from thousands of sources including major Indian financial publications.

**Purpose:** Fetch market news, financial articles, and stock-related news

**Required:** ✅ Yes (for news feature)

**Free Tier:** 100 requests/day

**Paid Plans:** Start at $449/month for production

**Official Website:** [https://newsapi.org/](https://newsapi.org/)

---

## 🚀 Getting Your API Key

### Step 1: Sign Up

1. Go to [https://newsapi.org/](https://newsapi.org/)
2. Click **"Get API Key"** button
3. Fill in the registration form:
   - **First Name**
   - **Email Address**
   - **Password**
   - **Use Case:** Select "Personal" or "Education"
   - **Country**

### Step 2: Verify Email

1. Check your email inbox
2. Look for email from NewsAPI
3. Click the verification link
4. Your account will be activated

### Step 3: Access Dashboard

1. Log in to [https://newsapi.org/account](https://newsapi.org/account)
2. Your API key will be displayed at the top
3. Dashboard shows:
   - Your API key
   - Usage statistics
   - Request history

### Step 4: Copy API Key

Your API key will look like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Important:**
- Free Developer keys only work on **localhost**
- Production use requires Business plan
- Keep key secure and private

---

## ⚙️ Configuration

### Add to Environment Variables

Edit your `.env` file:

```bash
# NewsAPI - Financial news articles
NEWSAPI_KEY="your_newsapi_key_here"
```

### Verify Configuration

Test your API key:

```bash
# Test API key works
curl "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=YOUR_KEY"
```

Expected response:
```json
{
  "status": "ok",
  "totalResults": 38,
  "articles": [
    {
      "source": {"name": "Economic Times"},
      "title": "Market Update...",
      "description": "...",
      "url": "https://...",
      "publishedAt": "2025-10-14T10:30:00Z"
    }
  ]
}
```

---

## 📰 Usage in EquiAlert

### How We Use NewsAPI

EquiAlert uses NewsAPI to:
1. **Top Headlines** - Latest market news from India
2. **Category Filter** - Filter by market, stocks, economy, crypto
3. **Search News** - Find articles about specific stocks or topics
4. **Source Filter** - Focus on trusted Indian financial sources

### API Integration

Our server integrates NewsAPI in `server/routes.ts`:

```typescript
import axios from 'axios';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const NEWSAPI_BASE = 'https://newsapi.org/v2';

// Get market news
app.get("/api/news", async (req, res) => {
  const { category, page = 1, pageSize = 20 } = req.query;
  
  try {
    const response = await axios.get(`${NEWSAPI_BASE}/top-headlines`, {
      params: {
        country: 'in',
        category: 'business',
        q: category, // market, stocks, economy
        page,
        pageSize,
        apiKey: NEWSAPI_KEY,
      }
    });
    
    res.json({
      articles: response.data.articles,
      totalResults: response.data.totalResults,
      page,
      pageSize,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "NewsAPI key not configured" 
    });
  }
});
```

### Supported Sources

Indian financial sources available:
- **Economic Times** - Leading financial daily
- **Business Standard** - Business news
- **Moneycontrol** - Stock market updates
- **The Hindu Business Line** - Business news
- **LiveMint** - Financial journalism
- **CNBC TV18** - Business news channel
- **Bloomberg Quint** - Financial news
- **Reuters India** - International news

---

## 💰 Pricing & Limits

### Developer Plan (Free)
- **100 requests/day**
- **7-day article archive** (not live)
- **localhost only** (no production use)
- No credit card required
- Perfect for development/testing

### Business Plans

| Plan | Monthly Cost | Requests | Archive | Features |
|------|-------------|----------|---------|----------|
| **Business** | $449 | 250,000 | Live | Commercial use, HTTPS |
| **Corporate** | $1,999 | 1,000,000 | Live | Priority support |
| **Corporate+** | Custom | Unlimited | Live | Dedicated account manager |

### Our Usage
- **News page loads:** ~5 requests/load
- **Auto-refresh:** Every 5 minutes
- **Daily usage:** ~288 requests/day (48 loads * 5 req + refresh)
- **Recommended:** Developer (for testing) → Business (for production)

---

## 🔧 Advanced Configuration

### Available Endpoints

#### 1. Top Headlines
```bash
GET /v2/top-headlines
```

Best for: Latest breaking news

Parameters:
- `country` - Country code (e.g., `in` for India)
- `category` - business, technology, entertainment, etc.
- `sources` - Specific news sources
- `q` - Keywords/phrases to search for
- `pageSize` - Results per page (max 100)
- `page` - Page number

#### 2. Everything
```bash
GET /v2/everything
```

Best for: Searching all articles

Parameters:
- `q` - Keywords (required)
- `sources` - Comma-separated source IDs
- `domains` - Comma-separated domains
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)
- `language` - Language code (e.g., `en`)
- `sortBy` - relevancy, popularity, publishedAt
- `pageSize` - Results per page (max 100)
- `page` - Page number

#### 3. Sources
```bash
GET /v2/sources
```

Best for: Getting available news sources

Parameters:
- `category` - Filter by category
- `language` - Filter by language
- `country` - Filter by country

### Categories

Available categories:
- `business` - Business news (default for EquiAlert)
- `entertainment` - Entertainment news
- `general` - General news
- `health` - Health news
- `science` - Science news
- `sports` - Sports news
- `technology` - Technology news

### Response Format

Typical API response:
```json
{
  "status": "ok",
  "totalResults": 247,
  "articles": [
    {
      "source": {
        "id": "economic-times",
        "name": "Economic Times"
      },
      "author": "John Doe",
      "title": "Sensex Rises 500 Points on Strong Global Cues",
      "description": "Indian stock markets opened higher...",
      "url": "https://economictimes.indiatimes.com/...",
      "urlToImage": "https://img.etimg.com/...",
      "publishedAt": "2025-10-14T09:30:00Z",
      "content": "Full article content here..."
    }
  ]
}
```

---

## 🔍 Search Examples

### Get Indian Business News
```bash
curl "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=YOUR_KEY"
```

### Search for Specific Stock
```bash
curl "https://newsapi.org/v2/everything?q=Reliance+Industries&language=en&apiKey=YOUR_KEY"
```

### Get News from Specific Source
```bash
curl "https://newsapi.org/v2/top-headlines?sources=the-times-of-india&apiKey=YOUR_KEY"
```

### Filter by Date Range
```bash
curl "https://newsapi.org/v2/everything?q=stock+market&from=2025-10-01&to=2025-10-14&apiKey=YOUR_KEY"
```

### Sort by Popularity
```bash
curl "https://newsapi.org/v2/everything?q=NIFTY&sortBy=popularity&apiKey=YOUR_KEY"
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# ✅ Correct - use .env file
NEWSAPI_KEY="your_key_here"

# ❌ Wrong - never hardcode in source
const API_KEY = "a1b2c3d4e5f6...";
```

### 2. .gitignore
Ensure `.env` is ignored:
```bash
# .gitignore
.env
.env.local
.env.production
```

### 3. Server-Side Only
- Never expose API key in client code
- Always make requests from server
- Use proxy endpoints

### 4. Rate Limiting
Implement server-side rate limiting:
```typescript
// Limit news requests per user
const newsRateLimit = new Map<string, number>();

app.get("/api/news", async (req, res) => {
  const userId = req.session.userId;
  const count = newsRateLimit.get(userId) || 0;
  
  if (count > 10) {
    return res.status(429).json({ 
      error: "Too many requests" 
    });
  }
  
  newsRateLimit.set(userId, count + 1);
  // ... fetch news
});
```

---

## 🐛 Troubleshooting

### "API key not configured"

**Problem:** Server can't find NewsAPI key

**Solutions:**
```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify key is set
grep NEWSAPI_KEY .env

# 3. Restart server
npm run dev

# 4. Test key
node -e "require('dotenv').config(); console.log(process.env.NEWSAPI_KEY)"
```

### "Invalid API key"

**Problem:** API key is incorrect

**Solutions:**
1. Log in to [NewsAPI Account](https://newsapi.org/account)
2. Copy API key again (carefully)
3. Check for extra spaces or quotes
4. Verify email is verified
5. Try regenerating key

### "This API Key is invalid or has been revoked"

**Problem:** Key status issue

**Solutions:**
1. Check email verification status
2. Ensure account is active
3. Regenerate API key
4. Contact NewsAPI support

### Rate Limit Exceeded

**Problem:** Hit daily request limit

**Solutions:**
```bash
# Check usage on dashboard
# https://newsapi.org/account

# Current limits:
# Developer: 100 requests/day
# Resets: Daily at midnight UTC

# Options:
# 1. Wait for reset
# 2. Implement caching
# 3. Reduce refresh frequency
# 4. Upgrade to Business plan
```

### "Developer accounts are restricted to localhost"

**Problem:** Using Developer key in production

**Solutions:**
1. For production, upgrade to Business plan ($449/month)
2. For development, access via `http://localhost:5000`
3. For testing with external URL, upgrade plan

### News Not Loading

**Problem:** News feed empty or errors

**Solutions:**
```bash
# Test API directly
curl "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=YOUR_KEY"

# Check server logs
npm run dev

# Verify network connectivity
ping newsapi.org

# Check for CORS issues (should be server-side)
```

---

## 📊 Monitoring & Analytics

### Usage Dashboard

View usage at [https://newsapi.org/account](https://newsapi.org/account):
- Daily request count
- Remaining requests
- Request history (last 24h)
- Most requested endpoints

### Best Practices

1. **Cache Aggressively**
```typescript
// Cache news for 5 minutes
const newsCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes
};

app.get("/api/news", async (req, res) => {
  const now = Date.now();
  
  if (newsCache.data && (now - newsCache.timestamp) < newsCache.ttl) {
    return res.json(newsCache.data);
  }
  
  // Fetch fresh data
  const response = await axios.get(/* ... */);
  newsCache.data = response.data;
  newsCache.timestamp = now;
  
  res.json(newsCache.data);
});
```

2. **Batch Requests**
- Request multiple articles per call
- Use `pageSize=100` for max efficiency
- Reduce API calls with pagination

3. **Strategic Refresh**
- Refresh only when user visits news page
- Use longer cache times during off-peak hours
- Implement manual refresh button

---

## 📚 Related Documentation

- **[API Endpoints](endpoints.md#news-endpoints)** - News API endpoints in EquiAlert
- **[Setup Guide](../guides/setup.md)** - Initial configuration
- **[Design Guidelines](../guides/design_guidelines.md)** - News UI components

## 🔗 External Resources

- **[NewsAPI Documentation](https://newsapi.org/docs)** - Official API docs
- **[Sources List](https://newsapi.org/sources)** - Available news sources
- **[Pricing](https://newsapi.org/pricing)** - Detailed pricing
- **[Support](https://newsapi.org/contact)** - Contact support
- **[Status Page](https://status.newsapi.org/)** - API status

---

**Last Updated:** October 2025
