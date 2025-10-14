# Setup Guide

Complete guide to setting up EquiAlert for development or production.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **PostgreSQL** database (or Neon account)
- **Git** for version control
- **Text editor** (VS Code recommended)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/shritej-koneru/EquiAlert.git
cd EquiAlert
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
# Required
DATABASE_URL="postgresql://user:pass@host:5432/db"
SERPAPI_KEY="your_serpapi_key"
NEWSAPI_KEY="your_newsapi_key"

# Optional
GROQ_API_KEY="your_groq_key"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_FROM_PHONE_NUMBER="whatsapp:+14155238886"
```

See [API Keys Guide](../api/api-keys.md) for detailed instructions on obtaining these keys.

### 4. Initialize Database

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5000` 🎉

---

## 📦 Detailed Setup

### Step 1: System Requirements

#### Operating System
- Linux (Ubuntu 20.04+ recommended)
- macOS 11+
- Windows 10+ with WSL2

#### Node.js & npm
```bash
# Check versions
node --version  # Should be 18+
npm --version   # Should be 8+

# Install Node.js (if needed)
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (with Homebrew)
brew install node@18

# Windows (with Chocolatey)
choco install nodejs-lts
```

#### PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Or use cloud database (recommended for beginners)
# - Neon: https://neon.tech (free tier)
# - Railway: https://railway.app
# - Supabase: https://supabase.com
```

---

### Step 2: Clone and Install

```bash
# Clone repository
git clone https://github.com/shritej-koneru/EquiAlert.git
cd EquiAlert

# Install all dependencies
npm install

# This installs:
# - Express, React, TypeScript
# - Drizzle ORM, PostgreSQL driver
# - SerpAPI, NewsAPI clients
# - Twilio, Groq AI SDKs
# - And 50+ other packages
```

---

### Step 3: Database Setup

#### Option A: Neon (Cloud - Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a project
3. Copy connection string
4. Add to `.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### Option B: Local PostgreSQL

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE equialert;
CREATE USER equialert_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE equialert TO equialert_user;
\q

# Add to .env
DATABASE_URL="postgresql://equialert_user:your_password@localhost:5432/equialert"
```

#### Initialize Schema

```bash
# Push schema to database
npm run db:push

# Verify tables created
npm run db:studio  # Opens Drizzle Studio at localhost:4983
```

---

### Step 4: API Keys Configuration

Get all required API keys by following the [API Keys Guide](../api/api-keys.md).

#### Required Keys (Must Have)

1. **SerpAPI** - Stock prices
   - Sign up at [serpapi.com](https://serpapi.com)
   - Free tier: 100 searches/month
   
2. **NewsAPI** - Market news
   - Sign up at [newsapi.org](https://newsapi.org)
   - Free tier: 100 requests/day

#### Optional Keys (Nice to Have)

3. **Groq AI** - Chatbot
   - Sign up at [console.groq.com](https://console.groq.com)
   - Free tier: 14,400 requests/day
   
4. **Twilio** - WhatsApp notifications
   - Sign up at [twilio.com](https://twilio.com)
   - Free trial: $15 credit

#### Add to .env File

```bash
# Create .env from template
cat > .env << 'EOF'
# Database
DATABASE_URL="your_database_url_here"

# Stock Data (Required)
SERPAPI_KEY="your_serpapi_key"

# News (Required)
NEWSAPI_KEY="your_newsapi_key"

# AI Chatbot (Optional)
GROQ_API_KEY="your_groq_key"

# WhatsApp Notifications (Optional)
TWILIO_ACCOUNT_SID="your_sid"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_FROM_PHONE_NUMBER="whatsapp:+14155238886"
EOF
```

---

### Step 5: Verify Installation

```bash
# Run TypeScript check
npm run check

# Should show:
# - 0 errors (or only example file errors)
# - Successful compilation

# Test API keys
curl http://localhost:5000/api/stocks/search?q=reliance
curl http://localhost:5000/api/news
```

---

## 🔧 Development Workflow

### Running the Development Server

```bash
# Start dev server (hot reload enabled)
npm run dev

# Server runs at http://localhost:5000
# Frontend: http://localhost:5000
# API: http://localhost:5000/api
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio

# Code Quality
npm run check        # TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Project Structure

```
EquiAlert/
├── client/                 # Frontend React app
│   └── src/
│       ├── components/    # React components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom hooks
│       └── lib/          # Utilities
├── server/                # Backend Express app
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   ├── serpapi.ts        # SerpAPI integration
│   ├── priceCache.ts     # Caching system
│   └── ...
├── shared/                # Shared types
│   └── schema.ts         # Database schema
└── docs/                 # Documentation
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test stock search
curl "http://localhost:5000/api/stocks/search?q=tcs"

# Test stock price
curl "http://localhost:5000/api/stocks/price/TCS:NSE"

# Test news
curl "http://localhost:5000/api/news?category=market"

# Test API usage stats
curl "http://localhost:5000/api/serpapi/usage"
```

### Testing WhatsApp Notifications

1. Join Twilio sandbox (if using WhatsApp)
2. Add your number to `.env`
3. Test notification:

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","message":"Test"}'
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Database Connection Failed

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check SSL mode
# For Neon: add ?sslmode=require
# For local: add ?sslmode=disable
```

### API Key Errors

```bash
# Check .env file exists
ls -la .env

# Verify keys are loaded
node -e "require('dotenv').config(); console.log(process.env.SERPAPI_KEY)"

# Restart server after adding keys
# Ctrl+C then npm run dev
```

### TypeScript Errors

```bash
# Clear build cache
rm -rf dist/ node_modules/.vite/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Module Not Found

```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Clean install
npm ci

# Or regular install
npm install
```

---

## 🚀 Production Deployment

### Option 1: Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. "New Project" → "Deploy from GitHub"
4. Add PostgreSQL service
5. Set environment variables
6. Deploy!

### Option 2: Vercel + Neon

1. Database: Use Neon PostgreSQL
2. Backend: Deploy to Railway/Render
3. Frontend: Deploy to Vercel
4. Set environment variables on each platform

### Option 3: VPS (DigitalOcean, Linode)

```bash
# On server
git clone https://github.com/your-repo/EquiAlert.git
cd EquiAlert
npm install
npm run build

# Setup PM2
npm install -g pm2
pm2 start npm --name "equialert" -- start
pm2 startup
pm2 save

# Setup nginx reverse proxy
sudo apt install nginx
# Configure nginx (see below)
```

### Environment Variables for Production

```bash
NODE_ENV=production
DATABASE_URL="your_production_db_url"
SERPAPI_KEY="your_production_key"
# ... all other keys
```

---

## 📚 Next Steps

- [API Keys Guide](../api/api-keys.md) - Get all required API keys
- [API Endpoints](../api/endpoints.md) - Explore available endpoints
- [Feature Guides](watchlist.md) - Learn about features
- [Contributing](../CONTRIBUTING.md) - Contribute to the project

---

**Need Help?** Open an issue on [GitHub](https://github.com/shritej-koneru/EquiAlert/issues)

**Last Updated:** October 2025
