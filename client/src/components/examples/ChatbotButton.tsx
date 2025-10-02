import ChatbotButton from '../ChatbotButton';

export default function ChatbotButtonExample() {
  return (
    <div className="relative h-96">
      <ChatbotButton 
        onClick={() => console.log('Chatbot opened')}
        hasNewMessages={true}
      />
    </div>
  );
}
