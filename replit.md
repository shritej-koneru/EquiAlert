# EQUIALERT - Indian Stock Market Tracker

## Overview

EQUIALERT is a full-stack, dark-mode stock market web application focused on Indian stocks. The platform provides real-time stock tracking, market news, watchlist management, and AI-powered insights through a chatbot interface. The application emphasizes professional financial dashboard aesthetics with color-coded market indicators and smooth animations for an optimal trading experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (Home, News, Stocks pages)

**UI Component System**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tooltips, etc.)
- shadcn/ui design system following the "new-york" style variant
- Tailwind CSS for utility-first styling with custom dark mode theme
- Custom design tokens for financial dashboard aesthetics (green/red market indicators, deep dark backgrounds)

**State Management & Data Fetching**
- TanStack React Query for server state management, caching, and API synchronization
- Local component state using React hooks for UI interactions
- Real-time data updates configured with polling/refetch strategies

**Charting & Visualization**
- Recharts library for stock price charts with multiple time ranges (1D, 1W, 1M, 1Y, 5Y)
- Embla Carousel for horizontal stock ticker scrolling
- Custom chart components with color-coded positive/negative indicators

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- ESM module system for modern JavaScript features

**Development Environment**
- Custom Vite integration for middleware-mode development
- Hot Module Replacement (HMR) over WebSocket connection
- Replit-specific plugins for development experience enhancements

**Data Layer**
- In-memory storage implementation (MemStorage) for development/prototyping
- Drizzle ORM configured for PostgreSQL database migrations
- Neon serverless database adapter for production deployment
- Zod schema validation for runtime type checking

**API Design**
- RESTful endpoints under `/api` namespace
- News aggregation endpoint (`/api/news`) with category filtering and search
- Structured error handling with appropriate HTTP status codes
- Request/response logging middleware for debugging

### Database Schema

**User Management**
- Users table with UUID primary keys, username/password authentication
- Extensible schema design using Drizzle ORM table definitions
- PostgreSQL-specific features (gen_random_uuid) for ID generation

**Planned Extensions**
- Watchlist persistence for user stock selections
- Alert configuration storage for price notifications
- User preferences and profile data

### Design System

**Color Palette**
- Dark mode foundation with HSL color space for theming
- Market indicators: Green (#00FF7F) for positive, Red (#FF4C4C) for negative
- Professional blue (#2563EB) for primary brand elements
- Layered background system (12% → 16% lightness) for depth perception

**Typography**
- System font stack: SF Pro Display (Apple), Roboto (Android/Web)
- Monospace fonts for numerical data (stock prices, tickers)
- Responsive type scale from text-xs to text-3xl

**Interaction Patterns**
- Hover elevate effects for interactive elements
- Active state feedback with elevation changes
- Smooth transitions using Tailwind animation utilities
- Fixed positioning for TopBar, BottomNav, and ChatbotButton

## External Dependencies

### Third-Party APIs

**NewsAPI Integration**
- API key configuration via `NEWSAPI_KEY` environment variable
- Endpoints: `/v2/top-headlines` for category-based news, `/v2/everything` for search
- Filters: Country (India), language (English), category-based filtering
- Rate limiting and error handling for API responses

**Stock Data (Planned)**
- Indian stock market APIs for real-time prices and historical data
- Market status detection (NSE/BSE trading hours)
- Currency exchange rates (USD/INR)

**AI Chatbot (Planned)**
- Grok API integration for market insights and conversational AI
- WhatsApp Business API for alert notifications

### Database & Infrastructure

**Neon PostgreSQL**
- Serverless PostgreSQL database with edge networking
- Connection pooling via `@neondatabase/serverless`
- Environment variable configuration (`DATABASE_URL`)

**Session Management**
- `connect-pg-simple` for PostgreSQL-backed session storage
- Secure session handling for user authentication

### Development Tools

**Replit Platform Integration**
- Vite plugin ecosystem for Replit-specific features
- Runtime error modal overlay for debugging
- Code cartographer for project navigation
- Development banner for environment awareness

### Utility Libraries

- `date-fns` for date formatting and manipulation
- `clsx` and `tailwind-merge` for conditional class composition
- `class-variance-authority` for component variant management
- `nanoid` for unique ID generation