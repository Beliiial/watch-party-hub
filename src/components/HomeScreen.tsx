import { useState } from 'react';
import { GlassCard } from './GlassCard';
import { useTelegram } from '@/hooks/useTelegram';
import { Play, Users, ArrowRight, Film, MessageCircle, Link2 } from 'lucide-react';

interface HomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export const HomeScreen = ({ onCreateRoom, onJoinRoom }: HomeScreenProps) => {
  const [roomId, setRoomId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const { hapticFeedback, user } = useTelegram();

  const handleCreateRoom = () => {
    hapticFeedback('medium');
    onCreateRoom();
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      hapticFeedback('medium');
      onJoinRoom(roomId.trim());
    }
  };

  const handleShowJoinInput = () => {
    hapticFeedback('light');
    setShowJoinInput(true);
  };

  return (
    <div className="flex flex-col h-full px-4 py-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Play className="w-7 h-7 text-primary-foreground fill-current" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">WatchParty</h1>
        <p className="text-muted-foreground mt-1">
          Смотрите видео вместе с друзьями
        </p>
      </div>

      {/* Welcome message */}
      {user && (
        <GlassCard className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {user.firstName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Добро пожаловать</p>
              <p className="font-semibold text-foreground">{user.firstName}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Main actions */}
      <GlassCard className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-4 text-center">
          Начать просмотр
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreateRoom}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Создать комнату
          </button>
          <button
            onClick={handleShowJoinInput}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Присоединиться
          </button>
        </div>
      </GlassCard>

      {/* Join room input */}
      {showJoinInput && (
        <GlassCard className="mb-4 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-3">
            Введите ID комнаты
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Например: ABC123"
              className="glass-input flex-1 font-mono tracking-widest"
              autoFocus
              maxLength={8}
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Features */}
      <GlassCard className="mt-auto">
        <h3 className="font-semibold text-foreground mb-4">Возможности</h3>
        <div className="space-y-3">
          <FeatureItem 
            icon={<Film className="w-5 h-5 text-primary" />}
            title="Синхронный просмотр" 
            description="Все видят одно и то же в одно время"
          />
          <FeatureItem 
            icon={<MessageCircle className="w-5 h-5 text-primary" />}
            title="Живой чат" 
            description="Обсуждайте видео в реальном времени"
          />
          <FeatureItem 
            icon={<Link2 className="w-5 h-5 text-primary" />}
            title="YouTube, Twitch, MP4" 
            description="Поддержка популярных платформ"
          />
        </div>
      </GlassCard>
    </div>
  );
};

const FeatureItem = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);
