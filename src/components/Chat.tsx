import { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Send, ChevronRight, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId: number;
}

export const Chat = ({ messages, onSendMessage, currentUserId }: ChatProps) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground font-medium">Чат</span>
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {messages.length} сообщ.
            </span>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <GlassCard className="animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Чат
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-sm text-primary hover:text-primary/80"
        >
          Свернуть
        </button>
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto custom-scrollbar mb-3 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Пока нет сообщений.<br />
              Напишите первое!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg ${
                msg.userId === currentUserId
                  ? 'bg-primary/20 ml-4'
                  : 'bg-secondary mr-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-foreground">
                  {msg.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground break-words">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Написать сообщение..."
          className="glass-input flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </GlassCard>
  );
};
