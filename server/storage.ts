import { type User, type InsertUser, type Profile, type InsertProfile, type Watchlist, type InsertWatchlist } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  getWatchlist(userId: string): Promise<Watchlist[]>;
  getAllWatchlistItems(): Promise<Watchlist[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(id: string, userId: string): Promise<boolean>;
  updateWatchlistAlert(id: string, userId: string, hasAlert: boolean): Promise<boolean>;
  updateWatchlistPrice(id: string, price: number, change: number, changePercent: number): Promise<Watchlist | undefined>;
  refreshWatchlist(userId: string): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private watchlist: Map<string, Watchlist>;
  private rotationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.watchlist = new Map();
    this.initializeDefaultStocks();
    this.startWatchlistRotation();
  }

  private initializeDefaultStocks() {
    this.refreshWatchlist("demo-user-1");
  }

  private startWatchlistRotation() {
    // Rotate watchlist stocks every 30 seconds
    this.rotationInterval = setInterval(() => {
      this.refreshWatchlist("demo-user-1");
    }, 30000);
  }

  refreshWatchlist(userId: string): void {
    // Remove existing watchlist items for this user
    const existingItems = Array.from(this.watchlist.entries())
      .filter(([_, item]) => item.userId === userId);
    existingItems.forEach(([id, _]) => this.watchlist.delete(id));

    // Load available stocks from JSON file
    const availableStocksPath = join(__dirname, 'availableStocks.json');
    const availableStocks = JSON.parse(readFileSync(availableStocksPath, 'utf-8'));
    
    // Filter to get only stocks (not indices)
    const stocksOnly = availableStocks.filter((item: any) => item.type === 'Stock');
    
    // Randomly select 7 stocks
    const selectedStocks = [];
    const stocksCopy = [...stocksOnly];
    for (let i = 0; i < 7 && stocksCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * stocksCopy.length);
      selectedStocks.push(stocksCopy.splice(randomIndex, 1)[0]);
    }

    // Add selected stocks to watchlist with mock price data
    selectedStocks.forEach(stock => {
      const id = randomUUID();
      const mockPrice = 100 + Math.random() * 10000; // Random price between 100 and 10,100
      const mockChangePercent = (Math.random() * 6) - 3; // Random change between -3% and +3%
      const change = (mockPrice * mockChangePercent) / 100;
      const baselinePrice = mockPrice - change;
      
      const item: Watchlist = {
        id,
        userId,
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(mockPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(mockChangePercent.toFixed(2)),
        baselinePrice: parseFloat(baselinePrice.toFixed(2)),
        hasAlert: true,
        addedAt: new Date(),
      };
      this.watchlist.set(id, item);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { ...insertProfile, id };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(userId: string, profileData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const updated: Profile = { ...existing, ...profileData };
      this.profiles.set(existing.id, updated);
      return updated;
    }
    return undefined;
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return Array.from(this.watchlist.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = randomUUID();
    const item: Watchlist = { 
      ...insertWatchlist,
      hasAlert: insertWatchlist.hasAlert ?? false,
      id,
      addedAt: new Date(),
    };
    this.watchlist.set(id, item);
    return item;
  }

  async removeFromWatchlist(id: string, userId: string): Promise<boolean> {
    const item = this.watchlist.get(id);
    if (item && item.userId === userId) {
      return this.watchlist.delete(id);
    }
    return false;
  }

  async updateWatchlistAlert(id: string, userId: string, hasAlert: boolean): Promise<boolean> {
    const item = this.watchlist.get(id);
    if (item && item.userId === userId) {
      item.hasAlert = hasAlert;
      this.watchlist.set(id, item);
      return true;
    }
    return false;
  }

  async getAllWatchlistItems(): Promise<Watchlist[]> {
    return Array.from(this.watchlist.values());
  }

  async updateWatchlistPrice(id: string, price: number, change: number, changePercent: number): Promise<Watchlist | undefined> {
    const item = this.watchlist.get(id);
    if (item) {
      const updated: Watchlist = { ...item, price, change, changePercent };
      this.watchlist.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
