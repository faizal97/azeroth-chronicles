'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const { isConfigured } = useSettingsStore();

  useEffect(() => {
    // Check if user needs onboarding on mount
    const checkOnboardingStatus = () => {
      const configured = isConfigured();
      
      // User needs onboarding if:
      // 1. LLM is not configured (no API key)
      // 2. Onboarding hasn't been completed this session
      if (!configured && !onboardingComplete) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    };

    // Check immediately
    checkOnboardingStatus();

    // Also check when settings change
    const unsubscribe = useSettingsStore.subscribe(
      () => {
        checkOnboardingStatus();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isConfigured, onboardingComplete]);

  const completeOnboarding = () => {
    setOnboardingComplete(true);
    setNeedsOnboarding(false);
  };

  const resetOnboarding = () => {
    setOnboardingComplete(false);
    setNeedsOnboarding(true);
  };

  return {
    needsOnboarding,
    completeOnboarding,
    resetOnboarding,
    isConfigured: isConfigured(),
  };
}