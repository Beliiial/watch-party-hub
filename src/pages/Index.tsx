import { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { RoomScreen } from '@/components/RoomScreen';
import { Modal } from '@/components/Modal';
import { useTelegram } from '@/hooks/useTelegram';
import { AlertCircle } from 'lucide-react';

type Screen = 'home' | 'room';

const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  const { colorScheme, ready, expand } = useTelegram();

  // Initialize Telegram WebApp
  useEffect(() => {
    ready();
    expand();
    
    // Apply theme
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorScheme, ready, expand]);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setCurrentScreen('room');
  }, []);

  const handleJoinRoom = useCallback((id: string) => {
    if (!id || id.length < 4) {
      setErrorModal('Неверный ID комнаты. Пожалуйста, введите корректный код.');
      return;
    }
    
    setRoomId(id.toUpperCase());
    setIsHost(false);
    setCurrentScreen('room');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setCurrentScreen('home');
    setRoomId('');
    setIsHost(false);
  }, []);

  return (
    <div 
      className="h-full w-full overflow-hidden bg-background"
      style={{ 
        height: '100dvh',
        maxHeight: '-webkit-fill-available'
      }}
    >
      {currentScreen === 'home' && (
        <HomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {currentScreen === 'room' && (
        <RoomScreen
          roomId={roomId}
          isHost={isHost}
          onLeave={handleLeaveRoom}
        />
      )}

      {/* Error Modal */}
      <Modal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="Ошибка"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
          <p className="text-foreground">{errorModal}</p>
        </div>
        <button
          onClick={() => setErrorModal(null)}
          className="btn-primary w-full"
        >
          Понятно
        </button>
      </Modal>
    </div>
  );
};

export default Index;
