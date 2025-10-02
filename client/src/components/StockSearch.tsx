import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface StockSearchProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  onSelectStock: (stock: SearchResult) => void;
}

export default function StockSearch({ onSearch, results, onSelectStock }: StockSearchProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stocks..."
          className="pl-10"
          onChange={(e) => onSearch(e.target.value)}
          data-testid="input-stock-search"
        />
      </div>

      {results.length > 0 && (
        <Card className="p-2">
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {results.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <button
                    key={stock.symbol}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover-elevate active-elevate-2 text-left"
                    onClick={() => onSelectStock(stock)}
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
        </Card>
      )}
    </div>
  );
}
