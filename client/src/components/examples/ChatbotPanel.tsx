import { useState } from 'react';
import ChatbotPanel from '../ChatbotPanel';

export default function ChatbotPanelExample() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Hello! I'm here to provide market insights. How can I help you today?",
      isBot: true,
      timestamp: "10:30 AM",
    },
  ]);

  const handleSendMessage = (message: string) => {
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: message,
        isBot: false,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <ChatbotPanel
      isOpen={true}
      onClose={() => console.log('Close chatbot')}
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
}
