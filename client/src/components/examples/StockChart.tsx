import { useState } from 'react';
import StockChart, { TimeRange } from '../StockChart';

export default function StockChartExample() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");

  const generateData = () => {
    const basePrice = 1685;
    const points = selectedRange === "1D" ? 24 : selectedRange === "1W" ? 7 : 30;
    return Array.from({ length: points }, (_, i) => ({
      time: `${i}`,
      value: basePrice + Math.random() * 50 - 25,
    }));
  };

  return (
    <div className="h-screen">
      <StockChart
        symbol="HDFCBANK"
        name="HDFC Bank"
        currentPrice={1685.40}
        change={23.50}
        changePercent={1.42}
        data={generateData()}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onClose={() => console.log('Close chart')}
      />
    </div>
  );
}
