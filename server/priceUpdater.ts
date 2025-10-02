import { storage } from "./storage";
import { getTwilioClient, getTwilioFromPhoneNumber } from "./twilio";

interface NotificationState {
  lastNotificationPrice: number;
  lastNotified: number;
}

class PriceUpdater {
  private notificationState: Map<string, NotificationState> = new Map();
  private interval: NodeJS.Timeout | null = null;

  start() {
    console.log("Starting price updater - will update every 5 minutes");
    this.updatePrices();
    this.interval = setInterval(() => this.updatePrices(), 5 * 60 * 1000);
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
      const allWatchlistItems = await storage.getAllWatchlistItems();
      console.log(`Updating prices for ${allWatchlistItems.length} watchlist items`);

      const currentWatchlistIds = new Set(allWatchlistItems.map(item => item.id));
      const stateIds = Array.from(this.notificationState.keys());
      for (const stateId of stateIds) {
        if (!currentWatchlistIds.has(stateId)) {
          this.notificationState.delete(stateId);
          console.log(`Cleaned up notification state for removed item: ${stateId}`);
        }
      }

      for (const item of allWatchlistItems) {
        if (item.symbol === "USD/INR") {
          continue;
        }

        let notifState = this.notificationState.get(item.id);
        if (!notifState) {
          notifState = {
            lastNotificationPrice: item.price,
            lastNotified: 0,
          };
          this.notificationState.set(item.id, notifState);
        }

        const tickChangePercent = (Math.random() - 0.5) * 4;
        const tickChange = item.price * (tickChangePercent / 100);
        const newPrice = item.price + tickChange;
        const newChange = newPrice - item.baselinePrice;
        const newChangePercent = (newChange / item.baselinePrice) * 100;

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
      if (!profile || !profile.whatsappNumber) {
        return;
      }

      const client = await getTwilioClient();
      const fromNumber = await getTwilioFromPhoneNumber();

      if (!fromNumber) {
        console.error("Twilio phone number not configured");
        return;
      }

      const whatsappNumber = profile.whatsappNumber.startsWith('+')
        ? profile.whatsappNumber
        : `+${profile.whatsappNumber}`;

      const message = `🔔 Stock Alert: ${symbol} ${percentChange > 0 ? '📈 increased' : '📉 decreased'} by ${Math.abs(percentChange).toFixed(2)}%\nCurrent Price: ₹${currentPrice.toFixed(2)}`;

      await client.messages.create({
        body: message,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${whatsappNumber}`,
      });

      console.log(`Sent WhatsApp notification for ${symbol} to ${whatsappNumber}`);
    } catch (error) {
      console.error(`Failed to send WhatsApp notification for ${symbol}:`, error);
    }
  }
}

export const priceUpdater = new PriceUpdater();
