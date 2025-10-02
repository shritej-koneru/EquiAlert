import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import NewsCard, { NewsItem } from "@/components/NewsCard";
import NewsFilter, { NewsCategory } from "@/components/NewsFilter";
import ProfileModal, { UserProfile } from "@/components/ProfileModal";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotPanel, { ChatMessage } from "@/components/ChatbotPanel";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // todo: remove mock functionality - Replace with real user profile from backend
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    profession: "",
    whatsappNumber: "",
  });

  // todo: remove mock functionality - Replace with NewsAPI.org data
  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "Indian Stock Markets Hit All-Time High on Strong GDP Growth",
      source: "Economic Times",
      timestamp: "2 hours ago",
      description: "Nifty 50 and Sensex reached record levels amid positive economic indicators and strong corporate earnings.",
    },
    {
      id: "2",
      title: "HDFC Bank Reports 20% Growth in Q4 Profits",
      source: "Business Standard",
      timestamp: "3 hours ago",
      description: "HDFC Bank's quarterly results exceeded analyst expectations with strong loan growth and reduced NPA levels.",
    },
    {
      id: "3",
      title: "Reliance Industries Announces Major Investment in Green Energy",
      source: "NDTV Profit",
      timestamp: "5 hours ago",
      description: "Mukesh Ambani-led Reliance Industries plans to invest $10 billion in renewable energy projects over the next three years.",
    },
    {
      id: "4",
      title: "IT Sector Shows Recovery with TCS and Infosys Gaining Ground",
      source: "Mint",
      timestamp: "6 hours ago",
      description: "Technology stocks rebounded as global demand for IT services improved in the latest quarter.",
    },
    {
      id: "5",
      title: "RBI Maintains Interest Rates Amid Inflation Concerns",
      source: "The Hindu BusinessLine",
      timestamp: "1 day ago",
      description: "Reserve Bank of India kept repo rate unchanged at 6.5% in its latest monetary policy review.",
    },
  ];

  // todo: remove mock functionality - Replace with real chat messages from Grok API
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "I can help you understand market news and sentiment. Ask me anything!",
      isBot: true,
      timestamp: "10:30 AM",
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([...chatMessages, newMessage]);
    
    // todo: remove mock functionality - Send to Grok API for real response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Based on recent news, the banking sector is showing strong performance with HDFC Bank leading the gains.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const filteredNews = newsItems.filter(news => {
    const matchesCategory = selectedCategory === "All" || 
      (selectedCategory === "Banking" && (news.title.includes("Bank") || news.title.includes("RBI"))) ||
      (selectedCategory === "Technology" && (news.title.includes("IT") || news.title.includes("TCS") || news.title.includes("Infosys"))) ||
      (selectedCategory === "Energy" && news.title.includes("Energy")) ||
      (selectedCategory === "India" && true) ||
      (selectedCategory === "Global" && false);
    
    const matchesSearch = searchQuery === "" || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-16 pt-16">
      <TopBar 
        notificationCount={0}
        onNotificationClick={() => setIsChatOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="container mx-auto max-w-7xl px-4 mt-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Market News</h1>
        
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search news..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-news-search"
            />
          </div>
          
          <NewsFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news found</p>
            </div>
          ) : (
            filteredNews.map((news) => (
              <NewsCard 
                key={news.id} 
                news={news} 
                onClick={(id) => console.log('News clicked:', id)}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />
      <ChatbotButton onClick={() => setIsChatOpen(true)} hasNewMessages={false} />
      <ChatbotPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
}
