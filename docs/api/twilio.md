# Twilio - WhatsApp Notifications

Complete guide for setting up Twilio to send WhatsApp alerts and notifications.

## Overview

**Twilio** provides WhatsApp Business API integration for sending automated notifications and alerts.

**Purpose:** Send price alerts and market updates via WhatsApp

**Required:** ⚠️ Optional (notifications feature only)

**Free Tier:** $15 trial credit

**Cost:** Pay-as-you-go (~$0.005 per WhatsApp message)

**Official Website:** [https://www.twilio.com/](https://www.twilio.com/)

---

## 🚀 Getting Your Credentials

### Step 1: Sign Up

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Click **"Sign Up"** or **"Try Twilio Free"**
3. Fill in the registration form:
   - **First Name**
   - **Last Name**
   - **Email**
   - **Password**
4. Verify your email address
5. Verify your phone number (SMS verification)

### Step 2: Get Account Credentials

1. Log in to [Twilio Console](https://console.twilio.com/)
2. On the dashboard, you'll see:
   - **Account SID** - Your account identifier
   - **Auth Token** - Your authentication token (click to reveal)

Example format:
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: your_auth_token_here
```

### Step 3: Join WhatsApp Sandbox

For testing (free):

1. Navigate to [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. You'll see a sandbox number (e.g., `+1 415 523 8886`)
3. You'll see a join code (e.g., `join abc-def`)
4. **On your phone:**
   - Open WhatsApp
   - Send the join code to the sandbox number
   - Example: Send "join abc-def" to +1 415 523 8886
5. You'll receive a confirmation message

### Step 4: Get Phone Number

**Sandbox Phone Number Format:**
```
whatsapp:+14155238886
```

**Note:** The `whatsapp:` prefix is required!

---

## ⚙️ Configuration

### Add to Environment Variables

Edit your `.env` file:

```bash
# Twilio - WhatsApp notifications
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_FROM_PHONE_NUMBER="whatsapp:+14155238886"
```

### Verify Configuration

Test your credentials:

```bash
# Test with curl
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json" \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:+919876543210" \
  --data-urlencode "Body=Test message from EquiAlert" \
  -u "YOUR_SID:YOUR_AUTH_TOKEN"
```

Expected response:
```json
{
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "whatsapp:+919876543210",
  "from": "whatsapp:+14155238886"
}
```

---

## 📱 Usage in EquiAlert

### How We Use Twilio

EquiAlert sends WhatsApp notifications for:
1. **Price Alerts** - When stock reaches target price
2. **Significant Changes** - When stock moves >5%
3. **Market Updates** - Daily market summaries
4. **News Alerts** - Breaking market news

### API Integration

Our server integrates Twilio in `server/twilio.ts`:

```typescript
import twilio from 'twilio';

// Initialize Twilio client
export const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  
  return twilio(accountSid, authToken);
};

export const getTwilioFromPhoneNumber = () => {
  return process.env.TWILIO_FROM_PHONE_NUMBER || '';
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (
  to: string,
  message: string
) => {
  const client = getTwilioClient();
  const from = getTwilioFromPhoneNumber();
  
  try {
    const result = await client.messages.create({
      from: from,
      to: `whatsapp:${to}`,
      body: message
    });
    
    console.log(`✅ WhatsApp sent: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ WhatsApp failed: ${error.message}`);
    throw error;
  }
};
```

### Price Alert Example

```typescript
// server/priceUpdater.ts
import { sendWhatsAppMessage } from './twilio';

const sendPriceAlert = async (stock, currentPrice, targetPrice) => {
  const message = `🚨 Price Alert: ${stock.name}

Current: ₹${currentPrice}
Target: ₹${targetPrice}
Change: ${calculateChange(currentPrice, targetPrice)}%

Your target price has been reached!`;

  await sendWhatsAppMessage(
    stock.userPhone,
    message
  );
};
```

---

## 💰 Pricing & Limits

### Trial Account ($15 Credit)
- **$15 free credit** upon signup
- ~3,000 WhatsApp messages
- Full API access
- Sandbox testing included
- Credit card required (not charged until depleted)

### WhatsApp Messaging Costs

| Message Type | Cost | Description |
|-------------|------|-------------|
| **Conversation (User-initiated)** | $0.005/msg | First 1,000 messages/month FREE |
| **Conversation (Business-initiated)** | $0.0085/msg | Notifications, alerts |
| **Template Message** | $0.0085/msg | Pre-approved templates |

### Our Usage Estimate

Typical usage for one user:
- **2 price alerts/day** = 60 messages/month
- **1 market update/day** = 30 messages/month
- **Total:** ~90 messages/month
- **Cost:** ~$0.77/month per user

For 100 users:
- **9,000 messages/month**
- **Cost:** ~$77/month

### Free Tier Bonus
- First 1,000 conversations/month are FREE
- Covers ~100-200 active users
- Additional messages: $0.005-0.0085 each

---

## 🔧 Advanced Configuration

### Message Templates

Create templates for consistency:

```typescript
// Message templates
const templates = {
  priceAlert: (stock, current, target, change) => `
🚨 Price Alert: ${stock}

Current: ₹${current}
Target: ₹${target}
Change: ${change > 0 ? '↑' : '↓'} ${Math.abs(change)}%

Your target has been reached!
`,

  marketUpdate: (nifty, sensex, topGainers) => `
📊 Market Update

NIFTY 50: ${nifty.value} (${nifty.change}%)
SENSEX: ${sensex.value} (${sensex.change}%)

Top Gainers:
${topGainers.map(s => `• ${s.name}: +${s.change}%`).join('\n')}
`,

  significantChange: (stock, change, reason) => `
⚠️ Significant Movement: ${stock}

Change: ${change > 0 ? '📈' : '📉'} ${change}%
Reason: ${reason}

Check your portfolio!
`,
};
```

### Media Messages

Send messages with images:

```typescript
const sendMediaMessage = async (to: string, message: string, mediaUrl: string) => {
  const client = getTwilioClient();
  
  await client.messages.create({
    from: getTwilioFromPhoneNumber(),
    to: `whatsapp:${to}`,
    body: message,
    mediaUrl: [mediaUrl] // Chart image, stock logo, etc.
  });
};
```

### Scheduled Messages

Schedule messages for specific times:

```typescript
import { CronJob } from 'cron';

// Daily market summary at 4 PM IST
const dailySummary = new CronJob('0 16 * * 1-5', async () => {
  const users = await getSubscribedUsers();
  const summary = await generateMarketSummary();
  
  for (const user of users) {
    await sendWhatsAppMessage(
      user.phone,
      templates.marketUpdate(summary)
    );
  }
}, null, true, 'Asia/Kolkata');
```

### Rate Limiting

Twilio has rate limits:
- **Sandbox:** 1 message per second
- **Production:** 80 messages per second

Implement queuing:

```typescript
class MessageQueue {
  private queue: Array<{to: string, message: string}> = [];
  private processing = false;
  
  async add(to: string, message: string) {
    this.queue.push({ to, message });
    if (!this.processing) {
      this.process();
    }
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { to, message } = this.queue.shift()!;
      
      try {
        await sendWhatsAppMessage(to, message);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 msg/sec
      } catch (error) {
        console.error('Failed to send:', error);
      }
    }
    
    this.processing = false;
  }
}

const messageQueue = new MessageQueue();
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# ✅ Correct
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="xxxxx"

# ❌ Wrong
const AUTH_TOKEN = "xxxxx";
```

### 2. Validate Phone Numbers
```typescript
const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  return phoneRegex.test(cleaned);
};
```

### 3. User Consent
```typescript
// Store user consent
interface UserPreferences {
  userId: string;
  whatsappOptIn: boolean;
  phoneNumber: string;
  alertTypes: string[]; // ['price', 'market', 'news']
  frequency: 'realtime' | 'daily' | 'weekly';
}

// Check before sending
const canSendMessage = (user: UserPreferences, type: string): boolean => {
  return user.whatsappOptIn && user.alertTypes.includes(type);
};
```

### 4. Error Handling
```typescript
const sendWithRetry = async (
  to: string, 
  message: string, 
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendWhatsAppMessage(to, message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};
```

---

## 🐛 Troubleshooting

### "Unable to create record"

**Problem:** Message failed to send

**Solutions:**
```bash
# Check credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN

# Verify phone number format
# ✅ Correct: whatsapp:+919876543210
# ❌ Wrong: +919876543210 (missing whatsapp:)
# ❌ Wrong: 919876543210 (missing +)
```

### "To number is not a valid mobile number"

**Problem:** Invalid recipient number

**Solutions:**
1. Check phone number format: `whatsapp:+[country code][number]`
2. Verify recipient joined sandbox (for testing)
3. Ensure no spaces or special characters
4. Confirm country code is correct

### "User has not joined sandbox"

**Problem:** Recipient not in sandbox (testing mode)

**Solutions:**
1. Recipient must send join code to sandbox number
2. Example: Send "join abc-def" to +1 415 523 8886
3. Wait for confirmation message
4. Or use production WhatsApp API (requires approval)

### "Insufficient funds"

**Problem:** Trial credit depleted

**Solutions:**
1. Check balance in [Twilio Console](https://console.twilio.com/)
2. Add billing information
3. Add funds to account
4. Messages will resume automatically

### Rate Limit Exceeded

**Problem:** Sending too many messages too fast

**Solutions:**
```typescript
// Implement throttling
const throttle = async (fn: Function, delay: number) => {
  await fn();
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Use message queue (see Advanced Configuration)
messageQueue.add(to, message);
```

### Authentication Failed

**Problem:** Invalid credentials

**Solutions:**
1. Verify Account SID starts with "AC"
2. Check Auth Token is correct (hidden by default, click to reveal)
3. Regenerate Auth Token if needed
4. Restart server after updating .env

---

## 📊 Monitoring & Analytics

### Twilio Console

View message logs at [Twilio Console](https://console.twilio.com/us1/monitor/logs/messages):
- **Message history** - All sent messages
- **Delivery status** - Sent, delivered, failed, read
- **Error codes** - Detailed error messages
- **Cost tracking** - Usage and billing

### Message Statuses

| Status | Description |
|--------|-------------|
| **queued** | Message queued for delivery |
| **sent** | Sent to WhatsApp servers |
| **delivered** | Delivered to recipient |
| **read** | Read by recipient |
| **failed** | Failed to deliver |
| **undelivered** | Could not be delivered |

### Logging Best Practices

```typescript
const sendWhatsAppMessageWithLogging = async (to: string, message: string) => {
  const startTime = Date.now();
  
  try {
    const result = await sendWhatsAppMessage(to, message);
    
    console.log({
      status: 'success',
      to: to,
      sid: result.sid,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    console.error({
      status: 'failed',
      to: to,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};
```

---

## 🚀 Production Setup

### Moving from Sandbox to Production

1. **Apply for WhatsApp Business Profile**
   - Go to [Twilio Console](https://console.twilio.com/)
   - Navigate to WhatsApp → Senders
   - Click "Request to add a new sender"
   - Submit business information

2. **Get Approved Templates**
   - WhatsApp requires pre-approved message templates
   - Submit templates for review
   - Wait 24-48 hours for approval

3. **Configure Sender**
   - Set up branded sender name
   - Add business description
   - Upload business logo

4. **Update Phone Number**
   ```bash
   # Change from sandbox number
   TWILIO_FROM_PHONE_NUMBER="whatsapp:+919876543210"
   ```

### Template Example

```typescript
// Pre-approved template
const sendTemplateMessage = async (to: string, templateSid: string, variables: any) => {
  const client = getTwilioClient();
  
  await client.messages.create({
    from: getTwilioFromPhoneNumber(),
    to: `whatsapp:${to}`,
    contentSid: templateSid,
    contentVariables: JSON.stringify(variables)
  });
};

// Usage
await sendTemplateMessage(
  '+919876543210',
  'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  {
    '1': 'Reliance',
    '2': '2456.75',
    '3': '1.88'
  }
);
```

---

## 📚 Related Documentation

- **[Watchlist Guide](../guides/watchlist.md#price-alerts)** - Price alert configuration
- **[API Endpoints](endpoints.md#notification-endpoints)** - Notification APIs
- **[Setup Guide](../guides/setup.md)** - Initial configuration

## 🔗 External Resources

- **[Twilio Documentation](https://www.twilio.com/docs)** - Official docs
- **[WhatsApp API](https://www.twilio.com/docs/whatsapp)** - WhatsApp-specific docs
- **[Pricing](https://www.twilio.com/whatsapp/pricing)** - Detailed pricing
- **[Console](https://console.twilio.com/)** - Twilio dashboard
- **[Support](https://support.twilio.com/)** - Get help

---

**Last Updated:** October 2025
