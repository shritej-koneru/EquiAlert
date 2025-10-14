# EquiAlert Documentation

Welcome to the EquiAlert documentation! This directory contains all technical documentation, guides, and design specifications for the project.

## 📚 Documentation Index

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and quick start
- **[Setup Guide](guides/setup.md)** - Complete installation and configuration guide
- **[API Keys Guide](api/api-keys.md)** - How to obtain all required API keys
- **[Contributing Guide](guides/CONTRIBUTING.md)** - How to contribute to EquiAlert

### 📖 User Guides
- **[Watchlist Feature](guides/watchlist.md)** - Track your favorite stocks and set alerts
- **[AI Chatbot Guide](guides/chatbot.md)** - Use the AI assistant for market insights
- **[WhatsApp Notifications](guides/notifications.md)** - Set up alerts and messages to your phone
- **[Stock Search](guides/setup.md#testing)** - Find and add stocks to your watchlist

### 🔌 API Documentation
- **[API Keys Overview](api/api-keys.md)** - Index of all external services
  - **[SerpAPI Guide](api/serpapi.md)** - Stock price API (Google Finance)
  - **[NewsAPI Guide](api/newsapi.md)** - Financial news aggregation
  - **[Groq AI Guide](api/groq.md)** - AI chatbot (Llama 3.3 70B)
  - **[Twilio Guide](api/twilio.md)** - WhatsApp notifications
  - **[Database Guide](api/database.md)** - PostgreSQL setup
- **[API Endpoints Reference](api/endpoints.md)** - Complete REST API documentation

### 🏗️ Architecture & Design
- **[Code Organization](architecture/CODE_ORGANIZATION.md)** - Project structure and import conventions
- **[SerpAPI Integration](architecture/SERPAPI_INTEGRATION.md)** - Real-time stock price system
- **[Price Caching System](architecture/PRICE_CACHING_SYSTEM.md)** - Caching architecture and optimization
- **[Design Guidelines](guides/design_guidelines.md)** - UI/UX standards and components

## 🏗️ Architecture Overview

```
EquiAlert/
├── client/src/          # React frontend (Vite + TypeScript)
│   ├── components/     # React components (TopBar, StockChart, etc.)
│   ├── pages/         # Page components (Home, Stocks, News)
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utilities and helpers
├── server/             # Express backend (Node.js + TypeScript)
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API route definitions
│   ├── serpapi.ts     # Stock price integration
│   ├── priceCache.ts  # Caching system
│   ├── rateLimiter.ts # Rate limiting
│   └── ...            # Other server modules
├── shared/            # Shared types and schemas
│   └── schema.ts      # Database schema & TypeScript types
└── docs/              # Documentation (you are here)
    ├── api/           # API documentation
    ├── guides/        # User & developer guides
    └── architecture/  # Technical architecture docs
```

## 🔑 Key Features Documented

### 📊 Stock Market Features
- **Real-time Prices** - Live data from Google Finance via SerpAPI
- **Smart Caching** - 30-minute TTL reduces API usage by 69%
- **Rate Limiting** - Built-in 250 requests/month limit
- **Price Alerts** - WhatsApp notifications when targets are reached
- **Watchlist** - Track your favorite stocks in one place

### 📰 News & Information
- **Market News** - Latest financial news from NewsAPI
- **Category Filtering** - Market, Stocks, Economy, Crypto
- **AI Chatbot** - Groq AI (Llama 3.3 70B) for market insights
- **Real-time Updates** - Fresh data every 5 minutes

### 🔔 Notifications
- **WhatsApp Alerts** - Via Twilio integration
- **Scheduled Updates** - Daily market summaries
- **Price Targets** - Custom alerts per stock
- **Significant Changes** - Automatic alerts for >5% moves

### 🎨 User Experience
- **Dark Mode Design** - Professional financial dashboard
- **Responsive Layout** - Works on mobile, tablet, desktop
- **Fast & Smooth** - Optimized bundle, lazy loading
- **Type Safe** - Full TypeScript coverage

## 📖 Quick Links by Role

### 👨‍💻 For Developers
- **Start Here:** [Setup Guide](guides/setup.md) - Get up and running in 5 minutes
- [Code Organization](architecture/CODE_ORGANIZATION.md) - Understand the codebase structure
- [API Endpoints](api/endpoints.md) - Available REST APIs
- [Contributing Guide](guides/CONTRIBUTING.md) - How to contribute

### 🔌 For API Integration
- **Start Here:** [API Keys Guide](api/api-keys.md) - Get all required keys
- [SerpAPI Integration](architecture/SERPAPI_INTEGRATION.md) - Stock price API
- [Price Caching](architecture/PRICE_CACHING_SYSTEM.md) - Optimization strategies
- [Endpoints Reference](api/endpoints.md) - Complete API docs

### 🎨 For Designers
- **Start Here:** [Design Guidelines](guides/design_guidelines.md) - UI/UX standards
- [Component Library](guides/design_guidelines.md) - shadcn/ui components
- [Color Scheme](guides/design_guidelines.md) - Dark mode palette
- [Responsive Design](guides/design_guidelines.md) - Mobile-first approach

### 📱 For Users
- **Start Here:** [Setup Guide](guides/setup.md) - Installation steps
- [Watchlist Guide](guides/watchlist.md) - Track your stocks
- [Price Alerts](guides/watchlist.md#price-alerts) - Get WhatsApp notifications
- [Using the Chatbot](api/endpoints.md#chatbot-endpoints) - Ask market questions

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. When making significant changes:

1. Update relevant documentation files
2. Keep code examples current
3. Document breaking changes
4. Update this index if adding new docs

## 📝 License

See [LICENSE](../LICENSE) file in the project root.

---

**Last Updated:** October 2025
