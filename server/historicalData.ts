/**
 * Historical Stock Data Generator
 * Generates realistic OHLC (Open, High, Low, Close) and volume data
 * for different time ranges
 */

export interface OHLCDataPoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  data: OHLCDataPoint[];
  stats: {
    dayHigh: number;
    dayLow: number;
    weekHigh52: number;
    weekLow52: number;
    openPrice: number;
    currentPrice: number;
    avgVolume: number;
  };
  // Indicators moved to client-side to reduce server memory
}

/**
 * Generate historical OHLC data for a stock
 * @param currentPrice - Current stock price
 * @param timeRange - Time range (1D, 1W, 1M, 1Y, 5Y)
 * @returns Array of OHLC data points
 */
export function generateHistoricalData(
  symbol: string,
  currentPrice: number,
  timeRange: '1D' | '1W' | '1M' | '1Y' | '5Y'
): HistoricalDataResponse {
  const data: OHLCDataPoint[] = [];
  let points: number;
  let interval: string;
  let volatility: number;

  // Configure based on time range - optimized for lower memory usage
  switch (timeRange) {
    case '1D':
      points = 78; // 5-minute intervals for market hours
      interval = '5m';
      volatility = 0.005; // 0.5% volatility
      break;
    case '1W':
      points = 35; // 7 hours per day * 5 days
      interval = '1h';
      volatility = 0.01; // 1% volatility
      break;
    case '1M':
      points = 22; // ~22 trading days
      interval = '1d';
      volatility = 0.015; // 1.5% volatility
      break;
    case '1Y':
      points = 52; // 52 weeks
      interval = '1w';
      volatility = 0.025; // 2.5% volatility
      break;
    case '5Y':
      points = 60; // 60 months
      interval = '1M';
      volatility = 0.04; // 4% volatility
      break;
    default:
      points = 78;
      interval = '5m';
      volatility = 0.005;
  }

  // Start from a baseline price (slightly lower than current)
  const baselinePrice = currentPrice * (0.95 + Math.random() * 0.05);
  let price = baselinePrice;
  
  // Calculate time intervals
  const now = Date.now();
  const timeIncrement = getTimeIncrement(timeRange, points);
  
  // Track min/max for stats
  let dayHigh = currentPrice;
  let dayLow = currentPrice;
  let weekHigh52 = currentPrice;
  let weekLow52 = currentPrice * 0.7;
  let totalVolume = 0;

  // Generate data points
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * timeIncrement;
    
    // Calculate OHLC with realistic movements
    const open = price;
    const trend = (currentPrice - baselinePrice) / points; // Gradual trend toward current price
    const randomChange = (Math.random() - 0.5) * volatility * price;
    
    // Add some trend + random walk
    price = price + trend + randomChange;
    
    // Generate high and low for the period
    const highLowRange = price * volatility * (0.5 + Math.random());
    const high = price + highLowRange * Math.random();
    const low = price - highLowRange * Math.random();
    
    // Close is somewhere between open and price
    const close = open + (price - open) * (0.8 + Math.random() * 0.4);
    
    // Generate volume (higher volume during market open/close for intraday)
    const baseVolume = 100000 + Math.random() * 500000;
    const volumeMultiplier = timeRange === '1D' 
      ? (i < 10 || i > points - 10 ? 1.5 : 1.0) // Higher volume at market open/close
      : 1.0;
    const volume = Math.floor(baseVolume * volumeMultiplier * (0.7 + Math.random() * 0.6));
    
    totalVolume += volume;

    // Update stats
    if (high > dayHigh) dayHigh = high;
    if (low < dayLow) dayLow = low;
    if (high > weekHigh52) weekHigh52 = high;
    if (low < weekLow52) weekLow52 = low;

    data.push({
      time: formatTime(timestamp, timeRange),
      timestamp,
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume,
    });

    // Update price for next iteration
    price = close;
  }

  // Ensure the last candle close is near the current price
  if (data.length > 0) {
    const lastCandle = data[data.length - 1];
    lastCandle.close = currentPrice;
    lastCandle.high = Math.max(lastCandle.high, currentPrice);
    lastCandle.low = Math.min(lastCandle.low, currentPrice);
  }

  // Technical indicators moved to client-side to reduce server memory usage
  // Client can calculate SMA, EMA, Bollinger Bands, etc. using chartUtils.ts

  return {
    symbol,
    data,
    stats: {
      dayHigh: roundPrice(dayHigh),
      dayLow: roundPrice(dayLow),
      weekHigh52: roundPrice(weekHigh52),
      weekLow52: roundPrice(weekLow52),
      openPrice: roundPrice(data[0]?.open || currentPrice),
      currentPrice: roundPrice(currentPrice),
      avgVolume: Math.floor(totalVolume / points),
    },
  };
}

/**
 * Get time increment in milliseconds based on range
 */
function getTimeIncrement(timeRange: string, points: number): number {
  switch (timeRange) {
    case '1D':
      return 5 * 60 * 1000; // 5 minutes
    case '1W':
      return 60 * 60 * 1000; // 1 hour
    case '1M':
      return 24 * 60 * 60 * 1000; // 1 day
    case '1Y':
      return 7 * 24 * 60 * 60 * 1000; // 1 week
    case '5Y':
      return 30 * 24 * 60 * 60 * 1000; // 1 month
    default:
      return 60 * 1000;
  }
}

/**
 * Format timestamp based on time range
 */
function formatTime(timestamp: number, timeRange: string): string {
  const date = new Date(timestamp);
  
  switch (timeRange) {
    case '1D':
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    case '1W':
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit' });
    case '1M':
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    case '1Y':
      return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    case '5Y':
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleTimeString('en-IN');
  }
}

/**
 * Round price to 2 decimal places
 */
function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}
