import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  imageUrl?: string;
  description?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick?: (id: string) => void;
}

export default function NewsCard({ news, onClick }: NewsCardProps) {
  return (
    <Card 
      className="p-4 cursor-pointer hover-elevate active-elevate-2"
      onClick={() => onClick?.(news.id)}
      data-testid={`card-news-${news.id}`}
    >
      <div className="flex gap-3">
        {news.imageUrl && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-secondary">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
            {news.title}
          </h3>
          
          {news.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {news.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{news.source}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{news.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
