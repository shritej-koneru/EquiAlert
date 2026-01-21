import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { SearchResult } from "@/components/StockSearch";
import StockChart, { TimeRange, ChartDataPoint, ChartStats } from "@/components/StockChart";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoricalDataResponse {
  symbol: string;
  data: ChartDataPoint[];
  indicators?: {
    sma50?: number[];
    sma200?: number[];
    ema?: number[];
    bollingerUpper?: number[];
    bollingerLower?: number[];
  };
  stats: ChartStats;
}

export default function Stocks() {
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartStats, setChartStats] = useState<ChartStats | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "I can provide insights about stocks and market trends. What would you like to know?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: watchlistData = [] } = useQuery<any[]>({
    queryKey: ['/api/watchlist'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: availableStocks = [] } = useQuery<SearchResult[]>({
    queryKey: ['/api/stocks/available'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const watchlistSymbols = new Set(watchlistData.map(item => item.symbol));

  // Fetch historical data when stock or range changes
  useEffect(() => {
    if (!selectedStock) {
      setChartData([]);
      setChartStats(undefined);
      return;
    }

    console.log('📊 Fetching historical data for:', selectedStock.symbol, 'Range:', selectedRange);

    const fetchHistoricalData = async () => {
      try {
        const response = await apiRequest(
          'GET',
          `/api/stocks/historical/${selectedStock.symbol}/${selectedRange}`
        );
        const data: HistoricalDataResponse = await response.json();
        
        console.log('✅ Historical data loaded:', data.data.length, 'points');
        
        // Merge indicators into chart data
        const mergedData = data.data.map((point, i) => ({
          ...point,
          sma50: data.indicators?.sma50?.[i],
          sma200: data.indicators?.sma200?.[i],
          ema: data.indicators?.ema?.[i],
          bollingerUpper: data.indicators?.bollingerUpper?.[i],
          bollingerLower: data.indicators?.bollingerLower?.[i],
        }));
        
        setChartData(mergedData);
        setChartStats(data.stats);
      } catch (error) {
        console.error('❌ Failed to fetch historical data:', error);
        toast({
          title: "Error loading chart data",
          description: "Could not load historical data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchHistoricalData();
  }, [selectedStock, selectedRange, toast]);

  // Update selected stock price every 5 seconds
  useEffect(() => {
    if (!selectedStock) return;

    const updateStockPrice = async () => {
      try {
        const response = await apiRequest('GET', '/api/stocks/available');
        const stocks: SearchResult[] = await response.json();
        const updatedStock = stocks.find(s => s.symbol === selectedStock.symbol);
        
        if (updatedStock) {
          setSelectedStock(prev => prev ? { ...prev, price: updatedStock.price, changePercent: updatedStock.changePercent } : null);
        }
      } catch (error) {
        console.error('Failed to update stock price:', error);
      }
    };

    // Update every 5 seconds
    const interval = setInterval(updateStockPrice, 5000);
    return () => clearInterval(interval);
  }, [selectedStock?.symbol]);

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
    onError: () => {
      toast({
        title: "Failed to add",
        description: "Could not add stock to watchlist. Please try again.",
        variant: "destructive",
      });
    },
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

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: string }) => {
      const res = await apiRequest('POST', '/api/chat', { message, context });
      return res.json();
    },
  });

  const handleSendMessage = async (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    try {
      const response = await chatMutation.mutateAsync({ message });
      
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

  const handleAddToWatchlist = (stock: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlistSymbols.has(stock.symbol)) {
      toast({
        title: "Already in watchlist",
        description: `${stock.symbol} is already in your watchlist.`,
      });
      return;
    }
    addToWatchlistMutation.mutate(stock);
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    saveProfileMutation.mutate(profileData);
  };

  if (selectedStock) {
    const change = (selectedStock.price * selectedStock.changePercent) / 100;
    return (
      <div className="h-screen">
        <StockChart
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          currentPrice={selectedStock.price}
          change={change}
          changePercent={selectedStock.changePercent}
          data={chartData}
          stats={chartStats}
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
        notificationCount={0}
        onNotificationClick={() => setIsChatOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="container mx-auto max-w-7xl px-4 mt-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Stocks</h1>
        
        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Available Stocks</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {availableStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              const inWatchlist = watchlistSymbols.has(stock.symbol);
              
              return (
                <Card
                  key={stock.symbol}
                  className="p-4 cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setSelectedStock(stock)}
                  data-testid={`card-suggested-${stock.symbol}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{stock.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <Button
                      size="icon"
                      variant={inWatchlist ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={(e) => handleAddToWatchlist(stock, e)}
                      data-testid={`button-add-${stock.symbol}`}
                      disabled={addToWatchlistMutation.isPending}
                    >
                      {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-foreground">
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
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
