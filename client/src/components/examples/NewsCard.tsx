import NewsCard from '@/components/NewsCard';

export default function NewsCardExample() {
  const news = {
    id: "1",
    title: "Indian Stock Markets Hit All-Time High on Strong GDP Growth",
    source: "Economic Times",
    timestamp: "2 hours ago",
    description: "Nifty 50 and Sensex reached record levels amid positive economic indicators and strong corporate earnings.",
  };

  return (
    <div className="p-4">
      <NewsCard 
        news={news} 
        onClick={(id) => console.log('News clicked:', id)}
      />
    </div>
  );
}
