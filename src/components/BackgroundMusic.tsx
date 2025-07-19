'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface BackgroundMusicProps {
  src: string;
  restartKey?: string; // Optional key to force restart when changed
}

export function BackgroundMusic({ src, restartKey }: BackgroundMusicProps) {
  const { ui } = useSettingsStore();
  const lastRestartKeyRef = useRef<string>('');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  const {
    isPlaying,
    isLoaded,
    error,
    play,
    pause,
    stop,
    setVolume
  } = useBackgroundMusic({
    src,
    volume: isFinite(ui.musicVolume) ? ui.musicVolume : 0.3,
    loop: true,
    autoplay: false // Disable autoplay to prevent browser policy errors
  });

  // Restart music when restartKey changes
  useEffect(() => {
    if (restartKey && restartKey !== lastRestartKeyRef.current && isLoaded && !error && ui.musicEnabled) {
      stop(); // Stop current playback
      setTimeout(() => {
        play().catch(() => {
          console.log('Restart music prevented by browser autoplay policy');
        }); // Restart from beginning
      }, 100);
      lastRestartKeyRef.current = restartKey;
    }
  }, [restartKey, isLoaded, error, ui.musicEnabled, stop, play]);

  // Update volume when settings change
  useEffect(() => {
    if (isFinite(ui.musicVolume)) {
      setVolume(ui.musicVolume);
    }
  }, [ui.musicVolume, setVolume]);

  // Listen for user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    if (!userHasInteracted) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [userHasInteracted]);

  // Handle play/pause when music enabled setting changes
  useEffect(() => {
    if (isLoaded && !error && userHasInteracted) {
      if (ui.musicEnabled && !isPlaying) {
        play().catch(() => {
          console.log('Auto-play prevented by browser autoplay policy');
        });
      } else if (!ui.musicEnabled && isPlaying) {
        pause();
      }
    }
  }, [ui.musicEnabled, isLoaded, error, isPlaying, play, pause, userHasInteracted]);

  // Show a small music indicator when playing, or a muted indicator when loaded but not playing
  if (!error && isLoaded) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div 
          className="glass border-primary/30 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => {
            if (isPlaying) {
              pause();
            } else {
              play().catch(() => {
                console.log('Manual play prevented by browser policy');
              });
            }
          }}
          title={isPlaying ? "Click to pause music" : "Click to start music"}
        >
          <span className={`text-xs ${isPlaying ? 'animate-pulse' : 'opacity-50'}`}>
            {isPlaying ? '🎵' : '🔇'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}