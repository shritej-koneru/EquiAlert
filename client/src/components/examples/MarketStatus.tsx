import MarketStatus from '@/components/MarketStatus';

export default function MarketStatusExample() {
  return (
    <div className="p-4 space-y-4">
      <MarketStatus 
        isOpen={true} 
        currentTime="2:45 PM IST"
      />
      <MarketStatus 
        isOpen={false} 
        currentTime="5:30 PM IST"
        nextOpenTime="Mon, 9:15 AM IST"
      />
    </div>
  );
}
