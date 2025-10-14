# 📈 EquiAlert

> **Professional Dark-Mode Stock Market Dashboard for Indian Markets**

EquiAlert is a full-stack, real-time stock market web application specifically designed for Indian stock markets (NSE/BSE). Built with modern web technologies, it provides comprehensive market tracking, news aggregation, personalized watchlists, and AI-powered market insights through an intelligent chatbot interface.

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time Stock Tracking** - Live price updates with color-coded market indicators
- **Indian Market Focus** - NSE, BSE, NIFTY 50, SENSEX coverage
- **Personal Watchlists** - Add, remove, and manage your favorite stocks
- **Price Alerts** - WhatsApp notifications for significant price movements
- **Market News** - Curated Indian financial news with category filtering
- **AI Chatbot** - Market insights powered by Groq AI (Llama 3.3 70B)

### 📱 **User Experience**
- **Dark Mode Design** - Professional financial dashboard aesthetics
- **Responsive Layout** - Optimized for mobile, tablet, and desktop
- **Real-time Updates** - Live price feeds and market status indicators
- **Smooth Animations** - Polished micro-interactions and transitions
- **WhatsApp Integration** - Scheduled market updates and alerts

### 🔧 **Technical Features**
- **TypeScript** - Full type safety across frontend and backend
- **Real-time Data** - WebSocket connections for live updates
- **Database Integration** - PostgreSQL with Drizzle ORM
- **API Integration** - NewsAPI for market news, Groq for AI insights
- **Session Management** - Secure user authentication and profiles

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **PostgreSQL** database (or Neon serverless)
- **API Keys** for external services

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# External APIs
NEWSAPI_KEY="your_newsapi_key"
GROQ_API_KEY="your_groq_api_key"

# Twilio WhatsApp (Optional)
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+1234567890"
WHATSAPP_NUMBER="+919876543210"

# Server Configuration
PORT=5000
NODE_ENV="development"
```

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/shritej-koneru/EquiAlert.git
cd EquiAlert

# Install dependencies
npm install

# Setup database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript for component development
- **Vite** as build tool with HMR for fast development
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** for utility-first styling
- **Radix UI** + **shadcn/ui** for accessible component primitives

### **Backend Stack**
- **Express.js** with TypeScript for API server
- **Drizzle ORM** with PostgreSQL for data persistence
- **Neon Database** for serverless PostgreSQL hosting
- **WebSocket** integration for real-time price updates
- **Zod** for runtime schema validation

### **External Integrations**
- **NewsAPI** - Financial news aggregation
- **Groq AI** - Market analysis chatbot (Llama 3.3 70B)
- **Twilio** - WhatsApp messaging for alerts
- **Stock APIs** - Real-time Indian market data

### **Project Structure**

```
EquiAlert/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and config
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Main server entry
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database layer
│   └── scheduler.ts      # Background tasks
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── package.json          # Dependencies and scripts
```

## 📊 API Endpoints

### **Stock Management**
- `GET /api/watchlist` - Fetch user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `PATCH /api/watchlist/:id/alert` - Toggle price alerts

### **User Profile**
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update profile settings

### **Market Data**
- `GET /api/news` - Fetch market news with filtering
- `POST /api/chat` - AI chatbot interactions
- `POST /api/notify` - Send WhatsApp notifications

## 🎨 Design System

### **Color Palette**
- **Dark Backgrounds** - True dark theme (HSL 12 8% 8-16%)
- **Market Indicators** - Green (#00FF7F) for gains, Red (#FF4C4C) for losses
- **Brand Colors** - Professional blue (#2563EB) for primary actions
- **Typography** - SF Pro Display / Roboto with monospace for prices

### **Component Library**
- **Navigation** - Fixed top bar and bottom navigation
- **Cards** - Elevated surfaces for stock data and news
- **Charts** - Interactive price charts with multiple timeframes
- **Modals** - Full-screen overlays for detailed views
- **Notifications** - Toast messages and WhatsApp alerts

## 🔧 Configuration

### **Database Schema**
The application uses Drizzle ORM with the following core tables:
- `users` - User authentication
- `profiles` - User profile information
- `watchlist` - Personal stock tracking

### **Scheduled Notifications**
Automated WhatsApp messages sent at:
- 9:15 AM - Market opening
- Throughout the day - Stock updates for major companies
- 3:30 PM - Market closing
- 6:36 PM - Evening reminder

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Drizzle Kit** for database migrations

## 📱 Mobile Experience

EquiAlert is designed mobile-first with:
- **Touch-optimized** interactions and gestures
- **Responsive design** across all screen sizes
- **Progressive Web App** capabilities
- **Offline support** for cached data
- **Native-like** navigation patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### 🚀 Getting Started
- **[Setup Guide](docs/guides/setup.md)** - Complete installation and configuration (5 minutes)
- **[API Keys Guide](docs/api/api-keys.md)** - How to obtain all required API keys
- **[API Endpoints](docs/api/endpoints.md)** - REST API reference with examples

### 📖 Feature Guides
- **[Watchlist Feature](docs/guides/watchlist.md)** - Track stocks and set price alerts
- **[Contributing Guide](docs/guides/CONTRIBUTING.md)** - How to contribute to the project

### 🏗️ Architecture
- **[Code Organization](docs/architecture/CODE_ORGANIZATION.md)** - Project structure and import conventions
- **[SerpAPI Integration](docs/architecture/SERPAPI_INTEGRATION.md)** - Real-time stock price system
- **[Price Caching System](docs/architecture/PRICE_CACHING_SYSTEM.md)** - Optimization and caching
- **[Design Guidelines](docs/guides/design_guidelines.md)** - UI/UX standards and components

**📑 [Complete Documentation Index](docs/README.md)** - View all documentation

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [github.com/shritej-koneru/EquiAlert](https://github.com/shritej-koneru/EquiAlert)
- **Issues**: [Report bugs or request features](https://github.com/shritej-koneru/EquiAlert/issues)
- **Documentation**: [Full documentation](docs/README.md)

## 💡 Technical Highlights

- **Real-time Architecture** - WebSocket connections for live price feeds
- **Type Safety** - End-to-end TypeScript for reduced runtime errors
- **Modern Stack** - Latest React, Express, and database technologies
- **Performance** - Optimized bundle sizes and lazy loading
- **Accessibility** - WCAG compliant with keyboard navigation
- **Security** - Secure session handling and input validation

---

<div align="center">

**Built with ❤️ for the Indian Stock Market Community**

[⭐ Star this repo](https://github.com/shritej-koneru/EquiAlert/stargazers) • [🐛 Report Bug](https://github.com/shritej-koneru/EquiAlert/issues) • [💡 Request Feature](https://github.com/shritej-koneru/EquiAlert/issues)

</div>
