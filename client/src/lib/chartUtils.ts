/**
 * Client-Side Chart Utilities
 * Heavy computations moved from server to reduce server memory usage
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

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const sma: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  // Calculate subsequent EMAs
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }
  
  return ema;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[], 
  period: number, 
  stdDev: number
): { upper: number[]; middle: number[]; lower: number[] } {
  if (prices.length < period) return { upper: [], middle: [], lower: [] };
  
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const sd = Math.sqrt(variance);
    
    middle.push(sma);
    upper.push(sma + stdDev * sd);
    lower.push(sma - stdDev * sd);
  }
  
  return { upper, middle, lower };
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];
  
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI
  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }
  
  // Calculate MACD line
  const macdLine: number[] = [];
  const offset = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }
  
  // Calculate signal line
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram
  const histogram: number[] = [];
  const signalOffset = signalPeriod - 1;
  
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalOffset] - signalLine[i]);
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

/**
 * Detect support and resistance levels
 */
export function findSupportResistance(data: OHLCDataPoint[], lookback: number = 20): {
  support: number[];
  resistance: number[];
} {
  const support: number[] = [];
  const resistance: number[] = [];
  
  for (let i = lookback; i < data.length - lookback; i++) {
    const window = data.slice(i - lookback, i + lookback + 1);
    const current = data[i];
    
    // Check if current low is a local minimum
    const isSupport = window.every(point => current.low <= point.low);
    if (isSupport) support.push(current.low);
    
    // Check if current high is a local maximum
    const isResistance = window.every(point => current.high >= point.high);
    if (isResistance) resistance.push(current.high);
  }
  
  return { support, resistance };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
export function calculateVolatility(prices: number[], period: number = 20): number[] {
  if (prices.length < period + 1) return [];
  
  const volatility: number[] = [];
  
  for (let i = period; i < prices.length; i++) {
    const returns: number[] = [];
    for (let j = i - period + 1; j <= i; j++) {
      const dailyReturn = (prices[j] - prices[j - 1]) / prices[j - 1];
      returns.push(dailyReturn);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    volatility.push(Math.sqrt(variance) * Math.sqrt(252) * 100); // Annualized volatility
  }
  
  return volatility;
}

/**
 * Round price to 2 decimal places
 */
export function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}
