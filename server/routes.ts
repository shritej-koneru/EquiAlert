import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { getTwilioClient, getTwilioFromPhoneNumber } from "./twilio";
import { priceUpdater } from "./priceUpdater";
import { notificationScheduler } from "./scheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user-1";

  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile(DEMO_USER_ID);
      if (profile) {
        res.json(profile);
      } else {
        res.json({ userId: DEMO_USER_ID, name: "", profession: "", whatsappNumber: "" });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const { name, profession, whatsappNumber } = req.body;
      const existing = await storage.getProfile(DEMO_USER_ID);
      
      let profile;
      if (existing) {
        profile = await storage.updateProfile(DEMO_USER_ID, { name, profession, whatsappNumber });
      } else {
        profile = await storage.createProfile({ userId: DEMO_USER_ID, name, profession, whatsappNumber });
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
      if (profile && profile.whatsappNumber) {
        try {
          const client = await getTwilioClient();
          const fromNumber = await getTwilioFromPhoneNumber();

          if (fromNumber) {
            const whatsappNumber = profile.whatsappNumber.startsWith('+') 
              ? profile.whatsappNumber 
              : `+${profile.whatsappNumber}`;

            await client.messages.create({
              body: `🤖 Market Assistant: ${botMessage}`,
              from: `whatsapp:${fromNumber}`,
              to: `whatsapp:${whatsappNumber}`
            });
          }
        } catch (whatsappError) {
          console.error('WhatsApp notification error (non-blocking):', whatsappError);
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
      if (!profile || !profile.whatsappNumber) {
        return res.status(400).json({ message: 'WhatsApp number not configured in profile' });
      }

      const client = await getTwilioClient();
      const fromNumber = await getTwilioFromPhoneNumber();

      if (!fromNumber) {
        return res.status(500).json({ message: 'Twilio phone number not configured' });
      }

      const whatsappNumber = profile.whatsappNumber.startsWith('+') 
        ? profile.whatsappNumber 
        : `+${profile.whatsappNumber}`;

      await client.messages.create({
        body: message || `Stock Alert: ${stockSymbol} ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(2)}%`,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${whatsappNumber}`
      });

      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('WhatsApp notification error:', error);
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
