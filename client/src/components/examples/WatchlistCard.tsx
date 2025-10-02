import WatchlistCard from '../WatchlistCard';

export default function WatchlistCardExample() {
  const stock = {
    id: "1",
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: 1685.40,
    change: 23.50,
    changePercent: 1.42,
    hasAlert: true,
    chartData: [
      { value: 1650 },
      { value: 1660 },
      { value: 1655 },
      { value: 1670 },
      { value: 1675 },
      { value: 1680 },
      { value: 1685 },
    ],
  };

  return (
    <div className="p-4">
      <WatchlistCard
        stock={stock}
        onRemove={(id) => console.log('Remove:', id)}
        onSetAlert={(id) => console.log('Set alert:', id)}
        onClick={(id) => console.log('Clicked:', id)}
      />
    </div>
  );
}
