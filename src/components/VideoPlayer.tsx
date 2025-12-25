import { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize,
  ExternalLink
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  isHost: boolean;
  onPlayPause?: (isPlaying: boolean, currentTime: number) => void;
  onSeek?: (time: number) => void;
  syncState?: {
    isPlaying: boolean;
    currentTime: number;
  };
}

type VideoType = 'youtube' | 'twitch' | 'mp4' | 'unknown';

const getVideoType = (url: string): VideoType => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.match(/\.(mp4|webm|m3u8)(\?|$)/i)) return 'mp4';
  return 'unknown';
};

const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
};

const getTwitchChannel = (url: string): string | null => {
  const match = url.match(/twitch\.tv\/(\w+)/);
  return match ? match[1] : null;
};

export const VideoPlayer = ({ 
  videoUrl, 
  isHost, 
  onPlayPause, 
  onSeek,
  syncState 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeControl, setActiveControl] = useState<'play' | 'pause' | 'forward'>('pause');
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoType = getVideoType(videoUrl);

  // Sync with external state
  useEffect(() => {
    if (syncState && videoRef.current && !isHost) {
      if (syncState.isPlaying !== isPlaying) {
        setIsPlaying(syncState.isPlaying);
        if (syncState.isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
      if (Math.abs(syncState.currentTime - currentTime) > 2) {
        videoRef.current.currentTime = syncState.currentTime;
      }
    }
  }, [syncState, isHost, isPlaying, currentTime]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setActiveControl('pause');
      } else {
        videoRef.current.play();
        setActiveControl('play');
      }
      setIsPlaying(!isPlaying);
      onPlayPause?.(!isPlaying, videoRef.current.currentTime);
    }
  }, [isPlaying, onPlayPause]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      onSeek?.(time);
    }
  }, [onSeek]);

  const handleForward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setActiveControl('forward');
      onSeek?.(newTime);
      setTimeout(() => setActiveControl(isPlaying ? 'play' : 'pause'), 200);
    }
  }, [duration, isPlaying, onSeek]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderVideo = () => {
    switch (videoType) {
      case 'youtube': {
        const videoId = getYouTubeId(videoUrl);
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0`}
            className="w-full aspect-video rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      case 'twitch': {
        const channel = getTwitchChannel(videoUrl);
        return (
          <iframe
            src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`}
            className="w-full aspect-video rounded-xl"
            allowFullScreen
          />
        );
      }
      case 'mp4':
        return (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video rounded-xl bg-foreground/5"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
          />
        );
      default:
        return (
          <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center">
            <div className="text-center p-4">
              <ExternalLink className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Неподдерживаемый формат
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <GlassCard variant="dark" className="p-3">
      {/* Video container */}
      <div className="relative mb-4">
        {renderVideo()}
        
        {/* Play button overlay for MP4 */}
        {videoType === 'mp4' && !isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
              <Play className="w-8 h-8 text-foreground fill-current ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      {videoType === 'mp4' && (
        <>
          {/* Small control buttons */}
          <div className="flex justify-center gap-6 mb-4">
            <button
              onClick={() => handlePlayPause()}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={handleForward}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="relative h-1 bg-muted rounded-full">
              <div 
                className="absolute h-full bg-foreground rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute w-4 h-4 bg-foreground rounded-full -top-1.5 shadow-lg transition-all"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setActiveControl('play');
                if (!isPlaying && videoRef.current) {
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              disabled={!isHost}
              className={`control-btn ${activeControl === 'play' ? 'control-btn-active' : 'control-btn-inactive'} ${!isHost && 'opacity-50'}`}
            >
              Воспроизвести
            </button>
            <button
              onClick={() => {
                setActiveControl('pause');
                if (isPlaying && videoRef.current) {
                  videoRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              disabled={!isHost}
              className={`control-btn ${activeControl === 'pause' ? 'control-btn-active' : 'control-btn-inactive'} ${!isHost && 'opacity-50'}`}
            >
              Пауза
            </button>
            <button
              onClick={handleForward}
              disabled={!isHost}
              className={`control-btn ${activeControl === 'forward' ? 'control-btn-active' : 'control-btn-inactive'} ${!isHost && 'opacity-50'}`}
            >
              Перемотка
            </button>
          </div>

          {/* Additional controls */}
          <div className="flex justify-between mt-4">
            <button onClick={toggleMute} className="btn-icon w-10 h-10">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <button className="btn-icon w-10 h-10">
              <Maximize className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </>
      )}

      {!isHost && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Управление доступно только хосту комнаты
        </p>
      )}
    </GlassCard>
  );
};
