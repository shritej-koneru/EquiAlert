import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import StockTicker, { StockTickerItem } from "@/components/StockTicker";
import WatchlistCard, { WatchlistStock } from "@/components/WatchlistCard";
import MarketStatus from "@/components/MarketStatus";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import StockChart, { TimeRange, ChartDataPoint } from "@/components/StockChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  
  // todo: remove mock functionality - Replace with real user profile from backend
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    profession: "",
    whatsappNumber: "",
  });

  // todo: remove mock functionality - Replace with real-time stock data from API
  const tickerStocks: StockTickerItem[] = [
    { symbol: "USD/INR", name: "US Dollar", price: 88.67, change: 0.15, changePercent: 0.17 },
    { symbol: "NIFTY 50", name: "Nifty 50", price: 23567.80, change: 145.30, changePercent: 0.62 },
    { symbol: "SENSEX", name: "BSE Sensex", price: 77890.25, change: -234.50, changePercent: -0.30 },
    { symbol: "RELIANCE", name: "Reliance Ind", price: 2845.60, change: 23.40, changePercent: 0.83 },
    { symbol: "TCS", name: "Tata Consultancy", price: 3967.25, change: -15.80, changePercent: -0.40 },
    { symbol: "INFY", name: "Infosys", price: 1823.50, change: 12.30, changePercent: 0.68 },
  ];

  // todo: remove mock functionality - Replace with user's watchlist from backend
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([
    {
      id: "1",
      symbol: "HDFCBANK",
      name: "HDFC Bank",
      price: 1685.40,
      change: 23.50,
      changePercent: 1.42,
      hasAlert: true,
      chartData: [{ value: 1650 }, { value: 1660 }, { value: 1655 }, { value: 1670 }, { value: 1675 }, { value: 1680 }, { value: 1685 }],
    },
    {
      id: "2",
      symbol: "ICICIBANK",
      name: "ICICI Bank",
      price: 1145.75,
      change: -4.25,
      changePercent: -0.37,
      hasAlert: false,
      chartData: [{ value: 1160 }, { value: 1155 }, { value: 1150 }, { value: 1148 }, { value: 1147 }, { value: 1146 }, { value: 1145 }],
    },
  ]);

  // todo: remove mock functionality - Replace with real chat messages from Grok API
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Market Update: Nifty 50 is up 0.62% today. Banking sector showing strong momentum.",
      isBot: true,
      timestamp: "10:30 AM",
    },
  ]);

  // todo: remove mock functionality - Calculate based on IST market hours (9:15 AM - 3:30 PM)
  const isMarketOpen = true;
  const currentTime = "2:45 PM IST";

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([...chatMessages, newMessage]);
    
    // todo: remove mock functionality - Send to Grok API for real response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Based on current market trends, your watchlist stocks are performing well. HDFC Bank shows strong buying momentum.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleStockClick = (stock: StockTickerItem) => {
    setSelectedStock(stock.symbol);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlistStocks(prev => prev.filter(s => s.id !== id));
    console.log('Remove stock from watchlist:', id);
  };

  const handleSetAlert = (id: string) => {
    console.log('Set alert for stock:', id);
  };

  // todo: remove mock functionality - Generate real chart data based on selected range
  const generateChartData = (): ChartDataPoint[] => {
    const basePrice = 1685;
    const points = selectedRange === "1D" ? 24 : selectedRange === "1W" ? 7 : selectedRange === "1M" ? 30 : selectedRange === "1Y" ? 12 : 60;
    return Array.from({ length: points }, (_, i) => ({
      time: selectedRange === "1D" ? `${i}:00` : `Day ${i + 1}`,
      value: basePrice + Math.random() * 100 - 50,
    }));
  };

  if (selectedStock) {
    return (
      <div className="h-screen">
        <StockChart
          symbol={selectedStock}
          name={tickerStocks.find(s => s.symbol === selectedStock)?.name || "Stock"}
          currentPrice={tickerStocks.find(s => s.symbol === selectedStock)?.price || 0}
          change={tickerStocks.find(s => s.symbol === selectedStock)?.change || 0}
          changePercent={tickerStocks.find(s => s.symbol === selectedStock)?.changePercent || 0}
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
        notificationCount={1}
        onNotificationClick={() => setIsChatOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="container mx-auto max-w-7xl">
        <div className="mt-4 px-4">
          <MarketStatus 
            isOpen={isMarketOpen} 
            currentTime={currentTime}
            nextOpenTime="Tomorrow, 9:15 AM IST"
          />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground px-4 mb-3">Market Overview</h2>
          <StockTicker stocks={tickerStocks} onStockClick={handleStockClick} />
        </div>

        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">My Watchlist</h2>
            <Button size="sm" data-testid="button-add-watchlist">
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>

          {watchlistStocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No stocks in watchlist</p>
              <Button variant="ghost" className="mt-4" data-testid="button-add-first-stock">
                Add your first stock
              </Button>
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
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
}
