import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export function useBackgroundMusic({
  src,
  volume = 0.3,
  loop = true,
  autoplay = true
}: BackgroundMusicOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const play = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play background music:', err);
        setError('Failed to play music');
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current && isFinite(newVolume)) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.3;
    audio.preload = 'auto';

    audioRef.current = audio;

    const handleLoadedData = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setError('Failed to load music file');
      setIsLoaded(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    // Add event listeners
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Wait for user interaction before attempting autoplay
    const handleUserInteraction = () => {
      if (autoplay && audio === audioRef.current && !audio.paused === false) {
        audio.play().catch(() => {
          console.log('Autoplay still prevented, waiting for explicit user action');
        });
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add user interaction listeners  
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Cleanup function
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      
      // Remove user interaction listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      
      audio.pause();
      audio.src = '';
    };
  }, [src, loop, volume, autoplay]);

  // Auto-play when loaded (if autoplay is enabled) - but respect browser policies
  useEffect(() => {
    if (isLoaded && autoplay && !isPlaying && !error) {
      // Try to play, but don't throw error if it fails due to autoplay policy
      play().catch(() => {
        console.log('Autoplay prevented by browser policy, waiting for user interaction');
      });
    }
  }, [isLoaded, autoplay, isPlaying, error]);

  return {
    isPlaying,
    isLoaded,
    error,
    play,
    pause,
    stop,
    setVolume
  };
}