/**
 * Price Cache System for SerpAPI
 * Caches stock prices to minimize API calls
 * - Stores prices in memory with TTL (Time To Live)
 * - Serves cached prices to all endpoints
 * - Background updater refreshes only expired prices
 */

interface CachedPrice {
  symbol: string;
  price: number;
  currency: string;
  exchange: string;
  baselinePrice?: number; // First price we saw (for calculating change)
  change?: number; // Absolute change from baseline
  changePercent?: number; // Percentage change from baseline
  timestamp: number; // When this was fetched
  expiresAt: number; // When this cache expires
}

// Cache TTL: 30 minutes (prices stay fresh for 30 min)
const CACHE_TTL_MS = 30 * 60 * 1000;

// In-memory price cache
const priceCache = new Map<string, CachedPrice>();

/**
 * Get cached price or return null if expired/missing
 */
export function getCachedPrice(symbol: string): CachedPrice | null {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cached = priceCache.get(normalizedSymbol);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache is still valid
  if (Date.now() > cached.expiresAt) {
    // Cache expired, remove it
    priceCache.delete(normalizedSymbol);
    return null;
  }
  
  return cached;
}

/**
 * Store price in cache with change calculation
 */
export function setCachedPrice(
  symbol: string,
  price: number,
  currency: string = 'INR',
  exchange: string = 'NSE',
  baselinePrice?: number
): void {
  const normalizedSymbol = normalizeSymbol(symbol);
  const now = Date.now();
  
  // Get existing cache to preserve baseline if not provided
  const existing = priceCache.get(normalizedSymbol);
  const baseline = baselinePrice ?? existing?.baselinePrice ?? price;
  
  // Calculate change from baseline
  const change = price - baseline;
  const changePercent = baseline !== 0 ? (change / baseline) * 100 : 0;
  
  priceCache.set(normalizedSymbol, {
    symbol: normalizedSymbol,
    price,
    currency,
    exchange,
    baselinePrice: baseline,
    change,
    changePercent,
    timestamp: now,
    expiresAt: now + CACHE_TTL_MS,
  });
}

/**
 * Get all cached prices
 */
export function getAllCachedPrices(): CachedPrice[] {
  const now = Date.now();
  const validPrices: CachedPrice[] = [];
  
  // Clean up expired entries and return valid ones
  priceCache.forEach((cached, symbol) => {
    if (now > cached.expiresAt) {
      priceCache.delete(symbol);
    } else {
      validPrices.push(cached);
    }
  });
  
  return validPrices;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validCount = 0;
  let expiredCount = 0;
  
  priceCache.forEach((cached) => {
    if (now > cached.expiresAt) {
      expiredCount++;
    } else {
      validCount++;
    }
  });
  
  return {
    total: priceCache.size,
    valid: validCount,
    expired: expiredCount,
    ttlMinutes: CACHE_TTL_MS / (60 * 1000),
  };
}

/**
 * Clear all cached prices
 */
export function clearCache(): void {
  priceCache.clear();
  console.log('Price cache cleared');
}

/**
 * Clear expired entries
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  priceCache.forEach((cached, symbol) => {
    if (now > cached.expiresAt) {
      priceCache.delete(symbol);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired cache entries`);
  }
}

/**
 * Normalize symbol format (e.g., "RELIANCE" -> "RELIANCE:NSE")
 */
function normalizeSymbol(symbol: string): string {
  if (symbol.includes(':')) {
    return symbol;
  }
  return `${symbol}:NSE`;
}

/**
 * Check if a symbol needs refresh (cache expired or missing)
 */
export function needsRefresh(symbol: string): boolean {
  return getCachedPrice(symbol) === null;
}

/**
 * Get list of symbols that need refreshing
 */
export function getSymbolsNeedingRefresh(symbols: string[]): string[] {
  return symbols.filter(needsRefresh);
}

/**
 * Update baseline price for a stock (resets change calculation)
 */
export function updateBaselinePrice(symbol: string, baselinePrice: number): void {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cached = priceCache.get(normalizedSymbol);
  
  if (cached) {
    cached.baselinePrice = baselinePrice;
    cached.change = cached.price - baselinePrice;
    cached.changePercent = baselinePrice !== 0 ? (cached.change / baselinePrice) * 100 : 0;
  }
}

/**
 * Get change info for a stock
 */
export function getChangeInfo(symbol: string): { change: number; changePercent: number } | null {
  const cached = getCachedPrice(symbol);
  if (!cached || cached.change === undefined || cached.changePercent === undefined) {
    return null;
  }
  return {
    change: cached.change,
    changePercent: cached.changePercent,
  };
}
