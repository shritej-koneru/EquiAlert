# API Keys & Configuration Guide

Complete index of all API keys and services required for EquiAlert.

## 📋 Overview

EquiAlert integrates with multiple external services to provide real-time stock data, news, AI insights, and notifications. This guide provides links to detailed documentation for each service.

---

## 🔑 Required Services

### 1. **SerpAPI** - Stock Price Data
**Purpose:** Real-time stock prices from Google Finance

**Status:** ✅ **Required** (core functionality)

**Free Tier:** 250 searches/month

**Cost:** From $50/month for 5,000 searches

**📖 [Complete SerpAPI Setup Guide →](serpapi.md)**

Covers:
- Account creation and API key generation
- Integration with EquiAlert
- Rate limiting (250 requests/month)
- Caching strategy (30-min TTL)
- Troubleshooting common issues

---

### 2. **NewsAPI** - Market News
**Purpose:** Financial news from Indian and global sources

**Status:** ✅ **Required** (news feature)

**Free Tier:** 100 requests/day

**Cost:** From $449/month for production

**📖 [Complete NewsAPI Setup Guide →](newsapi.md)**

Covers:
- Account creation and verification
- Supported sources (Economic Times, Moneycontrol, etc.)
- API endpoints and filtering
- Category-based news fetching
- Troubleshooting and best practices

---

### 3. **Groq AI** - Chatbot
**Purpose:** AI-powered market insights with Llama 3.3 70B

**Status:** ⚠️ **Optional** (chatbot feature only)

**Free Tier:** 14,400 requests/day (very generous!)

**Cost:** Currently free during preview

**📖 [Complete Groq AI Setup Guide →](groq.md)**

Covers:
- Account creation and API key generation
- Available models (Llama 3.3 70B, Llama 3.1 8B)
- Integration and configuration
- System prompts and customization
- Streaming responses

---

### 4. **Twilio** - WhatsApp Notifications
**Purpose:** Price alerts and market updates via WhatsApp

**Status:** ⚠️ **Optional** (notifications only)

**Free Tier:** $15 trial credit (~3,000 messages)

**Cost:** ~$0.005 per WhatsApp message

**📖 [Complete Twilio Setup Guide →](twilio.md)**

Covers:
- Account creation and credentials
- WhatsApp sandbox setup (for testing)
- Message templates and formatting
- Production WhatsApp API setup
- Scheduling and rate limiting

---

### 5. **PostgreSQL Database**
**Purpose:** Store user data, watchlists, and preferences

**Status:** ✅ **Required** (core functionality)

**Options:** Neon (cloud), Railway (cloud), Local

**Free Tier:** Available on Neon and Railway

**📖 [Complete Database Setup Guide →](database.md)**

Covers:
- Neon setup (recommended for beginners)
- Railway setup (integrated deployment)
- Local PostgreSQL installation
- Schema and migrations
- Connection pooling and security

---

## 🚀 Quick Setup

### 1. Create `.env` File

Create a `.env` file in your project root:

```bash
# ============================================
# DATABASE (Required)
# ============================================
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# ============================================
# STOCK DATA (Required)
# ============================================
SERPAPI_KEY="your_serpapi_key"

# ============================================
# NEWS (Required)
# ============================================
NEWSAPI_KEY="your_newsapi_key"

# ============================================
# AI CHATBOT (Optional)
# ============================================
GROQ_API_KEY="gsk_your_groq_key"

# ============================================
# WHATSAPP NOTIFICATIONS (Optional)
# ============================================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_FROM_PHONE_NUMBER="whatsapp:+14155238886"
```

### 2. Get Your API Keys

Follow the detailed guides for each service:

1. **[SerpAPI](serpapi.md)** - Get stock price API key
2. **[NewsAPI](newsapi.md)** - Get news API key  
3. **[Database](database.md)** - Set up PostgreSQL
4. **[Groq AI](groq.md)** - Get chatbot API key (optional)
5. **[Twilio](twilio.md)** - Get WhatsApp credentials (optional)

### 3. Initialize Application

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

---

## 💰 Cost Summary

### Minimal Setup (Free)
Perfect for development and testing:

| Service | Plan | Cost |
|---------|------|------|
| SerpAPI | Free | $0/month (100 searches) |
| NewsAPI | Developer | $0/month (100 requests/day) |
| Groq AI | Free Preview | $0/month (14,400 requests/day) |
| Database | Neon Free | $0/month (0.5 GB) |
| **Total** | | **$0/month** |

### Production Setup (Light Usage)
For small user base (100-500 users):

| Service | Plan | Cost |
|---------|------|------|
| SerpAPI | Starter | $50/month (5,000 searches) |
| NewsAPI | Developer | $0/month (sufficient for testing) |
| Groq AI | Free | $0/month |
| Twilio | Pay-as-you-go | ~$1-10/month |
| Database | Neon Free | $0/month |
| **Total** | | **~$51-60/month** |

### Production Setup (Heavy Usage)
For larger deployments (1,000+ users):

| Service | Plan | Cost |
|---------|------|------|
| SerpAPI | Business | $250/month (50,000 searches) |
| NewsAPI | Business | $449/month (250,000 requests) |
| Groq AI | Free | $0/month |
| Twilio | Pay-as-you-go | ~$50-100/month |
| Database | Neon Pro | $19/month |
| **Total** | | **~$768-818/month** |

---

## 🔒 Security Best Practices

### 1. Never Commit API Keys

Add to `.gitignore`:
```bash
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Environment Variables

```typescript
// ✅ Correct
const apiKey = process.env.SERPAPI_KEY;

// ❌ Wrong
const apiKey = "hardcoded_api_key_here";
```

### 3. Rotate Keys Regularly

- Change API keys every 3-6 months
- Immediately rotate if compromised
- Use different keys for dev/staging/production

### 4. Restrict API Key Permissions

- Use read-only keys where possible
- Set IP restrictions if available
- Monitor usage for anomalies

### 5. Server-Side Only

- Never expose keys in client code
- Always make API calls from server
- Use proxy endpoints

---

## 🐛 Common Issues

### "API key not configured"

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Verify .env exists
ls -la .env

# Check file contents
cat .env

# Restart server
npm run dev
```

### "Invalid API key"

**Problem:** Key is incorrect or expired

**Solution:**
1. Check key is copied correctly (no spaces)
2. Verify key is active in provider dashboard
3. Regenerate key if needed
4. Update .env and restart server

### Rate Limit Exceeded

**Problem:** Too many API requests

**Solution:**
```bash
# Check usage
curl http://localhost:5000/api/serpapi/usage

# Options:
# 1. Wait for reset
# 2. Upgrade API plan
# 3. Optimize caching (see guides)
```

---

## 📚 Detailed Documentation

Each service has comprehensive documentation:

- **[SerpAPI Guide](serpapi.md)** - Stock price API setup and optimization
- **[NewsAPI Guide](newsapi.md)** - News aggregation and filtering
- **[Groq AI Guide](groq.md)** - AI chatbot configuration and customization
- **[Twilio Guide](twilio.md)** - WhatsApp notifications and alerts
- **[Database Guide](database.md)** - PostgreSQL setup and management

### Additional Resources

- **[API Endpoints Reference](endpoints.md)** - Complete REST API documentation
- **[Setup Guide](../guides/setup.md)** - Step-by-step application setup
- **[Architecture Docs](../architecture/)** - Technical implementation details

---

## 🆘 Need Help?

### Documentation
- Browse [Complete Documentation Index](../README.md)
- Read [Setup Guide](../guides/setup.md)
- Check [API Endpoints](endpoints.md)

### Support
- Open an issue on [GitHub](https://github.com/shritej-koneru/EquiAlert/issues)
- Check [Troubleshooting sections](#common-issues) in each guide
- Review provider documentation linked in each guide

---

## 📋 Setup Checklist

Use this checklist to ensure everything is configured:

### Required Setup
- [ ] Created `.env` file in project root
- [ ] Got SerpAPI key from [serpapi.com](https://serpapi.com)
- [ ] Got NewsAPI key from [newsapi.org](https://newsapi.org)
- [ ] Set up PostgreSQL database (Neon/Railway/Local)
- [ ] Added all required keys to `.env`
- [ ] Ran `npm install`
- [ ] Ran `npm run db:push`
- [ ] Started server with `npm run dev`
- [ ] Verified app loads at `http://localhost:5000`

### Optional Setup
- [ ] Got Groq AI key for chatbot
- [ ] Set up Twilio for WhatsApp notifications
- [ ] Joined Twilio WhatsApp sandbox
- [ ] Tested chatbot functionality
- [ ] Tested WhatsApp notifications

### Production Setup
- [ ] Upgraded API plans as needed
- [ ] Set up production database with backups
- [ ] Configured environment variables on hosting platform
- [ ] Enabled SSL for database connection
- [ ] Set up monitoring and alerts
- [ ] Documented all credentials securely

---

**Last Updated:** October 2025

**Next Steps:** Choose a service above and follow its detailed setup guide!
