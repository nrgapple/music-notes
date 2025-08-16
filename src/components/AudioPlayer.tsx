import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { PlaybackState, AudioFile } from '@/types';
import { formatTime } from '@/utils/audio';
import { cn } from '@/utils/cn';

interface AudioPlayerProps {
  playbackState: PlaybackState;
  onTogglePlayback: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  audioFile: AudioFile;
}

export function AudioPlayer({
  playbackState,
  onTogglePlayback,
  onSeek,
  onVolumeChange,
  audioFile
}: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, volume } = playbackState;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onVolumeChange(percentage);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="px-6 py-4">
        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-muted rounded-full cursor-pointer mb-4 group"
          onClick={handleProgressClick}
        >
          <div className="relative h-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Left side - Play controls and time */}
          <div className="flex items-center gap-4">
            <button
              onClick={onTogglePlayback}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus-ring",
                "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <div className="text-sm text-muted-foreground font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Center - Track info */}
          <div className="text-center">
            <div className="text-sm font-medium">{audioFile.name}</div>
          </div>

          {/* Right side - Volume control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-ring"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div
              className="w-20 h-2 bg-muted rounded-full cursor-pointer group"
              onClick={handleVolumeClick}
            >
              <div className="relative h-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-150"
                  style={{ width: `${volume * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${volume * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
