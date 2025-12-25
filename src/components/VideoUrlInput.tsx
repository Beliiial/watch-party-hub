import { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Link, Youtube, Tv, Film, AlertCircle, Check } from 'lucide-react';

interface VideoUrlInputProps {
  onSubmit: (url: string) => void;
  error?: string | null;
}

type VideoType = 'youtube' | 'twitch' | 'mp4' | null;

const validateUrl = (url: string): VideoType => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.match(/\.(mp4|webm|m3u8)(\?|$)/i)) return 'mp4';
  return null;
};

export const VideoUrlInput = ({ onSubmit, error }: VideoUrlInputProps) => {
  const [url, setUrl] = useState('');
  const [detectedType, setDetectedType] = useState<VideoType>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setDetectedType(validateUrl(value));
  };

  const handleSubmit = () => {
    if (detectedType) {
      onSubmit(url);
    }
  };

  const platforms = [
    { type: 'youtube' as const, label: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { type: 'twitch' as const, label: 'Twitch', icon: Tv, color: 'text-purple-500' },
    { type: 'mp4' as const, label: 'MP4', icon: Film, color: 'text-foreground' },
  ];

  return (
    <GlassCard>
      <h3 className="font-semibold text-foreground mb-2">Неверный URL</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Вставьте ссылку на видео
      </p>

      {/* Input */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Link className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="glass-input pl-10 pr-10"
        />
        {detectedType && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Platform badges */}
      <div className="flex gap-2 mb-4">
        {platforms.map(({ type, label, icon: Icon, color }) => (
          <div
            key={type}
            className={`platform-badge ${detectedType === type ? 'ring-2 ring-primary' : ''}`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!detectedType}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Загрузить видео
      </button>
    </GlassCard>
  );
};
