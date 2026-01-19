import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TopBar, { SearchResult } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import StockTicker, { StockTickerItem } from "@/components/StockTicker";
import WatchlistCard, { WatchlistStock } from "@/components/WatchlistCard";
import MarketStatus from "@/components/MarketStatus";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import StockChart, { TimeRange, ChartDataPoint } from "@/components/StockChart";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! I'm your AI assistant powered by Grok. I can help you analyze stocks and market trends. What would you like to know?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const { toast } = useToast();

  const [tickerStocks, setTickerStocks] = useState<StockTickerItem[]>([
    { symbol: "RELIANCE", name: "Reliance Ind", price: 0, change: 0, changePercent: 0 },
    { symbol: "TCS", name: "Tata Consultancy", price: 0, change: 0, changePercent: 0 },
    { symbol: "INFY", name: "Infosys", price: 0, change: 0, changePercent: 0 },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 0, change: 0, changePercent: 0 },
    { symbol: "ICICIBANK", name: "ICICI Bank", price: 0, change: 0, changePercent: 0 },
  ]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);


  const [currentTime, setCurrentTime] = useState("");
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [nextOpenTime, setNextOpenTime] = useState("");
  
  const watchlistPriceTracker = useRef(new Map<string, { price: number, lastNotified: number, lastUpdated: number }>());
  const baselinePrices = useRef(new Map<string, number>());

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: watchlistData = [], isLoading: watchlistLoading } = useQuery<any[]>({
    queryKey: ['/api/watchlist'],
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const watchlistStocks: WatchlistStock[] = watchlistData.map(item => {
    const tickerStock = tickerStocks.find(ts => ts.symbol === item.symbol);
    if (tickerStock) {
      return {
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        price: tickerStock.price,
        change: tickerStock.change,
        changePercent: tickerStock.changePercent,
        hasAlert: item.hasAlert,
        chartData: generateMiniChartData(tickerStock.price),
      };
    }
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.changePercent,
      hasAlert: item.hasAlert,
      chartData: generateMiniChartData(item.price),
    };
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: UserProfile) => {
      const res = await apiRequest('POST', '/api/profile', profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/watchlist/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Removed from watchlist",
        description: "Stock has been removed from your watchlist.",
      });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, hasAlert }: { id: string; hasAlert: boolean }) => {
      const res = await apiRequest('PATCH', `/api/watchlist/${id}/alert`, { hasAlert: !hasAlert });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: string }) => {
      const res = await apiRequest('POST', '/api/chat', { message, context });
      return res.json();
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async ({ message, stockSymbol, changePercent }: { message: string; stockSymbol: string; changePercent: number }) => {
      const res = await apiRequest('POST', '/api/notify', { message, stockSymbol, changePercent });
      return res.json();
    },
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (stock: SearchResult) => {
      const change = (stock.price * stock.changePercent) / 100;
      const res = await apiRequest('POST', '/api/watchlist', {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: change,
        changePercent: stock.changePercent,
      });
      return res.json();
    },
    onSuccess: (data, stock) => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Added to watchlist",
        description: `${stock.symbol} has been added to your watchlist.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      
      setCurrentTime(istTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) + " IST");

      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      const marketOpenMinutes = 9 * 60 + 15;
      const marketCloseMinutes = 15 * 60 + 30;

      const dayOfWeek = istTime.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend && currentMinutes >= marketOpenMinutes && currentMinutes < marketCloseMinutes) {
        setIsMarketOpen(true);
        setNextOpenTime("");
      } else {
        setIsMarketOpen(false);
        if (isWeekend || dayOfWeek === 5 && currentMinutes >= marketCloseMinutes) {
          setNextOpenTime("Monday, 9:15 AM IST");
        } else if (currentMinutes >= marketCloseMinutes) {
          setNextOpenTime("Tomorrow, 9:15 AM IST");
        } else {
          setNextOpenTime("Today, 9:15 AM IST");
        }
      }
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    watchlistData.forEach(item => {
      if (!watchlistPriceTracker.current.has(item.id)) {
        const tickerStock = tickerStocks.find(ts => ts.symbol === item.symbol);
        const currentPrice = tickerStock ? tickerStock.price : item.price;
        watchlistPriceTracker.current.set(item.id, { 
          price: currentPrice, 
          lastNotified: 0,
          lastUpdated: Date.now()
        });
      }
    });
  }, [watchlistData, tickerStocks]);

  // Fetch real stock prices from Google Finance API
  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const stocksToFetch = [
          { ticker: "RELIANCE", exchange: "NSE" },
          { ticker: "TCS", exchange: "NSE" },
          { ticker: "INFY", exchange: "NSE" },
          { ticker: "HDFCBANK", exchange: "NSE" },
          { ticker: "ICICIBANK", exchange: "NSE" },
        ];

        const res = await apiRequest('POST', '/api/stocks/google/batch', { stocks: stocksToFetch });
        const data = await res.json();
        
        if (data.stocks && Array.isArray(data.stocks)) {
          const updatedStocks = data.stocks.map((stockData: any, index: number) => {
            const stockInfo = tickerStocks[index];
            if (stockData.error || stockData.price === 0) {
              return stockInfo; // Keep existing data if fetch failed
            }

            // Calculate change from baseline
            const baseline = baselinePrices.current.get(stockData.ticker) || stockData.price;
            if (!baselinePrices.current.has(stockData.ticker)) {
              baselinePrices.current.set(stockData.ticker, stockData.price);
            }
            
            const change = stockData.price - baseline;
            const changePercent = (change / baseline) * 100;

            return {
              symbol: stockData.ticker,
              name: stockInfo.name,
              price: stockData.price,
              change: change,
              changePercent: changePercent,
            };
          });
          
          setTickerStocks(updatedStocks);
        }
      } catch (error) {
        console.error('Failed to fetch stock prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    // Fetch immediately on mount
    fetchStockPrices();
    
    // Fetch every 5 minutes
    const interval = setInterval(fetchStockPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor watchlist for price alerts
  useEffect(() => {
    watchlistData.forEach(item => {
      const tickerStock = tickerStocks.find(ts => ts.symbol === item.symbol);
      if (!tickerStock || tickerStock.price === 0) return;

      const tracked = watchlistPriceTracker.current.get(item.id);
      if (!tracked) {
        watchlistPriceTracker.current.set(item.id, {
          price: tickerStock.price,
          lastNotified: 0,
          lastUpdated: Date.now()
        });
        return;
      }

      const currentPrice = tickerStock.price;
      const baselinePrice = tracked.price;
      const percentChange = ((currentPrice - baselinePrice) / baselinePrice) * 100;
      const timeSinceLastNotification = Date.now() - tracked.lastNotified;
      
      if (item.hasAlert && profile?.phoneNumber && Math.abs(percentChange) >= 1 && 
          (tracked.lastNotified === 0 || timeSinceLastNotification > 2 * 60 * 1000)) {
        const message = `🔔 Stock Alert: ${item.symbol} ${percentChange > 0 ? '📈 increased' : '📉 decreased'} by ${Math.abs(percentChange).toFixed(2)}%\nCurrent Price: ₹${currentPrice.toFixed(2)}`;
        console.log(`Sending SMS alert for ${item.symbol}: ${message}`);
        notifyMutation.mutate({ message, stockSymbol: item.symbol, changePercent: percentChange });
        watchlistPriceTracker.current.set(item.id, {
          price: currentPrice,
          lastNotified: Date.now(),
          lastUpdated: Date.now()
        });
      }
    });
  }, [watchlistData, profile, tickerStocks]);

  const handleSendMessage = async (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    const watchlistContext = watchlistStocks.map(s => `${s.symbol}: ₹${s.price.toFixed(2)} (${s.changePercent > 0 ? '+' : ''}${s.changePercent.toFixed(2)}%)`).join(', ');
    
    try {
      const response = await chatMutation.mutateAsync({ 
        message, 
        context: `User's watchlist: ${watchlistContext}` 
      });
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleStockClick = (stock: StockTickerItem) => {
    setSelectedStock(stock.symbol);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    removeFromWatchlistMutation.mutate(id);
  };

  const handleSetAlert = (id: string) => {
    const stock = watchlistStocks.find(s => s.id === id);
    if (stock) {
      updateAlertMutation.mutate({ id, hasAlert: stock.hasAlert });
    }
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    saveProfileMutation.mutate(profileData);
  };

  const handleStockSelect = (stock: SearchResult) => {
    const alreadyInWatchlist = watchlistData.some(item => item.symbol === stock.symbol);
    if (alreadyInWatchlist) {
      toast({
        title: "Already in watchlist",
        description: `${stock.symbol} is already in your watchlist.`,
      });
      return;
    }
    addToWatchlistMutation.mutate(stock);
  };

  const handleNotificationClick = async () => {
    if (!profile?.phoneNumber) {
      toast({
        title: "Phone not configured",
        description: "Please add your phone number in your profile to receive notifications.",
        variant: "destructive",
      });
      setIsProfileOpen(true);
      return;
    }

    const stocksWithAlerts = watchlistStocks.filter(s => s.hasAlert);
    if (stocksWithAlerts.length === 0) {
      toast({
        title: "No alerts set",
        description: "Set alerts on your watchlist stocks to receive notifications.",
      });
      return;
    }

    const summary = stocksWithAlerts.map(s => 
      `${s.symbol}: ₹${s.price.toFixed(2)} (${s.changePercent > 0 ? '+' : ''}${s.changePercent.toFixed(2)}%)`
    ).join('\n');
    
    try {
      await notifyMutation.mutateAsync({ 
        message: `Watchlist Summary:\n${summary}`, 
        stockSymbol: "Watchlist",
        changePercent: 0 
      });
      toast({
        title: "Notification sent",
        description: "Watchlist summary sent via SMS.",
      });
    } catch (error) {
      toast({
        title: "Failed to send notification",
        description: "Please check your phone number and Twilio configuration.",
        variant: "destructive",
      });
    }
  };

  const generateChartData = (stock: StockTickerItem): ChartDataPoint[] => {
    const basePrice = stock.price;
    const points = selectedRange === "1D" ? 24 : selectedRange === "1W" ? 7 : selectedRange === "1M" ? 30 : selectedRange === "1Y" ? 12 : 60;
    return Array.from({ length: points }, (_, i) => ({
      time: selectedRange === "1D" ? `${i}:00` : `Day ${i + 1}`,
      value: basePrice + Math.random() * 100 - 50,
    }));
  };

  function generateMiniChartData(basePrice: number) {
    return Array.from({ length: 7 }, () => ({
      value: basePrice + (Math.random() - 0.5) * basePrice * 0.05,
    }));
  }

  if (selectedStock) {
    let stock = tickerStocks.find(s => s.symbol === selectedStock);
    
    if (!stock) {
      const watchlistItem = watchlistData.find(w => w.symbol === selectedStock);
      if (watchlistItem) {
        stock = {
          symbol: watchlistItem.symbol,
          name: watchlistItem.name,
          price: watchlistItem.price,
          change: watchlistItem.change,
          changePercent: watchlistItem.changePercent
        };
      }
    }
    
    if (!stock) return null;

    return (
      <div className="h-screen">
        <StockChart
          symbol={stock.symbol}
          name={stock.name}
          currentPrice={stock.price}
          change={stock.change}
          changePercent={stock.changePercent}
          data={generateChartData(stock)}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          onClose={() => setSelectedStock(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-16">
      <TopBar 
        notificationCount={watchlistStocks.filter(s => s.hasAlert).length}
        onNotificationClick={handleNotificationClick}
        onProfileClick={() => setIsProfileOpen(true)}
        onStockSelect={handleStockSelect}
      />

      <main className="container mx-auto max-w-7xl">
        <div className="mt-4 px-4">
          <MarketStatus 
            isOpen={isMarketOpen} 
            currentTime={currentTime}
            nextOpenTime={nextOpenTime}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground px-4 mb-3">Market Overview</h2>
          <StockTicker stocks={tickerStocks} onStockClick={handleStockClick} />
        </div>

        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">My Watchlist</h2>
          </div>

          {watchlistLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading watchlist...</p>
            </div>
          ) : watchlistStocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No stocks in watchlist</p>
              <p className="text-sm text-muted-foreground mt-2">Go to Stocks page to add stocks to your watchlist</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {watchlistStocks.map((stock) => (
                <WatchlistCard
                  key={stock.id}
                  stock={stock}
                  onRemove={handleRemoveFromWatchlist}
                  onSetAlert={handleSetAlert}
                  onClick={() => setSelectedStock(stock.symbol)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
      <ChatbotButton onClick={() => setIsChatOpen(true)} hasNewMessages={false} />
      <ChatbotPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile || { name: "", profession: "", phoneNumber: "" }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
