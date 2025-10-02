import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: newsData, isLoading, isError, error } = useQuery<{ articles: NewsItem[] }>({
    queryKey: ['/api/news', { category: selectedCategory !== "All" ? selectedCategory : undefined, q: searchQuery.trim() || undefined }],
  });

  const newsItems = newsData?.articles || [];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "I can help you understand market news and sentiment. Ask me anything!",
      isBot: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: UserProfile) => {
      const res = await apiRequest('POST', '/api/profile', profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: string }) => {
      const res = await apiRequest('POST', '/api/chat', { message, context });
      return res.json();
    },
  });

  const handleSendMessage = async (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    const newsContext = newsItems.slice(0, 3).map(n => n.title).join('; ');
    
    try {
      const response = await chatMutation.mutateAsync({ 
        message, 
        context: `Recent news headlines: ${newsContext}` 
      });
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    saveProfileMutation.mutate(profileData);
  };

  const handleNewsClick = (id: string) => {
    const article = newsItems.find(n => n.id === id);
    if (article && 'url' in article) {
      window.open(article.url as string, '_blank');
    }
  };

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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive font-semibold mb-2">Failed to load news</p>
              <p className="text-muted-foreground text-sm">
                {error instanceof Error ? error.message : 'An error occurred while fetching news'}
              </p>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news found</p>
            </div>
          ) : (
            newsItems.map((news) => (
              <NewsCard 
                key={news.id} 
                news={news} 
                onClick={handleNewsClick}
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
        profile={profile || { name: "", profession: "", whatsappNumber: "" }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
