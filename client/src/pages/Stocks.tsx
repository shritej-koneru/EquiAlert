import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import StockSearch, { SearchResult } from "@/components/StockSearch";
import StockChart, { TimeRange, ChartDataPoint } from "@/components/StockChart";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
  });

  const { data: availableStocks = [] } = useQuery<SearchResult[]>({
    queryKey: ['/api/stocks/available'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const watchlistSymbols = new Set(watchlistData.map(item => item.symbol));

  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : availableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

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

  const generateChartData = (): ChartDataPoint[] => {
    if (!selectedStock) return [];
    const basePrice = selectedStock.price;
    const points = selectedRange === "1D" ? 24 : selectedRange === "1W" ? 7 : selectedRange === "1M" ? 30 : selectedRange === "1Y" ? 12 : 60;
    return Array.from({ length: points }, (_, i) => ({
      time: selectedRange === "1D" ? `${i}:00` : selectedRange === "1W" ? `Day ${i + 1}` : selectedRange === "1M" ? `Day ${i + 1}` : selectedRange === "1Y" ? `Month ${i + 1}` : `Year ${i + 1}`,
      value: basePrice + (Math.random() * basePrice * 0.1 - basePrice * 0.05),
    }));
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
          data={generateChartData()}
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
        <h1 className="text-2xl font-bold text-foreground mb-4">Search Stocks</h1>
        
        <StockSearch
          onSearch={setSearchQuery}
          results={searchResults}
          onSelectStock={setSelectedStock}
        />

        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Suggested Stocks</h2>
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
