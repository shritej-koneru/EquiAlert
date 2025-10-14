# Database Setup - PostgreSQL

Complete guide for setting up the PostgreSQL database for EquiAlert.

## Overview

**PostgreSQL** is the relational database used to store user data, watchlists, profiles, and application state.

**Purpose:** Store persistent data (users, watchlists, preferences)

**Required:** ✅ Yes (core functionality)

**Options:** Neon (cloud), Railway (cloud), Local PostgreSQL

**ORM:** Drizzle ORM for type-safe database access

---

## 🎯 Database Options

### Option 1: Neon (Recommended for Beginners)

**✅ Best for:** Quick setup, serverless, generous free tier

**Free Tier:**
- 0.5 GB storage
- 1 GB data transfer/month
- Auto-suspend after inactivity
- No credit card required

**Pros:**
- Instant setup (no installation)
- Serverless (auto-scaling)
- Generous free tier
- Built-in connection pooling
- Daily backups

**Cons:**
- Requires internet connection
- Limited free storage

[Jump to Neon Setup →](#neon-setup)

---

### Option 2: Railway

**✅ Best for:** Full-stack deployment, integrated CI/CD

**Free Tier:**
- $5 free credit/month
- ~100 hours of runtime
- 1 GB storage
- Credit card required

**Pros:**
- Easy deployment
- PostgreSQL + app hosting
- GitHub integration
- Automatic SSL

**Cons:**
- Limited free tier
- Credit card required

[Jump to Railway Setup →](#railway-setup)

---

### Option 3: Local PostgreSQL

**✅ Best for:** Offline development, full control, no limits

**Free:** Completely free, unlimited storage

**Pros:**
- No internet required
- Unlimited storage
- Full control
- No vendor lock-in

**Cons:**
- Requires installation
- Manual setup
- No automatic backups

[Jump to Local Setup →](#local-postgresql-setup)

---

## 🚀 Neon Setup

### Step 1: Create Account

1. Go to [https://neon.tech/](https://neon.tech/)
2. Click **"Sign Up"** button
3. Sign up with:
   - GitHub account (recommended)
   - Google account
   - Email

### Step 2: Create Project

1. After login, click **"Create a project"**
2. Enter project details:
   - **Project Name:** "EquiAlert" (or any name)
   - **Database Name:** "neondb" (default)
   - **Region:** Select closest to your users (e.g., Asia Pacific for India)
3. Click **"Create Project"**

### Step 3: Get Connection String

1. Project will be created instantly
2. You'll see the connection string on the dashboard
3. Click **"Connection String"** tab
4. Copy the connection string

Format:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Configure EquiAlert

Add to `.env`:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**Important:** Keep `?sslmode=require` at the end!

### Step 5: Initialize Database

```bash
# Push schema to Neon
npm run db:push

# Verify tables created
npm run db:studio  # Opens Drizzle Studio at localhost:4983
```

---

## 🚂 Railway Setup

### Step 1: Create Account

1. Go to [https://railway.app/](https://railway.app/)
2. Click **"Login with GitHub"**
3. Authorize Railway

### Step 2: Create Project

1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Database will be created instantly

### Step 3: Get Connection String

1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value

Format:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### Step 4: Configure EquiAlert

Add to `.env`:
```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### Step 5: Initialize Database

```bash
npm run db:push
npm run db:studio
```

---

## 💻 Local PostgreSQL Setup

### Step 1: Install PostgreSQL

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

#### macOS
```bash
# Using Homebrew
brew install postgresql@15

# Start service
brew services start postgresql@15

# Check status
brew services list
```

#### Windows
1. Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer
3. Follow setup wizard
4. Note the password you set for `postgres` user

### Step 2: Create Database

```bash
# Switch to postgres user (Linux/Mac)
sudo -u postgres psql

# Or connect directly (Windows/Mac)
psql -U postgres
```

Inside PostgreSQL shell:
```sql
-- Create database
CREATE DATABASE equialert;

-- Create user
CREATE USER equialert_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE equialert TO equialert_user;

-- Grant schema privileges
\c equialert
GRANT ALL ON SCHEMA public TO equialert_user;

-- Exit
\q
```

### Step 3: Configure Connection

Add to `.env`:
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://equialert_user:your_secure_password@localhost:5432/equialert"
```

### Step 4: Initialize Database

```bash
npm run db:push
npm run db:studio
```

---

## 🗄️ Database Schema

EquiAlert uses Drizzle ORM with the following schema (defined in `shared/schema.ts`):

### Users Table

```typescript
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  username: text("username").unique(),
  password: text("password"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Profiles Table

```typescript
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  profession: text("profession"),
  phoneNumber: text("phone_number"),
  whatsappNumber: text("whatsapp_number"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Watchlist Table

```typescript
export const watchlist = pgTable("watchlist", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  targetPrice: real("target_price"),
  alertEnabled: boolean("alert_enabled").default(false),
  addedAt: timestamp("added_at").defaultNow(),
});
```

---

## ⚙️ Configuration

### Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

Components:
- **user** - Database username
- **password** - Database password
- **host** - Server hostname/IP
- **port** - Port number (default: 5432)
- **database** - Database name
- **options** - Connection options (e.g., `sslmode=require`)

### SSL Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| `disable` | No SSL | Local development |
| `prefer` | Try SSL, fallback to non-SSL | Default |
| `require` | SSL required | Production (Neon, Railway) |
| `verify-ca` | SSL with CA verification | High security |
| `verify-full` | SSL with full verification | Maximum security |

### Connection Pooling

For production, use connection pooling:

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

// Connection pool
const client = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout 10s
});

export const db = drizzle(client);
```

---

## 🔧 Database Operations

### Drizzle Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (GUI)
npm run db:studio
```

### Drizzle Studio

Visual database browser at `http://localhost:4983`:
- View all tables
- Browse data
- Edit records
- Run queries
- Schema visualization

### Manual Queries

Connect with psql:
```bash
# Neon
psql "postgresql://user:pass@host/db?sslmode=require"

# Local
psql -U equialert_user -d equialert

# List tables
\dt

# Describe table
\d watchlist

# Query data
SELECT * FROM watchlist;

# Exit
\q
```

---

## 🔒 Security Best Practices

### 1. Secure Passwords

```bash
# Generate strong password
openssl rand -base64 32

# Use in connection string
DATABASE_URL="postgresql://user:StRoNgP@ssW0rd@host/db"
```

### 2. Environment Variables

```bash
# ✅ Correct - use .env
DATABASE_URL="postgresql://..."

# ❌ Wrong - hardcode in code
const url = "postgresql://...";
```

### 3. Restrict Database Access

```sql
-- Create read-only user for reporting
CREATE USER readonly_user WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Revoke unnecessary privileges
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### 4. Enable SSL

For production databases:
```bash
# Always use SSL for cloud databases
DATABASE_URL="postgresql://...?sslmode=require"
```

### 5. Regular Backups

**Neon:** Automatic daily backups

**Railway:** Automatic backups

**Local:**
```bash
# Backup database
pg_dump -U equialert_user equialert > backup_$(date +%Y%m%d).sql

# Restore database
psql -U equialert_user equialert < backup_20251014.sql

# Automated daily backup
# Add to crontab: 0 2 * * * /path/to/backup_script.sh
```

---

## 🐛 Troubleshooting

### Connection Refused

**Problem:** Can't connect to database

**Solutions:**
```bash
# Check if PostgreSQL is running (local)
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS

# Check connection
telnet localhost 5432

# Test connection string
psql "$DATABASE_URL" -c "SELECT version();"
```

### Authentication Failed

**Problem:** Wrong username or password

**Solutions:**
```bash
# Verify credentials
echo $DATABASE_URL

# Reset password (local)
sudo -u postgres psql
ALTER USER equialert_user WITH PASSWORD 'new_password';

# Update .env with new password
```

### SSL Required

**Problem:** "SSL connection is required"

**Solutions:**
```bash
# Add SSL mode to connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# For local development, disable SSL
DATABASE_URL="postgresql://user:pass@localhost/db?sslmode=disable"
```

### Table Does Not Exist

**Problem:** Tables not created

**Solutions:**
```bash
# Push schema to database
npm run db:push

# Verify tables created
npm run db:studio

# Or check with psql
psql "$DATABASE_URL" -c "\dt"
```

### Too Many Connections

**Problem:** Connection pool exhausted

**Solutions:**
```typescript
// Reduce max connections
const client = postgres(connectionString, {
  max: 5, // Lower limit
});

// Close idle connections faster
const client = postgres(connectionString, {
  idle_timeout: 10,
});

// Or check current connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📊 Monitoring & Maintenance

### Check Database Size

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('equialert'));

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active Connections

```sql
-- Show active connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state
FROM pg_stat_activity
WHERE datname = 'equialert';
```

### Performance Tuning

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Create indexes for better performance
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_symbol ON watchlist(symbol);
```

---

## 🚀 Production Checklist

- [ ] Use cloud database (Neon/Railway) for reliability
- [ ] Enable SSL (`sslmode=require`)
- [ ] Use strong passwords (32+ characters)
- [ ] Set up automatic backups
- [ ] Configure connection pooling
- [ ] Create read-only user for analytics
- [ ] Monitor database size and connections
- [ ] Set up alerts for issues
- [ ] Document connection details securely
- [ ] Test disaster recovery procedure

---

## 📚 Related Documentation

- **[Setup Guide](../guides/setup.md)** - Complete application setup
- **[Code Organization](../architecture/CODE_ORGANIZATION.md)** - Database schema location
- **[API Endpoints](endpoints.md)** - Database-backed APIs

## 🔗 External Resources

- **[Neon Documentation](https://neon.tech/docs)** - Neon-specific docs
- **[Railway Documentation](https://docs.railway.app/)** - Railway guides
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)** - Official PostgreSQL docs
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM documentation
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Drizzle CLI tools

---

**Last Updated:** October 2025
