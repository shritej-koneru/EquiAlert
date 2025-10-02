import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatbotButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
}

export default function ChatbotButton({ onClick, hasNewMessages }: ChatbotButtonProps) {
  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-primary to-primary/80"
      onClick={onClick}
      data-testid="button-chatbot"
    >
      <MessageSquare className="w-6 h-6" />
      {hasNewMessages && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-negative rounded-full animate-pulse" />
      )}
    </Button>
  );
}
