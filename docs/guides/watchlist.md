# Watchlist Feature Guide

Learn how to use and customize the watchlist feature in EquiAlert.

## Overview

The watchlist feature allows users to:
- Track favorite stocks in one place
- Set target prices and alerts
- Monitor real-time price changes
- Receive WhatsApp notifications when price targets are reached

---

## 🎯 Features

### Real-time Price Tracking
- Live price updates every 30 minutes
- Color-coded change indicators (green = up, red = down)
- Percentage and absolute change display

### Price Alerts
- Set custom target prices
- Automatic WhatsApp notifications
- Enable/disable alerts per stock

### Quick Actions
- Add stocks with search
- Remove stocks with one click
- Update target prices instantly

---

## 📱 Using the Watchlist

### Adding Stocks

#### Method 1: From Search
1. Go to "Stocks" page
2. Search for a stock (e.g., "Reliance")
3. Click "Add to Watchlist" button
4. Set target price (optional)
5. Enable alerts (optional)
6. Click "Add"

#### Method 2: From Home Page
1. Click the search icon in top bar
2. Search for stock
3. Select from results
4. Stock automatically added to watchlist

### Viewing Watchlist

The watchlist is displayed on the Home page:

```
┌─────────────────────────────────────┐
│ My Watchlist                         │
├─────────────────────────────────────┤
│ RELIANCE                        ↑ 1.88% │
│ ₹2,456.75 | +45.30               │
│ Target: ₹2,600.00 🔔             │
├─────────────────────────────────────┤
│ TCS                             ↓ 0.59% │
│ ₹3,890.50 | -23.15               │
│ Target: ₹4,000.00                │
└─────────────────────────────────────┘
```

### Setting Target Prices

1. Click on a watchlist item
2. Enter target price
3. Toggle alert notification
4. Save changes

### Removing Stocks

1. Click the "×" button on any watchlist item
2. Confirm removal
3. Stock removed instantly

---

## 🔔 Price Alerts

### How Alerts Work

The system checks prices every 30 minutes and:
1. Compares current price to target price
2. Checks if alert is enabled for that stock
3. Sends WhatsApp notification if target is reached
4. Includes price details and percentage change

### Alert Message Format

```
🚨 Price Alert: RELIANCE

Current: ₹2,620.50
Target: ₹2,600.00
Change: +6.68% 📈

Your target price has been reached!
```

### Setting Up Alerts

#### Prerequisites
1. Configure Twilio in `.env` file (see [API Keys Guide](../api/api-keys.md))
2. Join Twilio WhatsApp sandbox
3. Add your WhatsApp number in profile

#### Enable Alerts
1. Go to Profile settings
2. Verify WhatsApp number
3. Enable watchlist alerts
4. Set target prices for stocks

### Alert Types

- **Target Reached** - Price crosses your target
- **Significant Change** - Stock moves >5% in a day
- **Market Events** - Major news affecting your stocks

---

## 💻 API Integration

### Get Watchlist

```bash
curl "http://localhost:5000/api/watchlist"
```

Response:
```json
{
  "watchlist": [
    {
      "id": "watch-123",
      "symbol": "RELIANCE:NSE",
      "name": "Reliance Industries",
      "targetPrice": 2600.00,
      "alertEnabled": true,
      "currentPrice": 2456.75,
      "change": 45.30,
      "changePercent": 1.88
    }
  ]
}
```

### Add Stock

```bash
curl -X POST "http://localhost:5000/api/watchlist" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE:NSE",
    "name": "Reliance Industries",
    "targetPrice": 2600.00,
    "alertEnabled": true
  }'
```

### Update Target Price

```bash
curl -X PUT "http://localhost:5000/api/watchlist/watch-123" \
  -H "Content-Type: application/json" \
  -d '{
    "targetPrice": 2700.00,
    "alertEnabled": true
  }'
```

### Remove Stock

```bash
curl -X DELETE "http://localhost:5000/api/watchlist/watch-123"
```

See [API Endpoints Reference](../api/endpoints.md) for complete API documentation.

---

## ⚙️ Configuration

### Database Schema

Watchlist items are stored with:
```typescript
interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;       // e.g., "RELIANCE:NSE"
  name: string;         // e.g., "Reliance Industries"
  targetPrice: number;  // Optional target
  alertEnabled: boolean; // Alert on/off
  addedAt: Date;
}
```

### Price Update Frequency

Configured in `server/priceUpdater.ts`:
```typescript
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
```

To change update frequency:
1. Edit `UPDATE_INTERVAL` constant
2. Restart server
3. Note: Lower intervals = more API usage

### Alert Threshold

Configure when alerts trigger:
```typescript
// server/priceUpdater.ts
const shouldAlert = (current: number, target: number) => {
  return current >= target; // Trigger when price reaches or exceeds target
};
```

---

## 🎨 UI Customization

### Watchlist Card Component

Located in `client/src/components/WatchlistCard.tsx`

#### Color Scheme
```typescript
// Positive change (green)
className="text-green-500"

// Negative change (red)
className="text-red-500"

// Neutral (gray)
className="text-gray-400"
```

#### Layout Options

Compact view:
```tsx
<WatchlistCard 
  stocks={watchlist} 
  compact={true}
/>
```

Full view with charts:
```tsx
<WatchlistCard 
  stocks={watchlist} 
  compact={false}
  showCharts={true}
/>
```

---

## 📊 Advanced Features

### Batch Operations

Add multiple stocks at once:
```typescript
const addMultiple = async (symbols: string[]) => {
  await Promise.all(
    symbols.map(symbol => 
      fetch('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ symbol })
      })
    )
  );
};
```

### Export Watchlist

```typescript
const exportWatchlist = async () => {
  const response = await fetch('/api/watchlist');
  const data = await response.json();
  
  // Convert to CSV
  const csv = data.watchlist.map(item => 
    `${item.symbol},${item.name},${item.currentPrice},${item.targetPrice}`
  ).join('\n');
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watchlist.csv';
  a.click();
};
```

### Import Watchlist

```typescript
const importWatchlist = async (csvContent: string) => {
  const lines = csvContent.split('\n');
  
  for (const line of lines) {
    const [symbol, name, , targetPrice] = line.split(',');
    
    await fetch('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        name,
        targetPrice: parseFloat(targetPrice)
      })
    });
  }
};
```

---

## 🔧 Troubleshooting

### Stock Not Updating

**Problem:** Prices don't update after 30 minutes

**Solutions:**
1. Check server logs for errors
2. Verify SerpAPI key is valid
3. Check API rate limits: `GET /api/serpapi/usage`
4. Restart price updater: Restart server

### Alerts Not Working

**Problem:** Not receiving WhatsApp notifications

**Solutions:**
1. Verify Twilio credentials in `.env`
2. Check WhatsApp number is verified
3. Ensure you're in Twilio sandbox
4. Check server logs for Twilio errors
5. Test notification: `POST /api/notifications/test`

### Wrong Stock Symbol

**Problem:** Added wrong stock or symbol

**Solutions:**
1. Remove stock from watchlist
2. Use search to find correct symbol
3. Stock symbols format: `SYMBOL:EXCHANGE`
   - Example: `RELIANCE:NSE` (correct)
   - Example: `RELIANCE` (incorrect)

### Duplicate Stocks

**Problem:** Same stock appears twice

**Solutions:**
1. Check for different exchanges (NSE vs BSE)
2. Remove duplicate manually
3. Backend prevents exact duplicates

---

## 💡 Best Practices

### 1. Limit Watchlist Size
- Keep 10-20 stocks for optimal performance
- More stocks = more API calls
- Focus on actively traded stocks

### 2. Set Realistic Targets
- Base targets on technical/fundamental analysis
- Update targets regularly
- Consider support/resistance levels

### 3. Manage Alerts
- Don't enable alerts for all stocks
- Focus on high-priority positions
- Adjust targets as market moves

### 4. Regular Maintenance
- Review watchlist weekly
- Remove inactive stocks
- Add emerging opportunities

### 5. Use with Analysis
- Combine with news feed
- Check chatbot for insights
- Review price charts regularly

---

## 📚 Related Documentation

- [API Endpoints](../api/endpoints.md) - Watchlist API reference
- [Setup Guide](setup.md) - Initial configuration
- [Notifications Guide](notifications.md) - Alert setup
- [Price Caching](../PRICE_CACHING_SYSTEM.md) - How prices update

---

**Last Updated:** October 2025
