import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";

export interface ChartDataPoint {
  time: string;
  value: number;
}

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

interface StockChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  data: ChartDataPoint[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onClose: () => void;
}

export default function StockChart({
  symbol,
  name,
  currentPrice,
  change,
  changePercent,
  data,
  selectedRange,
  onRangeChange,
  onClose,
}: StockChartProps) {
  const isPositive = change >= 0;
  const chartColor = isPositive ? "#00FF7F" : "#FF4C4C";
  const timeRanges: TimeRange[] = ["1D", "1W", "1M", "1Y", "5Y"];

  return (
    <Card className="h-full overflow-auto">
      <div className="sticky top-0 bg-card z-10 p-4 border-b border-card-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-chart"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold font-mono text-foreground">
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => onRangeChange(range)}
              data-testid={`button-range-${range}`}
              className="flex-shrink-0"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--card-border))",
                borderRadius: "6px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
