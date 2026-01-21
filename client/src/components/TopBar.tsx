import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface StockPriceData {
  ticker: string;
  exchange: string;
  price: number;
  currency?: string;
  error?: string;
}

interface TopBarProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
  onStockSelect?: (stock: SearchResult) => void;
}

export default function TopBar({ 
  onNotificationClick, 
  onProfileClick,
  notificationCount = 0,
  onStockSelect,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [stockPrices, setStockPrices] = useState<Map<string, StockPriceData>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);

  // Search for stocks
  const { data: searchResults = [] } = useQuery<StockSearchResult[]>({
    queryKey: ['/api/stocks/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      return data.results || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // Fetch prices for search results and update every 5 seconds
  useEffect(() => {
    if (searchResults.length === 0) return;

    const fetchPrices = async () => {
      searchResults.forEach(async (stock) => {
        const key = `${stock.symbol}-${stock.exchange}`;
        
        // Skip if loading
        if (loadingPrices.has(key)) return;
        
        setLoadingPrices(prev => new Set(prev).add(key));
        
        try {
          const res = await fetch(`/api/stocks/python/${stock.symbol}/${stock.exchange}`);
          const data = await res.json();
          
          if (!data.error) {
            setStockPrices(prev => new Map(prev).set(key, data));
          }
        } catch (error) {
          console.error('Failed to fetch stock price:', error);
        } finally {
          setLoadingPrices(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        }
      });
    };

    // Fetch immediately
    fetchPrices();
    
    // Fetch every 5 seconds while search results are visible
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [searchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show results when search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
      setStockPrices(new Map());
      setLoadingPrices(new Set());
    }
  }, [searchQuery]);

  const handleStockClick = (stock: StockSearchResult) => {
    const key = `${stock.symbol}-${stock.exchange}`;
    const priceData = stockPrices.get(key);
    
    if (priceData && onStockSelect) {
      onStockSelect({
        symbol: stock.symbol,
        name: stock.name,
        price: priceData.price,
        changePercent: 0,
      });
    }
    
    // Close dropdown after selection
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-card-border">
      <div className="flex items-center justify-between h-full px-4 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary" data-testid="text-brand">
            EQUIALERT
          </h1>
        </div>
        
        {/* Stock Search */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.length >= 2 && searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              className="pl-10 pr-4"
            />
          </div>
          
          {/* Search Results Dropdown with Prices */}
          {showResults && (
            <div className="absolute top-full mt-1 w-full bg-card border border-card-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((stock) => {
                  const key = `${stock.symbol}-${stock.exchange}`;
                  const priceData = stockPrices.get(key);
                  const isLoading = loadingPrices.has(key);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleStockClick(stock)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-card-border last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-base">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{stock.exchange}</div>
                        </div>
                        <div className="text-right ml-4">
                          {isLoading ? (
                            <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
                          ) : priceData ? (
                            <>
                              <div className="text-lg font-bold">
                                {priceData.currency === 'USD' ? '$' : '₹'}{priceData.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">{priceData.currency || 'INR'}</div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : searchQuery.length >= 2 ? (
                <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                  No stocks found
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
