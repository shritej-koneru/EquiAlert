# WhatsApp Notifications & Alerts Guide

Complete guide to setting up and using WhatsApp notifications for stock price alerts and market updates in EquiAlert.

## Overview

EquiAlert can send automated WhatsApp messages to your phone number for:
- **Price Alerts** - When stocks reach your target prices
- **Significant Changes** - When stocks move >5% in a day
- **Market Updates** - Daily market summaries
- **Breaking News** - Important market events

**Powered by:** Twilio WhatsApp Business API

---

## 🚀 Quick Start

### Prerequisites

Before you can receive WhatsApp alerts:

1. ✅ Twilio account with WhatsApp enabled
2. ✅ Your WhatsApp number joined to Twilio sandbox (for testing)
3. ✅ Phone number added to your EquiAlert profile

**Don't have Twilio set up?** → See [Twilio Setup Guide](../api/twilio.md)

---

## 📱 Setting Up WhatsApp Alerts

### Step 1: Configure Twilio

If you haven't already, follow the [Twilio Setup Guide](../api/twilio.md) to:

1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Join the WhatsApp Sandbox

### Step 2: Add Phone Number to Profile

1. Open EquiAlert in your browser
2. Click your **profile icon** (top-right)
3. Click **"Edit Profile"**
4. Enter your **WhatsApp number** in international format:
   ```
   +919876543210
   ```
   **Format:** `+[country code][phone number]` (no spaces)

5. Click **"Save"**

### Step 3: Join Twilio Sandbox (Testing)

**⚠️ Important:** For testing, you must join the Twilio WhatsApp Sandbox:

1. Open WhatsApp on your phone
2. Add the Twilio sandbox number to your contacts:
   ```
   +1 415 523 8886
   ```
3. Send the join code (shown in [Twilio Console](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)):
   ```
   join [your-code-here]
   ```
   Example: `join happy-tiger`

4. You'll receive a confirmation message:
   ```
   Twilio Sandbox: ✅ You are now connected to the Twilio Sandbox!
   ```

### Step 4: Enable Alerts

1. Go to your **Profile Settings**
2. Toggle **"Enable WhatsApp Alerts"** to ON
3. Choose which alerts you want:
   - ☑️ Price Alerts (target prices reached)
   - ☑️ Significant Changes (>5% moves)
   - ☑️ Daily Market Summary
   - ☑️ Breaking News

4. Click **"Save Preferences"**

---

## 🔔 Types of Notifications

### 1. Price Alerts

Sent when a stock in your watchlist reaches your target price.

**Example Message:**
```
🚨 Price Alert: Reliance Industries

Current: ₹2,620.50
Target: ₹2,600.00
Change: +6.68% 📈

Your target price has been reached!

View Details: https://equialert.com/stocks/RELIANCE
```

**How to Set Up:**
1. Add stock to watchlist
2. Set target price
3. Enable alerts for that stock
4. Wait for price to hit target!

**See:** [Watchlist Guide](watchlist.md#setting-target-prices)

---

### 2. Significant Change Alerts

Automatic alerts when stocks move more than 5% in a day.

**Example Message:**
```
⚠️ Significant Movement: HDFC Bank

Previous: ₹1,650.00
Current: ₹1,567.50
Change: 📉 -5.00%

Reason: Q3 earnings miss expectations

Check your portfolio: https://equialert.com
```

**Configuration:**
- Threshold: 5% (default)
- Frequency: Once per day per stock
- Time: During market hours (9:15 AM - 3:30 PM IST)

---

### 3. Daily Market Summary

Get a daily summary of market performance and your watchlist.

**Example Message:**
```
📊 Market Summary - Oct 14, 2025

NIFTY 50: 19,850.30 (+0.85%) 📈
SENSEX: 66,450.75 (+1.02%) 📈

Your Watchlist:
✅ RELIANCE: +1.88%
✅ TCS: +0.95%
❌ HDFC BANK: -0.45%

Top Gainers:
• Tata Motors: +4.56%
• Bharti Airtel: +3.21%

Have a great trading day!
```

**Delivery Time:** 
- 📅 Monday to Friday
- ⏰ 4:00 PM IST (after market close)

**Configuration:**
- Enable in Profile → Preferences
- Choose delivery time (coming soon)

---

### 4. Breaking News Alerts

Important market events affecting your watchlist stocks.

**Example Message:**
```
📰 Breaking News: Reliance Industries

Reliance announces strategic partnership with BP for renewable energy

Impact: Positive 📈
Source: Economic Times

Full Story: https://economictimes.com/...
```

**Criteria:**
- News about stocks in your watchlist
- High-impact keywords (merger, acquisition, earnings, etc.)
- Major market-moving events

---

## ⚙️ Notification Settings

### Managing Your Preferences

#### Via Profile Settings

1. Click **Profile Icon** → **Settings**
2. Navigate to **"Notifications"** tab
3. Configure options:

```
┌─────────────────────────────────────────┐
│ WhatsApp Notifications                   │
├─────────────────────────────────────────┤
│ ☑ Enable WhatsApp Alerts                │
│                                          │
│ Alert Types:                             │
│ ☑ Price Alerts (target prices)          │
│ ☑ Significant Changes (>5%)             │
│ ☑ Daily Market Summary                  │
│ ☐ Breaking News                         │
│                                          │
│ Quiet Hours:                             │
│ From: 10:00 PM                           │
│ To: 8:00 AM                              │
│                                          │
│ Phone Number: +919876543210              │
│ Status: ✅ Verified                      │
│                                          │
│ [Test Notification] [Save Changes]      │
└─────────────────────────────────────────┘
```

#### Quiet Hours

Set times when you don't want to receive alerts:

- **Default:** 10:00 PM - 8:00 AM
- **Weekends:** Optional (market closed anyway)
- **Emergency Alerts:** Still delivered (>10% moves)

#### Frequency Control

Control how often you receive alerts:

- **Price Alerts:** Immediate (when triggered)
- **Significant Changes:** Once per day per stock
- **Market Summary:** Once per day
- **Breaking News:** As they happen (max 5/day)

---

## 📊 Testing Your Setup

### Send Test Notification

Before setting up alerts, test your configuration:

1. Go to **Profile** → **Settings** → **Notifications**
2. Click **"Send Test Message"** button
3. You should receive:

```
✅ Test Message from EquiAlert

Your WhatsApp notifications are working correctly!

You'll receive alerts for:
• Price targets
• Market updates
• Breaking news

You're all set! 🎉
```

**If you don't receive it:**
- Check you joined Twilio sandbox
- Verify phone number format (+country code)
- Check WhatsApp is connected to internet
- See [Troubleshooting](#troubleshooting) below

---

## 💡 Best Practices

### 1. Phone Number Format

Always use international format:

```bash
# ✅ Correct formats
+919876543210    # India
+14155552671     # USA
+442071234567    # UK

# ❌ Wrong formats
9876543210       # Missing country code
+91 98765 43210  # Has spaces
(987) 654-3210   # Has special characters
```

### 2. Alert Management

**Don't Over-Alert:**
- Limit watchlist to 10-15 stocks
- Only enable alerts for priority stocks
- Use quiet hours to avoid nighttime alerts

**Strategic Targets:**
- Set realistic target prices
- Base on technical/fundamental analysis
- Update regularly as market moves

### 3. Message Costs

**Be mindful of costs:**
- Each alert = ~$0.005
- 100 alerts/month = ~$0.50
- 1,000 alerts/month = ~$5.00

**See:** [Twilio Pricing Guide](../api/twilio.md#pricing--limits)

### 4. Sandbox vs Production

**Sandbox (Free Testing):**
- ✅ Free for testing
- ❌ Limited to your number only
- ❌ Must rejoin every 3 days

**Production (Paid):**
- ✅ Any WhatsApp number
- ✅ No rejoining needed
- ✅ Branded messages
- 💰 Requires Twilio business approval

**See:** [Production Setup](../api/twilio.md#production-setup)

---

## 🔧 Advanced Configuration

### Custom Alert Templates

Customize message formats (admin only):

```typescript
// server/twilio.ts

const templates = {
  priceAlert: (stock, current, target, change) => `
🎯 Target Reached: ${stock.name}

Price: ₹${current}
Target: ₹${target}
Change: ${change > 0 ? '📈' : '📉'} ${Math.abs(change)}%

Time: ${new Date().toLocaleString('en-IN')}

[View Chart] https://equialert.com/stocks/${stock.symbol}
`,

  // Add more templates...
};
```

### Scheduled Messages

Set up recurring messages:

```typescript
// Daily market summary at 4 PM IST
import { CronJob } from 'cron';

const dailySummary = new CronJob(
  '0 16 * * 1-5', // Mon-Fri at 4 PM
  async () => {
    const users = await getSubscribedUsers();
    const summary = await generateMarketSummary();
    
    for (const user of users) {
      await sendWhatsAppMessage(user.phone, summary);
    }
  },
  null,
  true,
  'Asia/Kolkata'
);
```

### Multi-Language Support

Send messages in user's preferred language (coming soon):

```typescript
const getLocalizedMessage = (template, locale, data) => {
  const messages = {
    en: templates.en[template](data),
    hi: templates.hi[template](data), // Hindi
    ta: templates.ta[template](data), // Tamil
  };
  
  return messages[locale] || messages.en;
};
```

---

## 🐛 Troubleshooting

### Not Receiving Messages

**Problem:** Setup looks correct but no messages arrive

**Solutions:**

1. **Verify Sandbox Membership:**
   ```
   - Open WhatsApp
   - Find conversation with Twilio (+1 415 523 8886)
   - Look for "You are now connected" message
   - If missing, send join code again
   ```

2. **Check Phone Number:**
   ```bash
   # Correct format
   +919876543210
   
   # Common mistakes
   9876543210        # Missing +91
   +91 9876543210    # Has space
   +91-9876543210    # Has dash
   ```

3. **Verify Twilio Credentials:**
   ```bash
   # Check .env file
   cat .env | grep TWILIO
   
   # Should show:
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="xxxxxxxxxxxxx"
   TWILIO_FROM_PHONE_NUMBER="whatsapp:+14155238886"
   ```

4. **Test Twilio Connection:**
   ```bash
   # Send test via API
   curl -X POST "http://localhost:5000/api/notifications/test" \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+919876543210","message":"Test"}'
   ```

5. **Check Server Logs:**
   ```bash
   # Look for Twilio errors
   npm run dev
   # Watch for lines like:
   # ✅ WhatsApp sent: SM...
   # ❌ WhatsApp failed: ...
   ```

---

### "Unable to Create Record"

**Problem:** Error when sending message

**Solutions:**

1. **Verify Credentials:**
   - Log in to [Twilio Console](https://console.twilio.com/)
   - Check Account SID and Auth Token are correct
   - Make sure they match your .env file

2. **Check Phone Number Format:**
   - Must include `whatsapp:` prefix
   - Use international format with +
   - Example: `whatsapp:+919876543210`

3. **Sandbox Status:**
   - Recipient must be in sandbox
   - Sandbox connection expires after 3 days
   - Rejoin by sending code again

---

### "Insufficient Funds"

**Problem:** Ran out of trial credit

**Solutions:**

1. **Check Balance:**
   - Go to [Twilio Console](https://console.twilio.com/)
   - View remaining credit
   - Trial starts with $15

2. **Add Funds:**
   - Go to Billing section
   - Add credit card
   - Add funds to account
   - Messages will resume automatically

3. **Optimize Usage:**
   - Reduce alert frequency
   - Limit to important stocks
   - Use quiet hours

---

### Sandbox Expired

**Problem:** "User has not joined sandbox"

**Solution:**

Rejoin the sandbox (expires after 3 days of inactivity):

1. Open WhatsApp
2. Find Twilio number (+1 415 523 8886)
3. Send: `join happy-tiger` (or your current code)
4. Wait for confirmation
5. Try sending alert again

**To avoid:** Send at least one message every 3 days

---

### Messages Delayed

**Problem:** Alerts arrive late

**Possible Causes:**

1. **Network Issues:**
   - Check your internet connection
   - WhatsApp must be online
   - Try reconnecting WhatsApp

2. **Twilio Queue:**
   - High volume can cause delays
   - Usually resolves in 1-2 minutes
   - Check [Twilio Status](https://status.twilio.com/)

3. **Rate Limiting:**
   - Sandbox: 1 message/second
   - Production: 80 messages/second
   - Messages queued if limit exceeded

4. **Server Issues:**
   - Check server logs
   - Verify cron jobs are running
   - Restart server if needed

---

## 🚀 Production Deployment

### Moving Beyond Sandbox

For production use with multiple users:

### Step 1: Apply for WhatsApp Business

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **WhatsApp** → **Senders**
3. Click **"Request to add a new sender"**
4. Submit business information:
   - Business name
   - Business description
   - Business website
   - Business address
   - Business category

### Step 2: Get Templates Approved

WhatsApp requires pre-approved templates:

```
Template Name: price_alert
Category: Alert Update
Language: English

Message:
🚨 Price Alert: {{1}}

Current: {{2}}
Target: {{3}}
Change: {{4}}

Your target price has been reached!
```

Submit templates and wait 24-48 hours for approval.

### Step 3: Update Configuration

```bash
# Replace sandbox number with your production number
TWILIO_FROM_PHONE_NUMBER="whatsapp:+919876543210"
```

### Step 4: Update Code

Use approved templates:

```typescript
await client.messages.create({
  from: getTwilioFromPhoneNumber(),
  to: `whatsapp:${userPhone}`,
  contentSid: 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  contentVariables: JSON.stringify({
    '1': stock.name,
    '2': currentPrice,
    '3': targetPrice,
    '4': changePercent
  })
});
```

**See:** [Twilio Production Guide](../api/twilio.md#production-setup)

---

## 📊 Message Analytics

### Track Your Alerts

View alert statistics in your profile:

```
┌─────────────────────────────────────┐
│ Notification Statistics              │
├─────────────────────────────────────┤
│ This Month:                          │
│ • Price Alerts: 12                   │
│ • Market Updates: 20                 │
│ • Breaking News: 3                   │
│ • Total: 35 messages                 │
│                                      │
│ Cost: ~$0.18                         │
│                                      │
│ Delivery Rate: 97% ✅                │
│ Average Delivery Time: 2.3s          │
└─────────────────────────────────────┘
```

### Server-Side Logging

Monitor message delivery:

```typescript
// server/twilio.ts

const sendWithLogging = async (to: string, message: string) => {
  const startTime = Date.now();
  
  try {
    const result = await sendWhatsAppMessage(to, message);
    
    console.log({
      timestamp: new Date().toISOString(),
      status: 'success',
      to: to,
      sid: result.sid,
      duration: Date.now() - startTime,
      messageLength: message.length
    });
    
    return result;
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      status: 'failed',
      to: to,
      error: error.message,
      code: error.code
    });
    
    throw error;
  }
};
```

---

## 📚 Related Documentation

- **[Twilio Setup Guide](../api/twilio.md)** - Detailed Twilio configuration
- **[Watchlist Guide](watchlist.md)** - Setting up price alerts
- **[API Endpoints](../api/endpoints.md#notification-endpoints)** - Notification APIs
- **[Setup Guide](setup.md)** - Initial application setup

---

## 💬 Example Workflows

### Workflow 1: Day Trader Setup

**Goal:** Receive instant alerts for short-term trades

```yaml
Configuration:
  - Enable: Price Alerts, Significant Changes
  - Disable: Daily Summary, Breaking News
  - Quiet Hours: None
  - Watchlist: 5-7 high-volume stocks
  - Targets: Set 2-3% from current price
  
Expected Messages: 10-20 per day
Cost: ~$0.05-0.10 per day
```

### Workflow 2: Long-Term Investor

**Goal:** Stay informed without constant alerts

```yaml
Configuration:
  - Enable: Daily Summary, Breaking News
  - Disable: Significant Changes
  - Enable Price Alerts: Only for major targets
  - Quiet Hours: 9 PM - 8 AM
  - Watchlist: 15-20 stocks
  - Targets: Set 10-15% from current price
  
Expected Messages: 1-3 per day
Cost: ~$0.05 per day
```

### Workflow 3: Passive Monitoring

**Goal:** Weekly market overview

```yaml
Configuration:
  - Enable: Daily Summary only
  - Disable: All alerts
  - Quiet Hours: None
  - Delivery: Friday 4 PM
  
Expected Messages: 5 per week
Cost: ~$0.03 per week
```

---

## 🆘 Need Help?

### Support Resources

- **[Twilio Documentation](../api/twilio.md)** - Complete Twilio guide
- **[API Reference](../api/endpoints.md)** - Notification endpoints
- **[GitHub Issues](https://github.com/shritej-koneru/EquiAlert/issues)** - Report bugs
- **[Community Forum](https://github.com/shritej-koneru/EquiAlert/discussions)** - Ask questions

### Quick Links

- [Twilio Console](https://console.twilio.com/)
- [Twilio Status Page](https://status.twilio.com/)
- [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
- [Twilio Support](https://support.twilio.com/)

---

**Last Updated:** October 2025

**Next Steps:** [Set up your first price alert →](watchlist.md#setting-target-prices)
