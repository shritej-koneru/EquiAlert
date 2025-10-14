# API Endpoints Reference

Complete reference for all EquiAlert REST API endpoints.

## Base URL

```
http://localhost:5000/api
```

---

## 📊 Stock Endpoints

### Search Stocks

Search for stocks across NSE, BSE, and other Indian markets.

**Endpoint:** `GET /api/stocks/search`

**Query Parameters:**
- `q` (required) - Search query (stock name or symbol)

**Example Request:**
```bash
curl "http://localhost:5000/api/stocks/search?q=reliance"
```

**Example Response:**
```json
{
  "results": [
    {
      "symbol": "RELIANCE:NSE",
      "name": "Reliance Industries Ltd",
      "exchange": "NSE",
      "price": "2456.75",
      "currency": "INR"
    }
  ]
}
```

---

### Get Stock Price

Get real-time price for a specific stock (with caching).

**Endpoint:** `GET /api/stocks/price/:symbol`

**Path Parameters:**
- `symbol` (required) - Stock symbol with exchange (e.g., "RELIANCE:NSE")

**Example Request:**
```bash
curl "http://localhost:5000/api/stocks/price/RELIANCE:NSE"
```

**Example Response:**
```json
{
  "symbol": "RELIANCE:NSE",
  "price": 2456.75,
  "currency": "INR",
  "change": 45.30,
  "changePercent": 1.88,
  "baselinePrice": 2411.45,
  "cached": true,
  "cacheAge": 5,
  "timestamp": "2025-10-14T10:30:00Z"
}
```

**Response Fields:**
- `cached` - Whether data came from cache (true) or API (false)
- `cacheAge` - Minutes since last API fetch
- `baselinePrice` - Reference price for change calculation
- `change` - Absolute price change from baseline
- `changePercent` - Percentage change from baseline

---

### Get Available Stocks

Get list of popular Indian stocks with cached prices.

**Endpoint:** `GET /api/stocks/available`

**Example Request:**
```bash
curl "http://localhost:5000/api/stocks/available"
```

**Example Response:**
```json
{
  "stocks": [
    {
      "symbol": "RELIANCE:NSE",
      "name": "Reliance Industries",
      "sector": "Energy",
      "price": 2456.75,
      "change": 45.30,
      "changePercent": 1.88,
      "cached": true
    },
    {
      "symbol": "TCS:NSE",
      "name": "Tata Consultancy Services",
      "sector": "IT",
      "price": 3890.50,
      "change": -23.15,
      "changePercent": -0.59,
      "cached": true
    }
  ]
}
```

---

## 📰 News Endpoints

### Get Market News

Fetch latest financial news articles.

**Endpoint:** `GET /api/news`

**Query Parameters:**
- `category` (optional) - Filter by category: "market", "stocks", "economy", "crypto"
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Results per page (default: 20, max: 100)

**Example Request:**
```bash
curl "http://localhost:5000/api/news?category=stocks&page=1&pageSize=10"
```

**Example Response:**
```json
{
  "articles": [
    {
      "title": "Reliance Industries reports strong Q3 earnings",
      "description": "Revenue up 15% YoY driven by retail and digital segments...",
      "url": "https://economictimes.com/...",
      "source": "Economic Times",
      "publishedAt": "2025-10-14T09:30:00Z",
      "imageUrl": "https://img.etimg.com/...",
      "category": "stocks"
    }
  ],
  "totalResults": 247,
  "page": 1,
  "pageSize": 10
}
```

---

## 👤 User & Profile Endpoints

### Get User Profile

Get current user's profile information.

**Endpoint:** `GET /api/profile`

**Example Request:**
```bash
curl "http://localhost:5000/api/profile"
```

**Example Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "profession": "Investor",
  "phoneNumber": "+919876543210",
  "whatsappNumber": "+919876543210",
  "createdAt": "2025-10-01T10:00:00Z"
}
```

---

### Update User Profile

Update user profile information.

**Endpoint:** `PUT /api/profile`

**Request Body:**
```json
{
  "name": "John Doe",
  "profession": "Day Trader",
  "phoneNumber": "+919876543210",
  "whatsappNumber": "+919876543210"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/profile" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","profession":"Day Trader"}'
```

**Example Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user-123",
    "name": "John Doe",
    "profession": "Day Trader",
    "phoneNumber": "+919876543210",
    "whatsappNumber": "+919876543210"
  }
}
```

---

## 📋 Watchlist Endpoints

### Get Watchlist

Get user's stock watchlist.

**Endpoint:** `GET /api/watchlist`

**Example Request:**
```bash
curl "http://localhost:5000/api/watchlist"
```

**Example Response:**
```json
{
  "watchlist": [
    {
      "id": "watch-123",
      "userId": "user-123",
      "symbol": "RELIANCE:NSE",
      "name": "Reliance Industries",
      "targetPrice": 2600.00,
      "alertEnabled": true,
      "addedAt": "2025-10-10T10:00:00Z",
      "currentPrice": 2456.75,
      "change": 45.30,
      "changePercent": 1.88
    }
  ]
}
```

---

### Add to Watchlist

Add a stock to user's watchlist.

**Endpoint:** `POST /api/watchlist`

**Request Body:**
```json
{
  "symbol": "RELIANCE:NSE",
  "name": "Reliance Industries",
  "targetPrice": 2600.00,
  "alertEnabled": true
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/watchlist" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE:NSE","name":"Reliance Industries","targetPrice":2600}'
```

**Example Response:**
```json
{
  "success": true,
  "watchlist": {
    "id": "watch-124",
    "symbol": "RELIANCE:NSE",
    "name": "Reliance Industries",
    "targetPrice": 2600.00,
    "alertEnabled": true
  }
}
```

---

### Remove from Watchlist

Remove a stock from watchlist.

**Endpoint:** `DELETE /api/watchlist/:id`

**Path Parameters:**
- `id` (required) - Watchlist item ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/watchlist/watch-123"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Stock removed from watchlist"
}
```

---

### Update Watchlist Item

Update target price or alert settings.

**Endpoint:** `PUT /api/watchlist/:id`

**Request Body:**
```json
{
  "targetPrice": 2700.00,
  "alertEnabled": true
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/watchlist/watch-123" \
  -H "Content-Type: application/json" \
  -d '{"targetPrice":2700,"alertEnabled":true}'
```

---

## 🤖 Chatbot Endpoints

### Send Chat Message

Send a message to the AI chatbot.

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "message": "What's happening with Reliance stock today?",
  "context": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the current NIFTY 50 level?"}'
```

**Example Response:**
```json
{
  "response": "The NIFTY 50 is currently trading at 19,850.30, up 0.85% today. The index has shown strong momentum driven by IT and financial stocks.",
  "timestamp": "2025-10-14T10:30:00Z"
}
```

---

## 📊 System Endpoints

### Get SerpAPI Usage Stats

Get current API usage statistics and cache performance.

**Endpoint:** `GET /api/serpapi/usage`

**Example Request:**
```bash
curl "http://localhost:5000/api/serpapi/usage"
```

**Example Response:**
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
    "stats": {
      "RELIANCE:NSE": {
        "price": 2456.75,
        "age": 8,
        "valid": true
      }
    }
  }
}
```

---

### Reset API Usage Counter

Manually reset the API usage counter (admin only).

**Endpoint:** `POST /api/serpapi/reset`

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/serpapi/reset"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Usage counter reset",
  "newCount": 0
}
```

---

## 🔔 Notification Endpoints

### Send Test Notification

Send a test WhatsApp notification.

**Endpoint:** `POST /api/notifications/test`

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "message": "Test notification from EquiAlert"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/notifications/test" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","message":"Test message"}'
```

---

## ❌ Error Responses

All endpoints may return error responses with the following structure:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Missing required parameter: symbol"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Stock symbol not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Monthly API limit reached (250/250). Resets on 2025-11-01",
  "remaining": 0,
  "resetDate": "2025-11-01T00:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "NewsAPI key not configured"
}
```

---

## 📝 Notes

### Rate Limiting
- Built-in rate limiting for SerpAPI (250 requests/month)
- Automatic caching reduces API calls by 69%
- Cache TTL: 30 minutes

### Caching
- Stock prices cached for 30 minutes
- Cache served automatically when valid
- Manual cache invalidation available

### Authentication
- Currently using simple session-based auth
- WhatsApp number used as user identifier
- No JWT implementation yet

### Data Freshness
- Stock prices: Real-time with 30-min cache
- News: Updated every 5 minutes
- Market status: Real-time

---

## 🔗 Related Documentation

- [API Keys Setup](api-keys.md)
- [SerpAPI Integration](../SERPAPI_INTEGRATION.md)
- [Price Caching System](../PRICE_CACHING_SYSTEM.md)

---

**Last Updated:** October 2025
