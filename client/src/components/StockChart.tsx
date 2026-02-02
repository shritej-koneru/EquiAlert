import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ComposedChart, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  Area,
  ReferenceLine,
  Cell
} from "recharts";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export interface ChartDataPoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma50?: number;
  sma200?: number;
  ema?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
}

export interface ChartStats {
  dayHigh: number;
  dayLow: number;
  weekHigh52: number;
  weekLow52: number;
  openPrice: number;
  currentPrice: number;
  avgVolume: number;
}

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";
export type ChartType = "line" | "candlestick" | "area";

interface StockChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  data: ChartDataPoint[];
  stats?: ChartStats;
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onClose: () => void;
}

// Custom candlestick shape component
const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, high, low, fill } = props;
  const isGrowing = close > open;
  const color = isGrowing ? "#00FF7F" : "#FF4C4C";
  const ratio = Math.abs(height / (open - close));
  
  return (
    <g>
      {/* Wick (high-low line) */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body (open-close rectangle) */}
      <rect
        x={x}
        y={isGrowing ? y + height - (close - open) * ratio : y}
        width={width}
        height={Math.abs((close - open) * ratio)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  const isPositive = data.close >= data.open;
  
  return (
    <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">{data.time}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Open:</span>
          <span className="font-mono">₹{data.open.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">High:</span>
          <span className="font-mono text-positive">₹{data.high.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Low:</span>
          <span className="font-mono text-negative">₹{data.low.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Close:</span>
          <span className={`font-mono ${isPositive ? 'text-positive' : 'text-negative'}`}>
            ₹{data.close.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-card-border">
          <span className="text-muted-foreground">Volume:</span>
          <span className="font-mono text-xs">{(data.volume / 1000).toFixed(0)}K</span>
        </div>
        {data.sma50 && !isNaN(data.sma50) && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">SMA 50:</span>
            <span className="font-mono text-blue-500">₹{data.sma50.toFixed(2)}</span>
          </div>
        )}
        {data.sma200 && !isNaN(data.sma200) && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">SMA 200:</span>
            <span className="font-mono text-purple-500">₹{data.sma200.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StockChart({
  symbol,
  name,
  currentPrice,
  change,
  changePercent,
  data,
  stats,
  selectedRange,
  onRangeChange,
  onClose,
}: StockChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);

  const isPositive = change >= 0;
  const chartColor = isPositive ? "#00FF7F" : "#FF4C4C";
  const timeRanges: TimeRange[] = ["1D", "1W", "1M", "1Y", "5Y"];

  // Show loading state if no data
  const isLoading = !data || data.length === 0;

  // Add color property to each data point based on price movement
  const coloredData = data.map((point, index) => {
    if (index === 0) {
      return { ...point, color: point.close >= point.open ? "#00FF7F" : "#FF4C4C" };
    }
    const prevClose = data[index - 1].close;
    const isUp = point.close >= prevClose;
    return { ...point, color: isUp ? "#00FF7F" : "#FF4C4C" };
  });

  // Calculate min/max for better Y-axis scaling
  const prices = data.map(d => [d.high, d.low]).flat();
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  // Find min and max points for markers
  const maxDataPoint = data.reduce((max, d) => d.high > max.high ? d : max, data[0] || { high: 0 });
  const minDataPoint = data.reduce((min, d) => d.low < min.low ? d : min, data[0] || { low: Infinity });

  return (
    <Card className="h-full overflow-auto">
      <div className="sticky top-0 bg-card z-10 p-4 border-b border-card-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-positive" />
              ) : (
                <TrendingDown className="w-5 h-5 text-negative" />
              )}
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

        {/* Performance Indicators */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">Open</p>
              <p className="font-mono font-semibold">₹{stats.openPrice.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">Day High</p>
              <p className="font-mono font-semibold text-positive">₹{stats.dayHigh.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">Day Low</p>
              <p className="font-mono font-semibold text-negative">₹{stats.dayLow.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">Avg Volume</p>
              <p className="font-mono font-semibold">{(stats.avgVolume / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">52W High</p>
              <p className="font-mono font-semibold text-positive">₹{stats.weekHigh52.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">52W Low</p>
              <p className="font-mono font-semibold text-negative">₹{stats.weekLow52.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">Day Range</p>
              <p className="font-mono font-semibold text-xs">
                {stats.dayLow.toFixed(0)} - {stats.dayHigh.toFixed(0)}
              </p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-muted-foreground mb-1">52W Range</p>
              <p className="font-mono font-semibold text-xs">
                {stats.weekLow52.toFixed(0)} - {stats.weekHigh52.toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                console.log('🔄 Time range changed to:', range);
                onRangeChange(range);
              }}
              data-testid={`button-range-${range}`}
              className="flex-shrink-0"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Chart Type and Indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex gap-1 border border-card-border rounded-md p-1">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className="h-7 px-2 text-xs"
            >
              Line
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
              className="h-7 px-2 text-xs"
            >
              Area
            </Button>
            <Button
              variant={chartType === "candlestick" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("candlestick")}
              className="h-7 px-2 text-xs"
            >
              Candle
            </Button>
          </div>
          
          <Button
            variant={showVolume ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVolume(!showVolume)}
            className="h-7 px-2 text-xs"
          >
            Volume
          </Button>
          
          <Button
            variant={showSMA50 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSMA50(!showSMA50)}
            className="h-7 px-2 text-xs"
          >
            SMA 50
          </Button>
          
          <Button
            variant={showSMA200 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSMA200(!showSMA200)}
            className="h-7 px-2 text-xs"
          >
            SMA 200
          </Button>
          
          <Button
            variant={showBollinger ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBollinger(!showBollinger)}
            className="h-7 px-2 text-xs"
          >
            Bollinger
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Main Price Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={coloredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              domain={[minPrice, maxPrice]}
              tickFormatter={(value) => `₹${value.toFixed(0)}`}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              iconSize={10}
            />
            
            {/* Bollinger Bands */}
            {showBollinger && (
              <>
                <Area
                  type="monotone"
                  dataKey="bollingerUpper"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="BB Upper"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="bollingerLower"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="BB Lower"
                  connectNulls
                />
              </>
            )}

            {/* Moving Averages */}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="SMA 50"
                connectNulls
              />
            )}
            
            {showSMA200 && (
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                name="SMA 200"
                connectNulls
              />
            )}

            {/* Price Chart */}
            {chartType === "line" && (
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            )}
            
            {chartType === "area" && (
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                fill="url(#colorGradient)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            )}

            {/* Reference lines for min/max */}
            {data.length > 0 && (
              <>
                <ReferenceLine 
                  y={maxDataPoint.high} 
                  stroke="hsl(var(--positive))" 
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: `High: ₹${maxDataPoint.high.toFixed(2)}`, position: 'right', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={minDataPoint.low} 
                  stroke="hsl(var(--negative))" 
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: `Low: ₹${minDataPoint.low.toFixed(2)}`, position: 'right', fontSize: 10 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Volume Chart */}
        {showVolume && (
          <ResponsiveContainer width="100%" height={120} className="mt-4">
            <ComposedChart data={coloredData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-card-border rounded p-2 text-xs">
                      <p className="text-muted-foreground">{data.time}</p>
                      <p className="font-mono font-semibold">
                        Volume: {(data.volume / 1000).toFixed(0)}K
                      </p>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="volume" 
                name="Volume"
              >
                {coloredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}
          </>
        )}
      </div>
    </Card>
  );
}
