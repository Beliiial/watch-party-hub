import { GlassCard } from './GlassCard';
import { X, Crown, Wifi, WifiOff } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  isHost: boolean;
  isConnected: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  onClose: () => void;
}

export const ParticipantsList = ({ participants, onClose }: ParticipantsListProps) => {
  return (
    <GlassCard className="relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        Участники
        <span className="text-sm font-normal text-muted-foreground">
          ({participants.length})
        </span>
      </h3>
      
      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {participant.isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>Подключён</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-destructive" />
                    <span>Отключён</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
