import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface StockTickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockTickerProps {
  stocks: StockTickerItem[];
  onStockClick?: (stock: StockTickerItem) => void;
}

export default function StockTicker({ stocks, onStockClick }: StockTickerProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-4 py-3">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          const Icon = isPositive ? TrendingUp : TrendingDown;
          const colorClass = isPositive ? "text-positive" : "text-negative";
          
          return (
            <Card
              key={stock.symbol}
              className="flex-shrink-0 w-40 p-3 cursor-pointer hover-elevate active-elevate-2"
              onClick={() => onStockClick?.(stock)}
              data-testid={`card-ticker-${stock.symbol}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {stock.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {stock.name}
                  </p>
                </div>
                <Icon className={`w-4 h-4 flex-shrink-0 ${colorClass}`} />
              </div>
              
              <div>
                <p className="text-lg font-bold font-mono text-foreground">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-semibold ${colorClass}`}>
                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
