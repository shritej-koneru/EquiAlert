import { TrendingUp, TrendingDown, Bell, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart } from "recharts";

export interface WatchlistStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  hasAlert: boolean;
  chartData: { value: number }[];
}

interface WatchlistCardProps {
  stock: WatchlistStock;
  onRemove?: (id: string) => void;
  onSetAlert?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function WatchlistCard({ stock, onRemove, onSetAlert, onClick }: WatchlistCardProps) {
  const isPositive = stock.change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-positive" : "text-negative";
  const chartColor = isPositive ? "#00FF7F" : "#FF4C4C";

  return (
    <Card 
      className="p-4 cursor-pointer hover-elevate active-elevate-2"
      onClick={() => onClick?.(stock.id)}
      data-testid={`card-watchlist-${stock.symbol}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{stock.symbol}</h3>
            {stock.hasAlert && (
              <Bell className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onSetAlert?.(stock.id);
            }}
            data-testid={`button-alert-${stock.symbol}`}
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(stock.id);
            }}
            data-testid={`button-remove-${stock.symbol}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold font-mono text-foreground">
            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Icon className={`w-4 h-4 ${colorClass}`} />
            <p className={`text-sm font-semibold ${colorClass}`}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="w-24 h-16">
          <LineChart width={96} height={64} data={stock.chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </div>
      </div>
    </Card>
  );
}
