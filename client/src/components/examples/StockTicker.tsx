import StockTicker from '../StockTicker';

export default function StockTickerExample() {
  const stocks = [
    { symbol: "USD/INR", name: "US Dollar", price: 88.67, change: 0.15, changePercent: 0.17 },
    { symbol: "NIFTY 50", name: "Nifty 50", price: 23567.80, change: 145.30, changePercent: 0.62 },
    { symbol: "SENSEX", name: "BSE Sensex", price: 77890.25, change: -234.50, changePercent: -0.30 },
    { symbol: "RELIANCE", name: "Reliance Ind", price: 2845.60, change: 23.40, changePercent: 0.83 },
    { symbol: "TCS", name: "Tata Consultancy", price: 3967.25, change: -15.80, changePercent: -0.40 },
    { symbol: "INFY", name: "Infosys", price: 1823.50, change: 12.30, changePercent: 0.68 },
  ];

  return (
    <StockTicker 
      stocks={stocks} 
      onStockClick={(stock) => console.log('Stock clicked:', stock.symbol)}
    />
  );
}
