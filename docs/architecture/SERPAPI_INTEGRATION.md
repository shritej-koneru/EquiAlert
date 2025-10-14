# SerpAPI Google Finance Integration

## Overview
EquiAlert now fetches real-time stock prices from SerpAPI's Google Finance API instead of using mock data.

## Changes Made

### 1. Environment Configuration
- Added `SERPAPI_KEY` to `.env` file
- Added `SERPAPI_KEY` to `.env.example` for reference
- API Key format: 64-character hexadecimal string

### 2. New Files Created
- **`server/serpapi.ts`**: Helper module for SerpAPI integration
  - `getStockPrice(symbol)`: Fetch current price for a stock
  - `searchStocks(query)`: Search for stocks by name or symbol
  - `getMarketTrends()`: Get market indices data

### 3. Modified Files

#### `server/priceUpdater.ts`
- Replaced mock price updates with real prices from SerpAPI
- Now fetches actual stock prices every 5 minutes
- Maintains notification logic for price alerts

#### `server/routes.ts`
- Added new endpoints:
  - `GET /api/stocks/search?q={query}`: Search for stocks
  - `GET /api/stocks/price/:symbol`: Get current price for a specific stock
- Imported SerpAPI helper functions

## API Endpoints

### Stock Search
```bash
GET /api/stocks/search?q=reliance
```
Response:
```json
{
  "results": [
    {
      "symbol": "RELIANCE:NSE",
      "name": "Reliance Industries Ltd",
      "exchange": "NSE",
      "type": "Stock"
    }
  ]
}
```

### Stock Price
```bash
GET /api/stocks/price/INFY
```
Response:
```json
{
  "price": 1488.00,
  "currency": "INR",
  "symbol": "INFY",
  "exchange": "NSE"
}
```

## Stock Symbol Format
- Indian stocks should use format: `SYMBOL:NSE` or just `SYMBOL`
- Examples:
  - `RELIANCE:NSE` or `RELIANCE`
  - `TCS:NSE` or `TCS`
  - `INFY:NSE` or `INFY`

## Features
✅ Real-time stock prices from Google Finance
✅ Automatic price updates every 5 minutes
✅ Stock search functionality
✅ Support for Indian (NSE/BSE) stocks
✅ Price change notifications via WhatsApp

## Testing

### Test Stock Price Endpoint
```bash
curl http://localhost:5000/api/stocks/price/RELIANCE
```

### Test Stock Search
```bash
curl "http://localhost:5000/api/stocks/search?q=tcs"
```

### Test Watchlist (shows real prices)
```bash
curl http://localhost:5000/api/watchlist
```

## Rate Limiting

### Overview
- **Limit**: 250 requests per month per API key
- **Auto-reset**: Resets on the 1st day of each month
- **Tracking**: In-memory counter (survives server restarts within same month)
- **Behavior**: Requests are blocked when limit is exceeded

### API Usage Endpoints

#### Get Current Usage Stats
```bash
GET /api/serpapi/usage
```
Response:
```json
{
  "used": 7,
  "remaining": 243,
  "limit": 250,
  "percentage": 2.8,
  "resetDate": "2025-11-01T00:00:00.000Z",
  "month": "2025-10"
}
```

#### Reset Usage Counter (when adding new API key)
```bash
POST /api/serpapi/reset
```
Response:
```json
{
  "success": true,
  "message": "Usage counter reset successfully",
  "stats": { /* current stats */ }
}
```

### Usage Tracking
The system tracks all SerpAPI requests:
- Price updates (every 5 minutes for watchlist items)
- Stock searches (`/api/stocks/search`)
- Direct price lookups (`/api/stocks/price/:symbol`)
- Market trends queries

### When Limit is Reached
- All SerpAPI requests will return `null` or empty arrays
- Error message logged: "SerpAPI rate limit exceeded. X/250 requests used this month. Resets on [date]"
- Stock prices will not update until limit resets or you add a new API key

### Adding a New API Key
When your current API key reaches the limit:
1. Get a new SerpAPI key from https://serpapi.com
2. Update `SERPAPI_KEY` in `.env` file
3. Call `POST /api/serpapi/reset` to reset the counter to 0
4. Server will continue making requests with the new key

## Notes
- The baseline prices in the database were from mock data, so initial percentage changes may appear large
- The system will update prices every 5 minutes automatically (uses ~288 requests/day for 7 stocks)
- Notifications are sent when a stock with alerts enabled changes by 1% or more
- There's a 2-minute cooldown between notifications for the same stock
- Monitor usage regularly via `/api/serpapi/usage` endpoint

## SerpAPI Documentation
- Google Finance API: https://serpapi.com/google-finance-api
- Stock search: https://serpapi.com/google-finance-markets-api
