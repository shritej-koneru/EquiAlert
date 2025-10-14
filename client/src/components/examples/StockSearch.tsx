import { useState } from 'react';
import React from 'react';
import StockSearch from '@/components/StockSearch';

export default function StockSearchExample() {
  const [results] = useState([
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1685.40, changePercent: 1.42 },
    { symbol: "ICICIBANK", name: "ICICI Bank", price: 1145.75, changePercent: -0.35 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1834.20, changePercent: 0.82 },
  ]);

  return (
    <div className="p-4">
      <StockSearch
        onSearch={(query) => console.log('Search:', query)}
        results={results}
        onSelectStock={(stock) => console.log('Selected:', stock.symbol)}
      />
    </div>
  );
}
