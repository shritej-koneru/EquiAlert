/**
 * Google Finance Web Scraper
 * Port of the Python stock_logic.py to TypeScript
 * Scrapes stock prices directly from Google Finance
 */

import * as cheerio from 'cheerio';

interface GoogleFinanceStockPrice {
  ticker: string;
  exchange: string;
  price: number;
  currency: string;
  error?: string;
}

/**
 * Fetch stock price by scraping Google Finance
 * @param ticker - Stock symbol (e.g., "AAPL", "RELIANCE")
 * @param exchange - Exchange code (e.g., "NASDAQ", "NSE")
 * @returns Stock price data or error
 */
export async function getStockPriceFromGoogle(
  ticker: string, 
  exchange: string
): Promise<GoogleFinanceStockPrice> {
  const upperTicker = ticker.toUpperCase();
  const upperExchange = exchange.toUpperCase();
  const url = `https://www.google.com/finance/quote/${upperTicker}:${upperExchange}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return {
        ticker: upperTicker,
        exchange: upperExchange,
        price: 0,
        currency: 'INR',
        error: `HTTP ${response.status}: Failed to fetch from Google Finance`
      };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try multiple selectors for the current price
    let priceText = '';
    let priceElement;
    
    // Try different selectors that Google Finance uses
    const selectors = [
      'div.YMlKec.fxKbKc',
      '.YMlKec.fxKbKc',
      'div[data-last-price]',
      'div.YMlKec',
    ];
    
    for (const selector of selectors) {
      priceElement = $(selector).first();
      if (priceElement && priceElement.length > 0) {
        priceText = priceElement.text().trim();
        if (priceText) break;
      }
    }
    
    // Also try data attribute
    if (!priceText) {
      const dataPrice = $('div[data-last-price]').attr('data-last-price');
      if (dataPrice) {
        priceText = dataPrice;
      }
    }
    
    if (!priceText) {
      return {
        ticker: upperTicker,
        exchange: upperExchange,
        price: 0,
        currency: 'INR',
        error: 'Invalid ticker or exchange - price element not found'
      };
    }
    
    // Remove currency symbol and commas, then parse
    // Price format examples: "$234.56", "₹1,234.56"
    const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
    const price = parseFloat(cleanPrice);
    
    if (isNaN(price)) {
      return {
        ticker: upperTicker,
        exchange: upperExchange,
        price: 0,
        currency: 'INR',
        error: `Failed to parse price from Google Finance. Raw text: ${priceText}`
      };
    }
    
    // Determine currency based on exchange
    const currency = upperExchange === 'NSE' || upperExchange === 'BSE' ? 'INR' : 'USD';
    
    return {
      ticker: upperTicker,
      exchange: upperExchange,
      price,
      currency
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${upperTicker}:${upperExchange}:`, error);
    return {
      ticker: upperTicker,
      exchange: upperExchange,
      price: 0,
      currency: 'INR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetch multiple stock prices in parallel
 * @param stocks - Array of {ticker, exchange} pairs
 * @returns Array of stock price data
 */
export async function getMultipleStockPrices(
  stocks: Array<{ ticker: string; exchange: string }>
): Promise<GoogleFinanceStockPrice[]> {
  const promises = stocks.map(stock => 
    getStockPriceFromGoogle(stock.ticker, stock.exchange)
  );
  
  return Promise.all(promises);
}
