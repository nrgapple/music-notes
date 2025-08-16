import { useState, useRef, useCallback, useEffect } from 'react';
import type { PlaybackState } from '@/types';

export function useAudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const updateCurrentTime = useCallback(() => {
    if (audioRef.current) {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  }, []);

  const loadAudio = useCallback(async (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        audioRef.current = audio;
        setPlaybackState(prev => ({
          ...prev,
          duration: audio.duration,
          currentTime: 0,
        }));
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        reject(new Error('Failed to load audio'));
      });

      audio.addEventListener('timeupdate', updateCurrentTime);
      
      audio.addEventListener('ended', () => {
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
        }));
      });
    });
  }, [updateCurrentTime]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setPlaybackState(prev => ({ ...prev, volume }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateCurrentTime);
      }
    };
  }, [updateCurrentTime]);

  return {
    playbackState,
    audioElement: audioRef.current,
    play,
    pause,
    seek,
    setVolume,
    loadAudio,
  };
}
