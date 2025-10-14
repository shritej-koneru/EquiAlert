/**
 * SerpAPI Google Finance integration
 * Documentation: https://serpapi.com/google-finance-api
 */

import { checkRateLimit, incrementUsage } from "./rateLimiter";
import { getCachedPrice, setCachedPrice } from "./priceCache";

interface SerpApiStockPrice {
  price: number;
  currency: string;
  symbol: string;
  exchange: string;
  change?: number;
  changePercent?: number;
}

interface SerpApiSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

/**
 * Fetch current stock price from SerpAPI Google Finance
 * @param symbol - Stock symbol (e.g., "RELIANCE:NSE", "TCS:NSE")
 * @returns Stock price data or null if not found
 */
export async function getStockPrice(symbol: string, useCache: boolean = true): Promise<SerpApiStockPrice | null> {
  // For Indian stocks, ensure the symbol format is correct (e.g., "RELIANCE:NSE")
  const formattedSymbol = symbol.includes(':') ? symbol : `${symbol}:NSE`;
  
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedPrice(formattedSymbol);
    if (cached) {
      const ageMinutes = Math.floor((Date.now() - cached.timestamp) / (60 * 1000));
      console.log(`📦 Using cached price for ${formattedSymbol} (${ageMinutes} min old)`);
      return {
        price: cached.price,
        currency: cached.currency,
        symbol: cached.symbol,
        exchange: cached.exchange,
        change: cached.change,
        changePercent: cached.changePercent,
      };
    }
  }
  
  // Check rate limit before making request
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    console.error(rateLimitCheck.message);
    // If rate limited and cache available (even expired), return it
    const cached = getCachedPrice(formattedSymbol);
    if (cached) {
      console.warn(`⚠️  Rate limited, serving stale cache for ${formattedSymbol}`);
      return {
        price: cached.price,
        currency: cached.currency,
        symbol: cached.symbol,
        exchange: cached.exchange,
        change: cached.change,
        changePercent: cached.changePercent,
      };
    }
    return null;
  }

  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    console.error("SERPAPI_KEY not configured");
    return null;
  }

  try {
    
    const params = new URLSearchParams({
      engine: 'google_finance',
      q: formattedSymbol,
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    
    // Increment usage counter after successful API call
    incrementUsage();
    
    if (!response.ok) {
      console.error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error(`SerpAPI error: ${data.error}`);
      return null;
    }

    // Extract price from summary
    if (data.summary) {
      const price = data.summary.extracted_price || parseFloat(data.summary.price);
      
      if (price && !isNaN(price)) {
        const currency = data.summary.currency || 'INR';
        const exchange = data.summary.exchange || 'NSE';
        
        // Store in cache (will preserve baseline if exists, or set to current price)
        setCachedPrice(formattedSymbol, price, currency, exchange);
        
        // Get the updated cache with change calculations
        const cached = getCachedPrice(formattedSymbol);
        
        return {
          price: price,
          currency: currency,
          symbol: data.summary.stock || formattedSymbol,
          exchange: exchange,
          change: cached?.change,
          changePercent: cached?.changePercent,
        };
      }
    }

    console.log(`No price data found for ${formattedSymbol}`);
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Search for stocks using SerpAPI Google Finance
 * @param query - Search query (company name or symbol)
 * @returns Array of search results
 */
export async function searchStocks(query: string): Promise<SerpApiSearchResult[]> {
  // Check rate limit before making request
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    console.error(rateLimitCheck.message);
    return [];
  }

  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    console.error("SERPAPI_KEY not configured");
    return [];
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_finance',
      q: query,
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    
    // Increment usage counter after successful API call
    incrementUsage();
    
    if (!response.ok) {
      console.error(`SerpAPI search failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    if (data.error) {
      console.error(`SerpAPI error: ${data.error}`);
      return [];
    }

    // Parse search results from discover_more or markets
    const results: SerpApiSearchResult[] = [];
    
    // Check discover_more section first
    if (data.discover_more && Array.isArray(data.discover_more)) {
      for (const section of data.discover_more) {
        if (section.items && Array.isArray(section.items)) {
          for (const item of section.items) {
            if (item.stock && item.name) {
              results.push({
                symbol: item.stock,
                name: item.name,
                exchange: item.stock.split(':')[1] || 'NSE',
                type: 'Stock',
              });
            }
          }
        }
      }
    }
    
    // Also check markets section (if it's an object with market categories)
    if (data.markets && typeof data.markets === 'object') {
      const marketKeys = Object.keys(data.markets);
      for (const key of marketKeys) {
        const market = data.markets[key];
        if (Array.isArray(market)) {
          for (const result of market) {
            if (result.stock && result.name) {
              results.push({
                symbol: result.stock,
                name: result.name,
                exchange: result.exchange || key.toUpperCase(),
                type: result.type || 'Stock',
              });
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error);
    return [];
  }
}

/**
 * Get market trends for Indian indices
 * @returns Market data for NIFTY 50, SENSEX, etc.
 */
export async function getMarketTrends() {
  // Check rate limit before making request
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    console.error(rateLimitCheck.message);
    return null;
  }

  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    console.error("SERPAPI_KEY not configured");
    return null;
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_finance_markets',
      trend: 'indexes',
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    
    // Increment usage counter after successful API call
    incrementUsage();
    
    if (!response.ok) {
      console.error(`SerpAPI market trends failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error(`SerpAPI error: ${data.error}`);
      return null;
    }

    return data.market_trends || data.indexes || [];
  } catch (error) {
    console.error("Error fetching market trends:", error);
    return null;
  }
}
