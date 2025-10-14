# SerpAPI - Stock Price Data

Complete guide for setting up SerpAPI to fetch real-time stock prices from Google Finance.

## Overview

**SerpAPI** provides access to Google Finance data for real-time stock prices across global markets including NSE, BSE, and other Indian exchanges.

**Purpose:** Fetch real-time stock prices, market data, and trends

**Required:** ✅ Yes (core functionality)

**Free Tier:** 100 searches/month

**Paid Plans:** Start at $50/month for 5,000 searches

**Official Website:** [https://serpapi.com/](https://serpapi.com/)

---

## 🚀 Getting Your API Key

### Step 1: Sign Up

1. Go to [https://serpapi.com/](https://serpapi.com/)
2. Click **"Sign Up"** or **"Get Started Free"** button
3. You can sign up using:
   - Email and password
   - Google account
   - GitHub account

### Step 2: Verify Email

1. Check your email inbox
2. Click the verification link sent by SerpAPI
3. Complete email verification

### Step 3: Access Dashboard

1. Log in to your account
2. Navigate to [Dashboard](https://serpapi.com/dashboard)
3. You'll see your API key displayed prominently

### Step 4: Copy API Key

Your API key will look like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Important:** 
- Keep this key secure
- Don't share it publicly
- Don't commit it to version control

---

## ⚙️ Configuration

### Add to Environment Variables

Edit your `.env` file:

```bash
# SerpAPI - Real-time stock prices from Google Finance
SERPAPI_KEY="your_serpapi_key_here"
```

### Verify Configuration

Test your API key:

```bash
# Test API key works
curl "https://serpapi.com/search.json?engine=google_finance&q=RELIANCE:NSE&api_key=YOUR_KEY"
```

Expected response:
```json
{
  "search_metadata": {
    "status": "Success"
  },
  "summary": {
    "price": "2456.75",
    "currency": "INR"
  }
}
```

---

## 📊 Usage in EquiAlert

### How We Use SerpAPI

EquiAlert uses SerpAPI to:
1. **Search stocks** - Find stocks by name or symbol
2. **Get real-time prices** - Fetch current stock prices with change data
3. **Market trends** - Get overall market sentiment and trends

### API Endpoints

Our server integrates SerpAPI in `server/serpapi.ts`:

```typescript
import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_BASE = 'https://serpapi.com/search.json';

// Search for stocks
export async function searchStocks(query: string) {
  const response = await axios.get(SERPAPI_BASE, {
    params: {
      engine: 'google_finance',
      q: query,
      api_key: SERPAPI_KEY,
    }
  });
  return response.data;
}

// Get stock price
export async function getStockPrice(symbol: string) {
  const response = await axios.get(SERPAPI_BASE, {
    params: {
      engine: 'google_finance',
      q: symbol,
      api_key: SERPAPI_KEY,
    }
  });
  return response.data;
}
```

### Rate Limiting

We implement smart rate limiting:
- **Built-in limit:** 250 requests/month
- **Auto-reset:** First day of each month
- **Warnings:** At 75% and 90% usage

See `server/rateLimiter.ts` for implementation.

### Caching Strategy

To minimize API usage:
- **Cache TTL:** 30 minutes
- **Cache-first:** Always check cache before API call
- **Reduction:** 69% fewer API calls with caching

See `server/priceCache.ts` for implementation.

---

## 💰 Pricing & Limits

### Free Tier
- **100 searches/month**
- Full API access
- No credit card required
- Perfect for testing/development

### Paid Plans

| Plan | Monthly Cost | Searches | Cost per Search |
|------|-------------|----------|-----------------|
| **Starter** | $50 | 5,000 | $0.01 |
| **Developer** | $100 | 15,000 | $0.0067 |
| **Business** | $250 | 50,000 | $0.005 |

### Our Usage (with caching)
- **Without cache:** ~2,016 requests/day
- **With cache:** ~624 requests/day
- **Monthly (30 days):** ~18,720 requests/month
- **Recommended plan:** Business ($250/month)

---

## 🔧 Advanced Configuration

### Supported Markets

SerpAPI Google Finance supports:
- **NSE** (National Stock Exchange of India)
- **BSE** (Bombay Stock Exchange)
- **NYSE** (New York Stock Exchange)
- **NASDAQ** (NASDAQ Stock Market)
- And many more global exchanges

### Stock Symbol Format

Use the format: `SYMBOL:EXCHANGE`

Examples:
```
RELIANCE:NSE      # Reliance Industries on NSE
TCS:BSE           # Tata Consultancy Services on BSE
AAPL:NASDAQ       # Apple on NASDAQ
```

### API Parameters

Available parameters for Google Finance API:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `engine` | API engine | `google_finance` |
| `q` | Stock symbol/query | `RELIANCE:NSE` |
| `api_key` | Your API key | `your_key_here` |
| `hl` | Language | `en` |
| `gl` | Country | `in` |

### Response Format

Typical API response:
```json
{
  "search_metadata": {
    "id": "...",
    "status": "Success",
    "created_at": "2025-10-14T10:30:00Z"
  },
  "summary": {
    "title": "Reliance Industries Limited",
    "stock": "RELIANCE",
    "exchange": "NSE",
    "price": 2456.75,
    "currency": "INR",
    "previous_close": 2411.45
  },
  "about_panel": {
    "stock_symbol": "RELIANCE:NSE",
    "description": "..."
  }
}
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# ✅ Correct - use .env file
SERPAPI_KEY="your_key_here"

# ❌ Wrong - never hardcode in source
const API_KEY = "a1b2c3d4e5f6...";
```

### 2. .gitignore
Ensure `.env` is in `.gitignore`:
```bash
# .gitignore
.env
.env.local
.env.production
```

### 3. Key Rotation
- Rotate keys every 3-6 months
- Immediately rotate if compromised
- Use different keys for dev/production

### 4. Monitor Usage
Regularly check usage to detect:
- Unexpected spikes
- Potential key leaks
- Bot attacks

---

## 🐛 Troubleshooting

### "API key not configured"

**Problem:** Server can't find SerpAPI key

**Solutions:**
```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify key is set
grep SERPAPI_KEY .env

# 3. Restart server
npm run dev

# 4. Test key directly
node -e "require('dotenv').config(); console.log(process.env.SERPAPI_KEY)"
```

### "Invalid API key"

**Problem:** API key is incorrect or inactive

**Solutions:**
1. Log in to [SerpAPI Dashboard](https://serpapi.com/dashboard)
2. Verify your API key is correct
3. Check if key is active (not revoked)
4. Try regenerating the key
5. Copy carefully (no extra spaces)

### Rate Limit Exceeded

**Problem:** Hit monthly search limit

**Solutions:**
```bash
# Check current usage
curl http://localhost:5000/api/serpapi/usage

# Response shows:
{
  "used": 250,
  "limit": 250,
  "remaining": 0,
  "resetDate": "2025-11-01T00:00:00Z"
}

# Options:
# 1. Wait until reset date
# 2. Upgrade plan at serpapi.com
# 3. Use cache more effectively
```

### Cache Not Working

**Problem:** Making too many API calls

**Solutions:**
```bash
# Check cache stats
curl http://localhost:5000/api/serpapi/usage

# Verify cache settings in server/priceCache.ts
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

# Check server logs for cache hits
# Should see: "📦 Using cached price for RELIANCE:NSE"
```

### Network Errors

**Problem:** Can't connect to SerpAPI

**Solutions:**
```bash
# Test connectivity
ping serpapi.com

# Test API directly
curl "https://serpapi.com/search.json?engine=google_finance&q=RELIANCE:NSE&api_key=YOUR_KEY"

# Check server logs for detailed errors
npm run dev
```

---

## 📊 Monitoring & Analytics

### Usage Dashboard

View your usage at [https://serpapi.com/dashboard](https://serpapi.com/dashboard):
- Total searches used
- Remaining searches
- Monthly reset date
- Search history
- API response times

### In-App Monitoring

Check usage in EquiAlert:
```bash
# Get current stats
curl http://localhost:5000/api/serpapi/usage
```

Response:
```json
{
  "rateLimit": {
    "limit": 250,
    "used": 45,
    "remaining": 205,
    "percentage": 18.0,
    "resetDate": "2025-11-01T00:00:00Z"
  },
  "cache": {
    "size": 15,
    "hits": 342,
    "misses": 45
  }
}
```

---

## 📚 Related Documentation

- **[SerpAPI Integration Guide](../architecture/SERPAPI_INTEGRATION.md)** - Technical implementation details
- **[Price Caching System](../architecture/PRICE_CACHING_SYSTEM.md)** - How caching optimizes API usage
- **[API Endpoints](endpoints.md)** - Stock API endpoints in EquiAlert
- **[Rate Limiting](../architecture/SERPAPI_INTEGRATION.md#rate-limiting)** - Rate limiting implementation

## 🔗 External Resources

- **[SerpAPI Documentation](https://serpapi.com/docs)** - Official API docs
- **[Google Finance API](https://serpapi.com/google-finance-api)** - Specific endpoint docs
- **[Pricing Plans](https://serpapi.com/pricing)** - Detailed pricing information
- **[API Playground](https://serpapi.com/playground)** - Test API calls
- **[Support](https://serpapi.com/contact)** - Contact SerpAPI support

---

**Last Updated:** October 2025
