# Price Caching System Documentation

## Overview
The EquiAlert application now uses an intelligent price caching system to minimize SerpAPI usage while keeping stock prices fresh and updated across all pages.

## Architecture

### Components

1. **Price Cache** (`server/priceCache.ts`)
   - In-memory storage for stock prices
   - 30-minute Time-To-Live (TTL) per price
   - Automatic cleanup of expired entries
   - Serves stale cache when rate limited

2. **Rate Limiter** (`server/rateLimiter.ts`)
   - Tracks 250 requests/month limit
   - Auto-resets monthly
   - Warns at 75% and 90% usage

3. **Price Updater** (`server/priceUpdater.ts`)
   - Updates watchlist every 30 minutes (changed from 5)
   - Only fetches prices that need refresh (expired cache)
   - Skips items with fresh cache

4. **API Endpoints** (`server/routes.ts`)
   - All endpoints use cache first
   - Fetch from API only if cache miss
   - Never make redundant API calls

## How It Works

### Cache Flow
```
User Request → Check Cache → Cache Hit? → Return Cached Price (0 API calls)
                              ↓ No
                         Check Rate Limit → Allowed? → Fetch from API → Store in Cache
                                              ↓ No
                                         Return Stale Cache (if available)
```

### Price Update Cycle
```
Every 30 minutes:
1. Get all watchlist items
2. Filter items with expired/missing cache
3. Fetch only those that need updating
4. Store fresh prices in cache
```

## API Endpoints

### Get Available Stocks (with cached prices)
```bash
GET /api/stocks/available
```
Returns 10 popular Indian stocks with real prices from cache.

**Response:**
```json
[
  {
    "symbol": "HDFCBANK",
    "name": "HDFC Bank",
    "price": 976.25,
    "currency": "INR",
    "changePercent": 0
  },
  ...
]
```

### Get Specific Stock Price
```bash
GET /api/stocks/price/:symbol
```
Returns cached price if available, fetches if not.

### Get Usage & Cache Stats
```bash
GET /api/serpapi/usage
```

**Response:**
```json
{
  "rateLimit": {
    "used": 13,
    "remaining": 237,
    "limit": 250,
    "percentage": 5.2,
    "resetDate": "2025-11-01",
    "month": "2025-10"
  },
  "cache": {
    "total": 13,
    "valid": 13,
    "expired": 0,
    "ttlMinutes": 30
  }
}
```

## Usage Optimization

### Before Caching
- **Update Interval**: 5 minutes
- **Watchlist**: 7 stocks
- **API Calls/Hour**: ~84 (7 stocks × 12 updates)
- **API Calls/Day**: ~2,016
- **Days Until Limit**: ~3 hours ❌

### After Caching
- **Update Interval**: 30 minutes  
- **Watchlist**: 7 stocks
- **Cache TTL**: 30 minutes
- **API Calls/Hour**: ~7 (only fresh fetches)
- **API Calls/Day**: ~168
- **Days Until Limit**: ~1.5 days ⚠️

### With Current Setup (13 cached stocks)
- **Initial Load**: 13 API calls (one-time)
- **Subsequent Requests**: 0 API calls (served from cache)
- **Cache Refresh**: ~13 calls every 30 minutes
- **Daily Usage**: ~624 API calls
- **Days Until Limit**: ~0.4 days (10 hours) ⚠️

## Recommendations

### Option 1: Increase Update Interval
```typescript
// In priceUpdater.ts
setInterval(() => this.updatePrices(), 60 * 60 * 1000); // 60 minutes
```
**Result**: ~312 API calls/day → 0.8 days until limit

### Option 2: Reduce Watchlist Size
Monitor only 3-4 most important stocks
**Result**: ~192 API calls/day → 1.3 days until limit

### Option 3: Increase Cache TTL
```typescript
// In priceCache.ts
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
```
**Result**: ~312 API calls/day → 0.8 days until limit

### Option 4: Multiple API Keys (Recommended)
- Use 4 different SerpAPI keys
- Rotate when approaching limit
- Total: 1000 requests/month
- **Result**: ~3.2 days until limit with current usage

## Cache Benefits

1. **Zero API Calls for Repeated Requests**
   - Stocks page loads use cache
   - Price lookups use cache
   - Search results use cache

2. **Fallback to Stale Cache**
   - When rate limited, serves last known price
   - Better than showing no data

3. **Automatic Cleanup**
   - Expired entries removed automatically
   - Memory-efficient

4. **Shared State**
   - All pages see same prices
   - Consistent data across app

## Monitoring

### Check Current Usage
```bash
curl http://localhost:5000/api/serpapi/usage
```

### Server Logs
```
📦 Using cached price for HDFCBANK:NSE (5 min old)  # Cache hit
✓ All 7 watchlist prices are cached and fresh       # No API calls needed
```

## Cache Invalidation

### Automatic
- Prices expire after 30 minutes
- Next request fetches fresh data

### Manual (when adding new API key)
```bash
curl -X POST http://localhost:5000/api/serpapi/reset
```
This resets both rate limit counter and cache.

## Best Practices

1. **Monitor Usage Daily**
   - Check `/api/serpapi/usage` endpoint
   - Watch for 75% threshold warnings

2. **Adjust Update Interval**
   - During market hours: 30-60 minutes
   - After market close: 2-4 hours

3. **Limit Watchlist Size**
   - Keep to 5-10 stocks maximum
   - Remove inactive stocks

4. **Use Multiple Keys**
   - Rotate when reaching 200/250 limit
   - Keep spare keys ready

5. **Cache-First Strategy**
   - Always check cache before API
   - Accept slightly stale data (< 30 min)

## Frontend Integration

The Stocks page now fetches from `/api/stocks/available`:
```typescript
const { data: availableStocks = [] } = useQuery<SearchResult[]>({
  queryKey: ['/api/stocks/available'],
  refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
});
```

This ensures:
- Real prices displayed on Stocks page
- Prices stay in sync with Home page
- Minimal API usage (cache hits)
