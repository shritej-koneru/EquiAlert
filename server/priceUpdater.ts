import { storage } from "./storage";
import { getTwilioClient, getTwilioFromPhoneNumber } from "./twilio";
import { getStockPriceFromGoogle } from "./googleFinance";
import { needsRefresh, getCachedPrice, setCachedPrice, cleanExpiredCache } from "./priceCache";

interface NotificationState {
  lastNotificationPrice: number;
  lastNotified: number;
}

class PriceUpdater {
  private notificationState: Map<string, NotificationState> = new Map();
  private interval: NodeJS.Timeout | null = null;

  async start() {
    console.log("Starting price updater - will update every 30 minutes");
    
    // Initialize cache with baseline prices from watchlist
    await this.initializeBaselines();
    
    this.updatePrices();
    // Update every 30 minutes instead of 5 to conserve API calls
    this.interval = setInterval(() => this.updatePrices(), 30 * 60 * 1000);
  }

  private async initializeBaselines() {
    try {
      const allWatchlistItems = await storage.getAllWatchlistItems();
      console.log(`Initializing baseline prices for ${allWatchlistItems.length} watchlist items`);
      
      for (const item of allWatchlistItems) {
        // Set cached price with baseline from database
        setCachedPrice(
          item.symbol,
          item.price,
          'INR',
          'NSE',
          item.baselinePrice
        );
      }
      
      console.log(`✓ Baselines initialized for watchlist items`);
    } catch (error) {
      console.error("Error initializing baselines:", error);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("Price updater stopped");
    }
  }

  private async updatePrices() {
    try {
      // Clean expired cache entries before updating
      cleanExpiredCache();
      
      const allWatchlistItems = await storage.getAllWatchlistItems();
      
      // Filter items that need price refresh (cache expired or missing)
      const itemsNeedingUpdate = allWatchlistItems.filter(item => {
        if (item.symbol === "USD/INR") return false;
        return needsRefresh(item.symbol);
      });
      
      if (itemsNeedingUpdate.length === 0) {
        console.log(`✓ All ${allWatchlistItems.length} watchlist prices are cached and fresh`);
        return;
      }
      
      console.log(`Updating prices for ${itemsNeedingUpdate.length}/${allWatchlistItems.length} watchlist items (others cached)`);

      const currentWatchlistIds = new Set(allWatchlistItems.map(item => item.id));
      const stateIds = Array.from(this.notificationState.keys());
      for (const stateId of stateIds) {
        if (!currentWatchlistIds.has(stateId)) {
          this.notificationState.delete(stateId);
          console.log(`Cleaned up notification state for removed item: ${stateId}`);
        }
      }

      for (const item of itemsNeedingUpdate) {
        let notifState = this.notificationState.get(item.id);
        if (!notifState) {
          notifState = {
            lastNotificationPrice: item.price,
            lastNotified: 0,
          };
          this.notificationState.set(item.id, notifState);
        }

        // Ensure baseline is set in cache before fetching
        setCachedPrice(item.symbol, item.price, 'INR', 'NSE', item.baselinePrice);
        
        // Fetch real stock price from Google Finance scraper
        const stockData = await getStockPriceFromGoogle(item.symbol, 'NSE');
        
        if (!stockData || stockData.error) {
          console.log(`Could not fetch price for ${item.symbol}, skipping update`);
          continue;
        }

        const newPrice = stockData.price;
        const newChange = newPrice - item.baselinePrice;
        const newChangePercent = (newChange / item.baselinePrice) * 100;
        const tickChangePercent = ((newPrice - item.price) / item.price) * 100;

        let updated: any;
        try {
          updated = await storage.updateWatchlistPrice(
            item.id,
            newPrice,
            newChange,
            newChangePercent
          );
        } catch (updateError) {
          console.error(`Failed to update price for ${item.symbol}:`, updateError);
          this.notificationState.delete(item.id);
          continue;
        }

        if (updated) {
          console.log(
            `Updated ${item.symbol}: ${item.price.toFixed(2)} -> ${newPrice.toFixed(2)} (${tickChangePercent > 0 ? '+' : ''}${tickChangePercent.toFixed(2)}% this tick, ${newChangePercent > 0 ? '+' : ''}${newChangePercent.toFixed(2)}% total)`
          );

          const percentChangeSinceLastNotification = 
            ((newPrice - notifState.lastNotificationPrice) / notifState.lastNotificationPrice) * 100;
          const timeSinceLastNotification = Date.now() - notifState.lastNotified;
          const notificationCooldown = 2 * 60 * 1000;

          if (
            item.hasAlert &&
            Math.abs(percentChangeSinceLastNotification) >= 1 &&
            (notifState.lastNotified === 0 || timeSinceLastNotification > notificationCooldown)
          ) {
            try {
              await this.sendNotification(item.userId, item.symbol, percentChangeSinceLastNotification, newPrice);
              notifState.lastNotificationPrice = newPrice;
              notifState.lastNotified = Date.now();
              this.notificationState.set(item.id, notifState);
            } catch (notifyError) {
              console.error(`Failed to send notification for ${item.symbol}:`, notifyError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating prices:", error);
    }
  }

  private async sendNotification(
    userId: string,
    symbol: string,
    percentChange: number,
    currentPrice: number
  ) {
    try {
      const profile = await storage.getProfile(userId);
      if (!profile || !profile.phoneNumber) {
        return;
      }

      const client = await getTwilioClient();
      const fromNumber = await getTwilioFromPhoneNumber();

      if (!fromNumber) {
        console.error("Twilio phone number not configured");
        return;
      }

      const toPhoneNumber = profile.phoneNumber.startsWith('+')
        ? profile.phoneNumber
        : `+${profile.phoneNumber}`;

      const message = `🔔 Stock Alert: ${symbol} ${percentChange > 0 ? '📈 increased' : '📉 decreased'} by ${Math.abs(percentChange).toFixed(2)}%\nCurrent Price: ₹${currentPrice.toFixed(2)}`;

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: toPhoneNumber,
      });

      console.log(`Sent SMS notification for ${symbol} to ${toPhoneNumber}`);
    } catch (error) {
      console.error(`Failed to send SMS notification for ${symbol}:`, error);
    }
  }
}

export const priceUpdater = new PriceUpdater();
