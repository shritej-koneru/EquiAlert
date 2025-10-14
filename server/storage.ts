import { type User, type InsertUser, type Profile, type InsertProfile, type Watchlist, type InsertWatchlist } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private watchlist: Map<string, Watchlist>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.watchlist = new Map();
    this.initializeDefaultStocks();
  }

  private initializeDefaultStocks() {
    const DEMO_USER_ID = "demo-user-1";
    const defaultStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2850.50, changePercent: 1.25 },
      { symbol: 'INFY', name: 'Infosys Ltd', price: 1920.75, changePercent: -0.85 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4150.25, changePercent: 2.10 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1285.60, changePercent: -1.50 },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1750.80, changePercent: 0.65 },
      { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12450.25, changePercent: -2.20 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1680.90, changePercent: 1.80 },
    ];

    defaultStocks.forEach(stock => {
      const id = randomUUID();
      const change = (stock.price * stock.changePercent) / 100;
      const baselinePrice = stock.price - change;
      const item: Watchlist = {
        id,
        userId: DEMO_USER_ID,
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: change,
        changePercent: stock.changePercent,
        baselinePrice: baselinePrice,
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
