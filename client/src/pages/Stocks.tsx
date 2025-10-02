import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import StockSearch, { SearchResult } from "@/components/StockSearch";
import StockChart, { TimeRange, ChartDataPoint } from "@/components/StockChart";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // todo: remove mock functionality - Replace with real user profile from backend
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    profession: "",
    whatsappNumber: "",
  });

  // todo: remove mock functionality - Replace with real stock data from API
  const availableStocks: SearchResult[] = [
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1685.40, changePercent: 1.42 },
    { symbol: "ICICIBANK", name: "ICICI Bank", price: 1145.75, changePercent: -0.35 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1834.20, changePercent: 0.82 },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2456.30, changePercent: 0.56 },
    { symbol: "NESTLEIND", name: "Nestlé India", price: 2389.75, changePercent: -0.23 },
    { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1678.90, changePercent: 1.15 },
    { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", price: 9234.50, changePercent: 2.34 },
    { symbol: "MARUTI", name: "Maruti Suzuki", price: 12456.80, changePercent: -0.67 },
  ];

  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : availableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // todo: remove mock functionality - Replace with real chat messages from Grok API
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "I can provide insights about stocks and market trends. What would you like to know?",
      isBot: true,
      timestamp: "10:30 AM",
    },
  ]);

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
        content: "HDFC Bank is showing strong technical indicators with good volume support. Consider this as a potential buy opportunity.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  // todo: remove mock functionality - Generate real chart data based on selected range
  const generateChartData = (): ChartDataPoint[] => {
    if (!selectedStock) return [];
    const basePrice = selectedStock.price;
    const points = selectedRange === "1D" ? 24 : selectedRange === "1W" ? 7 : selectedRange === "1M" ? 30 : selectedRange === "1Y" ? 12 : 60;
    return Array.from({ length: points }, (_, i) => ({
      time: selectedRange === "1D" ? `${i}:00` : selectedRange === "1W" ? `Day ${i + 1}` : selectedRange === "1M" ? `Day ${i + 1}` : selectedRange === "1Y" ? `Month ${i + 1}` : `Year ${i + 1}`,
      value: basePrice + (Math.random() * basePrice * 0.1 - basePrice * 0.05),
    }));
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
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to watchlist:', stock.symbol);
                      }}
                      data-testid={`button-add-${stock.symbol}`}
                    >
                      <Plus className="w-4 h-4" />
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
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
}
