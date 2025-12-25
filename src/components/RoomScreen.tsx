import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { VideoPlayer } from './VideoPlayer';
import { ParticipantsList } from './ParticipantsList';
import { Chat } from './Chat';
import { VideoUrlInput } from './VideoUrlInput';
import { useTelegram } from '@/hooks/useTelegram';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Copy, 
  Check, 
  Volume2, 
  Share2, 
  ArrowLeft,
  Users,
  Link
} from 'lucide-react';

interface RoomScreenProps {
  roomId: string;
  isHost: boolean;
  onLeave: () => void;
}

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  text: string;
  timestamp: number;
}

interface Participant {
  id: number;
  name: string;
  isHost: boolean;
  isConnected: boolean;
}

export const RoomScreen = ({ roomId, isHost, onLeave }: RoomScreenProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const { hapticFeedback, user, showBackButton, hideBackButton, onBackButtonClick } = useTelegram();
  const { isConnected, sendMessage, lastMessage, connect, disconnect } = useWebSocket();

  // Setup back button
  useEffect(() => {
    showBackButton();
    onBackButtonClick(() => {
      handleLeave();
    });
    return () => {
      hideBackButton();
    };
  }, [showBackButton, hideBackButton, onBackButtonClick]);

  // Connect to WebSocket
  useEffect(() => {
    connect(roomId);
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  // Initialize participants
  useEffect(() => {
    if (user) {
      setParticipants([
        {
          id: user.id,
          name: user.firstName,
          isHost,
          isConnected: true,
        },
        // Demo participants
        {
          id: 2,
          name: 'User1',
          isHost: false,
          isConnected: true,
        },
        {
          id: 3,
          name: 'User2',
          isHost: false,
          isConnected: true,
        },
      ]);
    }
  }, [user, isHost]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'chat':
          setMessages((prev) => [...prev, lastMessage.payload]);
          break;
        case 'participant_joined':
          setParticipants((prev) => [...prev, lastMessage.payload]);
          break;
        case 'participant_left':
          setParticipants((prev) => 
            prev.filter((p) => p.id !== lastMessage.payload.id)
          );
          break;
      }
    }
  }, [lastMessage]);

  const handleCopyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      hapticFeedback('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      hapticFeedback('error');
    }
  }, [roomId, hapticFeedback]);

  const handleVideoUrlSubmit = useCallback((url: string) => {
    setUrlError(null);
    setVideoUrl(url);
    hapticFeedback('success');
    
    // Notify other participants
    sendMessage({
      type: 'video_url',
      payload: { url },
    });
  }, [hapticFeedback, sendMessage]);

  const handleSendChatMessage = useCallback((text: string) => {
    if (!user) return;
    
    const message: ChatMessage = {
      id: Date.now(),
      userId: user.id,
      userName: user.firstName,
      text,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, message]);
    sendMessage({
      type: 'chat',
      payload: message,
    });
    hapticFeedback('light');
  }, [user, sendMessage, hapticFeedback]);

  const handleLeave = useCallback(() => {
    hapticFeedback('medium');
    disconnect();
    onLeave();
  }, [hapticFeedback, disconnect, onLeave]);

  const handleShare = useCallback(() => {
    hapticFeedback('light');
    if (navigator.share) {
      navigator.share({
        title: 'WatchParty',
        text: `Присоединяйся к просмотру! Код комнаты: ${roomId}`,
        url: window.location.href,
      });
    }
  }, [roomId, hapticFeedback]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLeave}
            className="btn-icon w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="btn-icon w-10 h-10">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="btn-icon w-10 h-10">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
        {/* Room ID card */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">ID комнаты</p>
                <p className="font-mono font-semibold text-foreground">{roomId}</p>
              </div>
            </div>
            <button
              onClick={handleCopyRoomId}
              className="btn-icon w-10 h-10"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </GlassCard>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse-soft'}`} />
          <span className="text-muted-foreground">
            {isConnected ? 'Подключено' : 'Подключение...'}
          </span>
        </div>

        {/* Video section */}
        {videoUrl ? (
          <VideoPlayer
            videoUrl={videoUrl}
            isHost={isHost}
            onPlayPause={(playing, time) => {
              sendMessage({
                type: 'playback',
                payload: { playing, time },
              });
            }}
            onSeek={(time) => {
              sendMessage({
                type: 'seek',
                payload: { time },
              });
            }}
          />
        ) : (
          <VideoUrlInput
            onSubmit={handleVideoUrlSubmit}
            error={urlError}
          />
        )}

        {/* Participants */}
        <div className="grid grid-cols-1 gap-4">
          {showParticipants && (
            <ParticipantsList
              participants={participants}
              onClose={() => setShowParticipants(false)}
            />
          )}

          {!showParticipants && (
            <button
              onClick={() => setShowParticipants(true)}
              className="glass-card rounded-2xl p-4 flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">
                Участники ({participants.length})
              </span>
            </button>
          )}
        </div>

        {/* Chat */}
        <Chat
          messages={messages}
          onSendMessage={handleSendChatMessage}
          currentUserId={user?.id || 0}
        />
      </div>
    </div>
  );
};
