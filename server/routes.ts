import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { getTwilioClient, getTwilioFromPhoneNumber } from "./twilio";
import { priceUpdater } from "./priceUpdater";
import { notificationScheduler } from "./scheduler";
import { searchStocks, getStockPrice } from "./serpapi";
import { getUsageStats, resetUsage } from "./rateLimiter";
import { getAllCachedPrices, getCacheStats } from "./priceCache";
import { getStockPriceFromGoogle, getMultipleStockPrices } from "./googleFinance";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user-1";

  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile(DEMO_USER_ID);
      if (profile) {
        res.json(profile);
      } else {
        res.json({ userId: DEMO_USER_ID, name: "", profession: "", phoneNumber: "" });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const { name, profession, phoneNumber } = req.body;
      const existing = await storage.getProfile(DEMO_USER_ID);
      
      let profile;
      if (existing) {
        profile = await storage.updateProfile(DEMO_USER_ID, { name, profession, phoneNumber });
      } else {
        profile = await storage.createProfile({ userId: DEMO_USER_ID, name, profession, phoneNumber });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Profile save error:', error);
      res.status(500).json({ message: 'Failed to save profile' });
    }
  });

  app.get("/api/watchlist", async (req, res) => {
    try {
      const watchlist = await storage.getWatchlist(DEMO_USER_ID);
      res.json(watchlist);
    } catch (error) {
      console.error('Watchlist fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const { symbol, name, price, change, changePercent } = req.body;
      const item = await storage.addToWatchlist({
        userId: DEMO_USER_ID,
        symbol,
        name,
        price,
        change,
        changePercent,
        baselinePrice: price,
        hasAlert: false,
      });
      res.json(item);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeFromWatchlist(id, DEMO_USER_ID);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: 'Watchlist item not found' });
      }
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

  app.patch("/api/watchlist/:id/alert", async (req, res) => {
    try {
      const { id } = req.params;
      const { hasAlert } = req.body;
      const success = await storage.updateWatchlistAlert(id, DEMO_USER_ID, hasAlert);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: 'Watchlist item not found' });
      }
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({ message: 'Failed to update alert' });
    }
  });

  app.get("/api/stocks/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query required' });
      }

      const results = await searchStocks(q);
      res.json({ results });
    } catch (error) {
      console.error('Stock search error:', error);
      res.status(500).json({ message: 'Failed to search stocks' });
    }
  });

  app.get("/api/stocks/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol required' });
      }

      // Use cache by default (will fetch if not cached)
      const priceData = await getStockPrice(symbol, true);
      
      if (!priceData) {
        return res.status(404).json({ message: 'Stock not found or price unavailable' });
      }

      res.json(priceData);
    } catch (error) {
      console.error('Stock price fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch stock price' });
    }
  });

  // New endpoint: Fetch stock price using Google Finance scraper
  app.get("/api/stocks/google/:ticker/:exchange", async (req, res) => {
    try {
      const { ticker, exchange } = req.params;
      
      if (!ticker || !exchange) {
        return res.status(400).json({ message: 'Ticker and exchange required' });
      }

      const priceData = await getStockPriceFromGoogle(ticker, exchange);
      
      if (priceData.error) {
        return res.status(404).json({ message: priceData.error });
      }

      res.json(priceData);
    } catch (error) {
      console.error('Google Finance fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch stock price from Google Finance' });
    }
  });

  // New endpoint: Fetch multiple stock prices at once
  app.post("/api/stocks/google/batch", async (req, res) => {
    try {
      const { stocks } = req.body;
      
      if (!Array.isArray(stocks) || stocks.length === 0) {
        return res.status(400).json({ message: 'Stocks array required' });
      }

      const priceData = await getMultipleStockPrices(stocks);
      res.json({ stocks: priceData });
    } catch (error) {
      console.error('Batch Google Finance fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch stock prices' });
    }
  });

  app.get("/api/stocks/available", async (req, res) => {
    try {
      // Popular Indian stocks to display on Stocks page
      const popularStocks = [
        { symbol: "HDFCBANK", name: "HDFC Bank" },
        { symbol: "ICICIBANK", name: "ICICI Bank" },
        { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
        { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
        { symbol: "NESTLEIND", name: "Nestlé India" },
        { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
        { symbol: "BAJAJ-AUTO", name: "Bajaj Auto" },
        { symbol: "MARUTI", name: "Maruti Suzuki" },
        { symbol: "TITAN", name: "Titan Company" },
        { symbol: "ASIANPAINT", name: "Asian Paints" },
      ];

      // Get cached prices or fetch for any that aren't cached
      const stocksWithPrices = await Promise.all(
        popularStocks.map(async (stock) => {
          const priceData = await getStockPrice(stock.symbol, true);
          if (priceData) {
            return {
              symbol: stock.symbol,
              name: stock.name,
              price: priceData.price,
              currency: priceData.currency,
              change: priceData.change || 0,
              changePercent: priceData.changePercent || 0,
            };
          }
          return null;
        })
      );

      // Filter out any nulls
      const validStocks = stocksWithPrices.filter(s => s !== null);
      
      res.json(validStocks);
    } catch (error) {
      console.error('Available stocks fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch available stocks' });
    }
  });

  app.get("/api/serpapi/usage", async (req, res) => {
    try {
      const usageStats = getUsageStats();
      const cacheStats = getCacheStats();
      res.json({
        rateLimit: usageStats,
        cache: cacheStats,
      });
    } catch (error) {
      console.error('Usage stats error:', error);
      res.status(500).json({ message: 'Failed to get usage stats' });
    }
  });

  app.post("/api/serpapi/reset", async (req, res) => {
    try {
      resetUsage();
      const stats = getUsageStats();
      res.json({ 
        success: true, 
        message: 'Usage counter reset successfully',
        stats 
      });
    } catch (error) {
      console.error('Usage reset error:', error);
      res.status(500).json({ message: 'Failed to reset usage' });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.GROQ_API_KEY;
  const newsApiKey = process.env.NEWSAPI_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "Groq API key not configured" });
      }

      const openai = new OpenAI({ 
        baseURL: "https://api.groq.com/openai/v1", 
        apiKey: apiKey 
      });

      let newsContext = '';
      if (newsApiKey) {
        try {
          const newsParams = new URLSearchParams({
            apiKey: newsApiKey,
            pageSize: '5',
            language: 'en',
            sortBy: 'publishedAt',
            q: 'india stock market OR nifty OR sensex OR banking OR reliance OR tcs',
          });
          
          const newsResponse = await fetch(`https://newsapi.org/v2/everything?${newsParams.toString()}`);
          const newsData = await newsResponse.json();
          
          if (newsData.status === 'ok' && newsData.articles) {
            const recentNews = newsData.articles.slice(0, 3).map((article: any) => 
              `- ${article.title} (${article.source.name})`
            ).join('\n');
            newsContext = `\n\nRecent Market News:\n${recentNews}`;
          }
        } catch (newsError) {
          console.error('News API error (non-blocking):', newsError);
        }
      }

      const systemPrompt = `You are a highly knowledgeable AI assistant specializing in Indian stock market analysis. You have expertise in:
- NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) markets
- Major indices: NIFTY 50, SENSEX, Bank NIFTY
- Sector analysis: Banking, IT, Energy, Pharma, Automobile
- Major Indian companies: Reliance, TCS, Infosys, HDFC Bank, ICICI Bank, etc.
- Technical analysis, fundamental analysis, and market trends
- Economic indicators affecting Indian markets

Your responses should be:
1. Accurate and based on market fundamentals
2. Concise yet informative (2-4 sentences)
3. Actionable with specific insights
4. Grounded in current market context when available
5. Focused on Indian market specifics (prices in ₹, Indian time zones)

When asked about stock prices or specific companies:
- Provide context about the sector and market conditions
- Mention relevant news or events if applicable
- Offer balanced perspective on risks and opportunities

${context ? `\nUser's Current Watchlist: ${context}` : ''}${newsContext}`;

      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const botMessage = response.choices[0].message.content;

      const profile = await storage.getProfile(DEMO_USER_ID);
      if (profile && profile.phoneNumber) {
        try {
          const client = await getTwilioClient();
          const fromNumber = await getTwilioFromPhoneNumber();

          if (fromNumber) {
            const toPhoneNumber = profile.phoneNumber.startsWith('+') 
              ? profile.phoneNumber 
              : `+${profile.phoneNumber}`;

            await client.messages.create({
              body: `🤖 Market Assistant: ${botMessage}`,
              from: fromNumber,
              to: toPhoneNumber
            });
          }
        } catch (smsError) {
          console.error('SMS notification error (non-blocking):', smsError);
        }
      }

      res.json({ message: botMessage });
    } catch (error) {
      console.error('Groq API error:', error);
      res.status(500).json({ message: 'Failed to get response from Groq AI' });
    }
  });

  app.post("/api/notify", async (req, res) => {
    try {
      const { message, stockSymbol, changePercent } = req.body;
      
      const profile = await storage.getProfile(DEMO_USER_ID);
      if (!profile || !profile.phoneNumber) {
        return res.status(400).json({ message: 'Phone number not configured in profile' });
      }

      const client = await getTwilioClient();
      const fromNumber = await getTwilioFromPhoneNumber();

      if (!fromNumber) {
        return res.status(500).json({ message: 'Twilio phone number not configured' });
      }

      const toPhoneNumber = profile.phoneNumber.startsWith('+') 
        ? profile.phoneNumber 
        : `+${profile.phoneNumber}`;

      await client.messages.create({
        body: message || `Stock Alert: ${stockSymbol} ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(2)}%`,
        from: fromNumber,
        to: toPhoneNumber
      });

      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('SMS notification error:', error);
      res.status(500).json({ message: 'Failed to send notification' });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const { category, q } = req.query;
  const apiKey = process.env.NEWSAPI_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "NewsAPI key not configured" });
      }

      const categoryMap: Record<string, { category?: string; query?: string; country?: string; endpoint?: string }> = {
        'India': { query: 'india (stock market OR economy OR business OR finance OR nifty OR sensex)', endpoint: 'everything' },
        'Global': { query: 'stock market OR economy OR finance', endpoint: 'everything' },
        'Technology': { query: 'india technology OR tech OR IT OR software OR startup', endpoint: 'everything' },
        'Banking': { query: 'india banking OR financial services OR banks', endpoint: 'everything' },
        'Energy': { query: 'india energy OR renewable energy OR oil gas', endpoint: 'everything' },
      };

      const params = new URLSearchParams({
        apiKey,
        pageSize: '20',
      });

      let endpoint = 'https://newsapi.org/v2/everything';
      let useTopHeadlines = false;
      
      if (category && category !== 'All') {
        const mapping = categoryMap[category.toString()];
        if (mapping) {
          if (mapping.endpoint === 'top-headlines') {
            endpoint = 'https://newsapi.org/v2/top-headlines';
            useTopHeadlines = true;
            if (mapping.category) {
              params.append('category', mapping.category);
            }
            if (mapping.country) {
              params.append('country', mapping.country);
            }
          } else {
            params.append('language', 'en');
            params.append('sortBy', 'publishedAt');
            if (mapping.query) {
              params.append('q', mapping.query);
            }
          }
        }
      } else if (q) {
        params.append('language', 'en');
        params.append('sortBy', 'publishedAt');
        params.append('q', q.toString());
      } else {
        params.append('language', 'en');
        params.append('sortBy', 'publishedAt');
        params.append('q', 'india stock market OR nifty OR sensex OR banking');
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'error') {
        return res.status(400).json({ message: data.message || 'Failed to fetch news' });
      }

      const articles = data.articles?.map((article: any) => ({
        id: article.url,
        title: article.title,
        source: article.source.name,
        timestamp: new Date(article.publishedAt).toLocaleString('en-IN', {
          hour: 'numeric',
          minute: 'numeric',
          day: 'numeric',
          month: 'short',
        }),
        description: article.description || '',
        url: article.url,
        imageUrl: article.urlToImage,
      })) || [];

      res.json({ articles });
    } catch (error) {
      console.error('News API error:', error);
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });

  const httpServer = createServer(app);

  priceUpdater.start();
  notificationScheduler.start();

  return httpServer;
}
