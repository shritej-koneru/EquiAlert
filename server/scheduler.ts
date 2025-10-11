import { storage } from "./storage";
import { getTwilioClient, getTwilioFromPhoneNumber } from "./twilio";

interface ScheduledNotification {
  time: string;
  type: 'market_open' | 'market_close' | 'stock_update';
  stockSymbol?: string;
  message?: string;
}

const SCHEDULED_NOTIFICATIONS: ScheduledNotification[] = [
  { time: '09:15', type: 'market_open', message: '📈 Stock Market is now OPEN! NSE/BSE trading begins.' },
  { time: '10:30', type: 'stock_update', stockSymbol: 'RELIANCE' },
  { time: '11:24', type: 'stock_update', stockSymbol: 'INFY' },
  { time: '12:45', type: 'stock_update', stockSymbol: 'TCS' },
  { time: '14:43', type: 'stock_update', stockSymbol: 'RELIANCE' },
  { time: '15:12', type: 'stock_update', stockSymbol: 'ICICIBANK' },
  { time: '15:30', type: 'market_close', message: '📉 Stock Market is now CLOSED. Trading ends for today.' },
  { time: '18:36', type: 'market_close', message: '🌙 Stock Market is closed. It will reopen tomorrow morning at 9:15 AM.' },
  { time: '18:48', type: 'market_close', message: '✅ Test notification: WhatsApp integration is working successfully!' }
];

class NotificationScheduler {
  private interval: NodeJS.Timeout | null = null;
  private sentToday: Set<string> = new Set();

  start() {
    console.log('Starting notification scheduler...');
    this.checkAndSendNotifications();
    this.interval = setInterval(() => this.checkAndSendNotifications(), 60000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Notification scheduler stopped');
    }
  }

  private async checkAndSendNotifications() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    const currentDate = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    if (this.sentToday.size > 0 && !this.sentToday.has(currentDate)) {
      this.sentToday.clear();
    }

    for (const notification of SCHEDULED_NOTIFICATIONS) {
      const notificationKey = `${currentDate}-${notification.time}-${notification.stockSymbol || notification.type}`;
      
      if (currentTime === notification.time && !this.sentToday.has(notificationKey)) {
        await this.sendNotification(notification);
        this.sentToday.add(notificationKey);
      }
    }
  }

  private async sendNotification(notification: ScheduledNotification) {
    try {
      const whatsappNumber = process.env.WHATSAPP_NUMBER;
      
      if (!whatsappNumber) {
        console.error('WhatsApp number not configured');
        return;
      }

      let message = notification.message || '';

      if (notification.type === 'stock_update' && notification.stockSymbol) {
        const watchlistItems = await storage.getAllWatchlistItems();
        const stock = watchlistItems.find(item => item.symbol === notification.stockSymbol);
        
        if (stock) {
          const changeDirection = stock.changePercent >= 0 ? 'increased' : 'decreased';
          const changeSymbol = stock.changePercent >= 0 ? '📈' : '📉';
          message = `${changeSymbol} ${stock.name} (${stock.symbol}) ${changeDirection} by ${Math.abs(stock.changePercent).toFixed(2)}%\nCurrent Price: ₹${stock.price.toFixed(2)}`;
        } else {
          message = `ℹ️ ${notification.stockSymbol} update not available. Add it to your watchlist for tracking.`;
        }
      }

      if (message) {
        const client = await getTwilioClient();
        const fromNumber = await getTwilioFromPhoneNumber();

        if (fromNumber) {
          const formattedWhatsappNumber = whatsappNumber.startsWith('+') 
            ? whatsappNumber 
            : `+${whatsappNumber}`;

          await client.messages.create({
            body: message,
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${formattedWhatsappNumber}`
          });

          console.log(`Scheduled notification sent at ${notification.time}: ${notification.type}`);
        }
      }
    } catch (error) {
      console.error('Failed to send scheduled notification:', error);
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
