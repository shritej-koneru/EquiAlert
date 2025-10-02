import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export default function ChatbotPanel({ isOpen, onClose, messages, onSendMessage }: ChatbotPanelProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    if (message.trim()) {
      onSendMessage(message);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 h-3/4 bg-card rounded-t-3xl border-t border-card-border shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-4 border-b border-card-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Market Insights</h2>
            <p className="text-sm text-muted-foreground">AI-Powered by Grok</p>
          </div>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-chatbot"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.isBot ? "bg-secondary" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 border-t border-card-border bg-card">
          <div className="flex gap-2">
            <Input
              name="message"
              placeholder="Ask about market trends..."
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button 
              type="submit" 
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
