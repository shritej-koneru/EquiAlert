import { Clock } from "lucide-react";

interface MarketStatusProps {
  isOpen: boolean;
  currentTime: string;
  nextOpenTime?: string;
}

export default function MarketStatus({ isOpen, currentTime, nextOpenTime }: MarketStatusProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg">
      <div className={`w-2 h-2 rounded-full ${isOpen ? "bg-positive" : "bg-negative"} animate-pulse`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            {isOpen ? "Market Open" : "Market Closed"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isOpen ? `Current Time: ${currentTime}` : `Next Open: ${nextOpenTime}`}
        </p>
      </div>
    </div>
  );
}
