import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface TopBarProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  onStockSelect?: (stock: SearchResult) => void;
}

const availableStocks: SearchResult[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2850.50, changePercent: 0.83 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4150.25, changePercent: -0.40 },
  { symbol: "INFY", name: "Infosys", price: 1920.75, changePercent: 0.68 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1680.90, changePercent: 1.42 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1285.60, changePercent: -0.35 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1834.20, changePercent: 0.82 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2456.30, changePercent: 0.56 },
  { symbol: "NESTLEIND", name: "Nestlé India", price: 2389.75, changePercent: -0.23 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1750.80, changePercent: 1.15 },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", price: 9234.50, changePercent: 2.34 },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 12450.25, changePercent: -0.67 },
  { symbol: "LT", name: "Larsen & Toubro", price: 3567.90, changePercent: 1.12 },
  { symbol: "WIPRO", name: "Wipro", price: 567.45, changePercent: 0.34 },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 145.60, changePercent: -1.25 },
  { symbol: "ASIANPAINT", name: "Asian Paints", price: 2987.50, changePercent: 0.45 },
  { symbol: "JUBLFOOD", name: "Jubilant Foodworks", price: 606.90, changePercent: -0.85 },
  { symbol: "INDIGO", name: "InterGlobe Aviation", price: 5257.95, changePercent: 1.24 },
  { symbol: "SPICEJET", name: "SpiceJet", price: 39.99, changePercent: -1.15 },
  { symbol: "INDIANHOT", name: "Indian Hotels", price: 735.30, changePercent: 0.67 },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 660.75, changePercent: 0.92 },
  { symbol: "NAGAFERT", name: "Nagarjuna Fertilizers", price: 5.15, changePercent: -2.34 },
  { symbol: "KCPSUGIND", name: "KCP Sugar & Industries", price: 32.50, changePercent: -0.56 },
  { symbol: "JIOFIN", name: "Jio Financial Services", price: 308.45, changePercent: 0.10 },
];

export default function TopBar({ 
  onNotificationClick, 
  onProfileClick,
  notificationCount = 0,
  onStockSelect
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchResults = searchQuery.trim() === "" 
    ? availableStocks.slice(0, 8)
    : availableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectStock = (stock: SearchResult) => {
    onStockSelect?.(stock);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-card-border">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary" data-testid="text-brand">
            EQUIALERT
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search NSE stocks..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-stock-search-topbar"
                  />
                </div>

                <ScrollArea className="h-80">
                  <div className="space-y-1">
                    {searchResults.map((stock) => {
                      const isPositive = stock.changePercent >= 0;
                      return (
                        <button
                          key={stock.symbol}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover-elevate active-elevate-2 text-left"
                          onClick={() => handleSelectStock(stock)}
                          data-testid={`button-search-result-${stock.symbol}`}
                        >
                          <div>
                            <p className="font-semibold text-foreground">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-semibold text-foreground">
                              ₹{stock.price.toLocaleString('en-IN')}
                            </p>
                            <p className={`text-sm font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
                              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                className="relative"
                data-testid="button-notifications"
                onClick={onNotificationClick}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-negative rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <h3 className="font-semibold mb-2">Notifications</h3>
                {notificationCount === 0 ? (
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm p-2 rounded bg-positive/10 border-l-2 border-positive">
                      <p className="font-medium text-positive">HDFC Bank +2.5%</p>
                      <p className="text-muted-foreground text-xs">Price alert triggered</p>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            size="icon" 
            variant="ghost"
            data-testid="button-profile"
            onClick={onProfileClick}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
