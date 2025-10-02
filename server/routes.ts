import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/news", async (req, res) => {
    try {
      const { category, q } = req.query;
      const apiKey = process.env.NEWSAPI_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "NewsAPI key not configured" });
      }

      const categoryMap: Record<string, { category?: string; query?: string; country?: string; endpoint?: string }> = {
        'India': { category: 'general', country: 'in', endpoint: 'top-headlines' },
        'Global': { query: 'stock market OR economy OR finance', endpoint: 'everything' },
        'Technology': { category: 'technology', country: 'in', endpoint: 'top-headlines' },
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

  return httpServer;
}
