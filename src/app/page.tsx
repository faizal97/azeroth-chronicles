'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useGameStore } from '@/stores/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CharacterSheet } from '@/components/CharacterSheet';
import { ScenarioSelection, type Scenario } from '@/components/ScenarioSelection';
import { CharacterSelection } from '@/components/CharacterSelection';
import { EnhancedText, EnhancedDialogue, EnhancedNarrative } from '@/components/EnhancedText';
import { useTooltipOnHover } from '@/hooks/useTooltipOnHover';
import { SettingsModal } from '@/components/SettingsModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import { TokenUsageDisplay } from '@/components/TokenUsageDisplay';
import { BackgroundMusic } from '@/components/BackgroundMusic';

interface ActionForm {
  action: string;
}

export default function Home() {
  const { 
    currentEnvironment,
    currentResponse,
    actionChoices,
    storyRecap,
    isLoading, 
    isProcessing,
    scenarioSelected,
    characterSelected,
    selectedScenario,
    scenario,
    character,
    narrative,
    gameStarted,
    initializeWithScenario,
    selectCharacter,
    backToScenarioSelection,
    takeTurn,
    generateStoryRecap,
    resetGame
  } = useGameStore();

  // Music restart key - only changes when we want music to restart
  const [musicRestartKey, setMusicRestartKey] = useState("menu-music");

  // Enhancement preferences - always disabled to show plain text
  const enableEnhancement = false;
  
  // Initialize hover-based tooltip system
  useTooltipOnHover();

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map scenario titles to wallpaper paths
  const getScenarioWallpaper = (scenarioTitle: string) => {
    const wallpaperMap: Record<string, string> = {
      'The Third War': '/warcraft-3.jpg',
      'The Age of Heroes': '/world-of-warcraft-classic.jpg',
      'Through the Dark Portal': '/burning-crusade.jpg',
      'Wrath of the Lich King': '/wrath-of-the-lich-king.jpg',
      'The Cataclysm': '/cataclysm.jpg',
      'Mists of Pandaria': '/mist-of-pandaria.jpg',
      'Warlords of Draenor': '/warlords-of-draenor.jpg',
      'Legion': '/legion.jpg',
      'Battle for Azeroth': '/battle-for-azeroth.jpg',
      'Shadowlands': '/shadowlands.jpg',
      'Dragonflight': '/dragonflight.jpg',
      'The War Within': '/war-within.jpg',
    };
    return wallpaperMap[scenarioTitle] || '';
  };

  const [showStoryRecap, setShowStoryRecap] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<ActionForm>();
  const actionInputRef = useRef<HTMLInputElement>(null);
  
  // TTS state and controls
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const { isConfigured, ui, llm, setSelectedVoice } = useSettingsStore();
  
  // Onboarding state
  const { needsOnboarding, completeOnboarding } = useOnboarding();

  const handleScenarioSelect = (scenario: Scenario) => {
    // Clear any cached data before starting
    if (typeof window !== 'undefined') {
      // Clear browser cache for API responses
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    }
    // Clear voice selection cache
    setVoiceSelectionCache({});
    // Clear typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    setIsTyping(false);
    setDisplayedText('');
    // Keep menu music playing - don't change restart key yet
    initializeWithScenario(scenario);
  };

  const handleCharacterSelect = (character: {
    name: string;
    class: string;
    hp: number;
    abilities: string[];
    isCustom: boolean;
  }) => {
    // Clear voice selection cache when selecting character
    setVoiceSelectionCache({});
    // Clear typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    setIsTyping(false);
    setDisplayedText('');
    selectCharacter(character);
    // When game starts, change music restart key to scenario-specific
    setMusicRestartKey(selectedScenario?.title || "game-music");
  };

  const onSubmit = async (data: ActionForm) => {
    console.log('Form submitted:', data);
    if (data.action?.trim() && !isProcessing && !isLoading) {
      await takeTurn(data.action);
      reset();
    }
  };

  // LLM-powered voice selection cache
  const [voiceSelectionCache, setVoiceSelectionCache] = useState<Record<string, string>>({});

  // Get LLM recommendation for character voice
  const getLLMVoiceRecommendation = useCallback(async (speaker: string, availableVoiceNames: string[]) => {
    try {
      // Get LLM settings and prepare headers
      const llmSettings = useSettingsStore.getState().llm;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (llmSettings.provider && llmSettings.apiKey) {
        headers['x-llm-provider'] = llmSettings.provider;
        headers['x-llm-api-key'] = llmSettings.apiKey;
        if (llmSettings.model) {
          headers['x-llm-model'] = llmSettings.model;
        }
      }
      
      const response = await fetch('/api/voice-selection', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          character: speaker,
          availableVoices: availableVoiceNames,
          scenario: scenario || 'general'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.recommendedVoice;
      }
    } catch (error) {
      console.error('Failed to get LLM voice recommendation:', error);
    }
    
    return null;
  }, [scenario]);

  // Smart voice selection using LLM
  const getVoiceForContent = useCallback(async (text: string, responseType: string, speaker?: string) => {
    if (availableVoices.length === 0) return null;

    // For dialogue with a character, try to get LLM recommendation
    if (responseType === 'dialogue' && speaker) {
      // Check cache first
      if (voiceSelectionCache[speaker]) {
        const cachedVoice = availableVoices.find(v => v.name === voiceSelectionCache[speaker]);
        if (cachedVoice) return cachedVoice;
      }

      // Get LLM recommendation
      const voiceNames = availableVoices.map(v => `${v.name} (${v.lang})`);
      const recommendedVoiceName = await getLLMVoiceRecommendation(speaker, voiceNames);
      
      if (recommendedVoiceName) {
        // Extract voice name from the response (remove language part)
        const voiceName = recommendedVoiceName.split(' (')[0];
        const recommendedVoice = availableVoices.find(v => v.name.includes(voiceName));
        
        if (recommendedVoice) {
          // Cache the recommendation
          setVoiceSelectionCache(prev => ({
            ...prev,
            [speaker]: recommendedVoice.name
          }));
          return recommendedVoice;
        }
      }
    }

    // Fallback to rule-based selection
    if (responseType === 'dialogue') {
      // For dialogue, prefer more expressive voices
      return availableVoices.find(v => 
        v.name.includes('Samantha') || v.name.includes('Alex') || 
        v.name.includes('Victoria') || v.name.includes('Daniel') ||
        (v.lang.startsWith('en-') && (v.name.includes('Natural') || v.name.includes('Enhanced')))
      ) || availableVoices.find(v => v.lang.startsWith('en-')) || availableVoices[0];
    } else {
      // For narrative, prefer clear, storytelling voices
      return availableVoices.find(v => 
        v.name.includes('David') || v.name.includes('Samantha') || 
        v.name.includes('Daniel') || v.name.includes('Aaron') ||
        (v.lang.startsWith('en-') && v.name.includes('Natural'))
      ) || availableVoices.find(v => v.lang.startsWith('en-')) || availableVoices[0];
    }
  }, [availableVoices, voiceSelectionCache, getLLMVoiceRecommendation]);

  // TTS Functions
  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default narrative voice
      if (voices.length > 0 && !ui.selectedVoice) {
        const narrativeVoice = voices.find(voice => 
          voice.name.includes('David') || voice.name.includes('Samantha') ||
          (voice.lang.startsWith('en-') && voice.name.includes('Natural'))
        ) || voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
        setSelectedVoice(narrativeVoice.name);
      }
    }
  }, [ui.selectedVoice, setSelectedVoice]);

  const speakText = useCallback(async (text: string, responseType = 'narrative', speaker?: string) => {
    if (!ui.ttsEnabled || !text.trim()) return;

    // Stop any current speech
    stopSpeech();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get the best voice for this content (now async)
      const smartVoice = await getVoiceForContent(text, responseType, speaker);
      if (smartVoice) {
        utterance.voice = smartVoice;
      } else {
        // Fallback to selected voice
        const voice = availableVoices.find(v => v.name === ui.selectedVoice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Configure speech parameters based on content type and character
      utterance.rate = ui.speechRate;
      utterance.volume = 0.8;
      
      // Character-specific speech adjustments
      if (responseType === 'dialogue' && speaker) {
        // Adjust pitch and rate for specific characters
        switch (speaker) {
          case 'Arthas Menethil':
            utterance.pitch = 0.8; // Deeper, more menacing
            utterance.rate = ui.speechRate * 0.9; // Slightly slower, more authoritative
            break;
          case 'Jaina Proudmoore':
            utterance.pitch = 1.1; // Higher, more feminine
            utterance.rate = ui.speechRate * 1.0; // Normal pace, intelligent
            break;
          case 'Thrall':
            utterance.pitch = 0.9; // Lower, wise
            utterance.rate = ui.speechRate * 0.95; // Thoughtful pace
            break;
          case 'Sylvanas Windrunner':
            utterance.pitch = 1.0; // Cold, calculating
            utterance.rate = ui.speechRate * 0.85; // Deliberate, menacing
            break;
          case 'Illidan Stormrage':
            utterance.pitch = 0.7; // Very deep, demonic
            utterance.rate = ui.speechRate * 0.8; // Slow, powerful
            break;
          case 'Garrosh Hellscream':
            utterance.pitch = 0.8; // Aggressive, commanding
            utterance.rate = ui.speechRate * 1.1; // Faster, more intense
            break;
          default:
            utterance.pitch = responseType === 'dialogue' ? 1.05 : 1.0;
            break;
        }
      } else {
        // Default for narrative
        utterance.pitch = 1.0; // Neutral storytelling voice
      }
      
      // Event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [ui.ttsEnabled, ui.selectedVoice, ui.speechRate, availableVoices, getVoiceForContent]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleNewGame = useCallback(() => {
    // Clear voice selection cache before resetting game
    setVoiceSelectionCache({});
    // Stop any current speech
    stopSpeech();
    // Clear typewriter effect
    setDisplayedText('');
    setIsTyping(false);
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    // Reset music to menu music
    setMusicRestartKey("menu-music");
    // Reset the game
    resetGame();
  }, [resetGame, stopSpeech, setMusicRestartKey]);

  // Typewriter effect function
  const startTypewriter = useCallback((text: string, responseType: string = 'narrative') => {
    // Clear any existing typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    
    // If typewriter is disabled, show text immediately
    if (!ui.typewriterEnabled) {
      setDisplayedText(text);
      setIsTyping(false);
      
      // Start TTS immediately when text is shown
      if (ui.ttsEnabled && currentResponse) {
        speakText(text, currentResponse.type, currentResponse.speaker);
      }
      return;
    }
    
    setIsTyping(true);
    setDisplayedText('');
    
    // Start TTS immediately when typing begins
    if (ui.ttsEnabled && currentResponse) {
      speakText(text, currentResponse.type, currentResponse.speaker);
    }
    
    let currentIndex = 0;
    
    // Context-aware speed adjustment
    let speed = ui.typewriterSpeed;
    if (responseType === 'action') {
      speed = Math.max(5, ui.typewriterSpeed / 2); // Faster for actions
    } else if (responseType === 'dialogue') {
      speed = ui.typewriterSpeed + 10; // Slower for dialogue
    }
    
    const typeCharacter = () => {
      if (currentIndex < text.length) {
        const newText = text.substring(0, currentIndex + 1);
        setDisplayedText(newText);
        currentIndex++;
        typewriterTimeoutRef.current = setTimeout(typeCharacter, speed);
      } else {
        setIsTyping(false);
      }
    };
    
    // Start typing immediately
    typeCharacter();
  }, [ui.ttsEnabled, speakText, currentResponse, ui.typewriterEnabled, ui.typewriterSpeed]);

  // Function to skip typewriter effect
  const skipTypewriter = useCallback(() => {
    if (isTyping && currentResponse) {
      // Clear timeout and show full text immediately
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      setDisplayedText(currentResponse.content);
      setIsTyping(false);
    }
  }, [isTyping, currentResponse]);


  // Load available voices
  useEffect(() => {
    loadVoices();
    
    // Handle voice loading for different browsers
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  // Cleanup speech on page unload/refresh/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopSpeech();
    };

    const handleVisibilityChange = () => {
      // Stop speech when page becomes hidden (tab switch, minimize, etc.)
      if (document.hidden) {
        stopSpeech();
      }
    };

    const handlePageHide = () => {
      stopSpeech();
    };

    // Add event listeners for various page lifecycle events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup function to stop speech, clear typewriter, and remove listeners
    return () => {
      stopSpeech();
      // Clear typewriter effect
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      setIsTyping(false);
      setDisplayedText('');
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [stopSpeech]);

  // Auto-start typewriter effect for new responses
  useEffect(() => {
    if (currentResponse && !isProcessing && !isLoading) {
      // Small delay to ensure the response is fully rendered
      setTimeout(() => {
        startTypewriter(currentResponse.content, currentResponse.type);
      }, 500);
    }
  }, [currentResponse, isProcessing, isLoading, startTypewriter]);

  // Auto-focus the input after story is generated and typing is complete
  useEffect(() => {
    if (currentResponse && !isProcessing && !isLoading && !isTyping && actionInputRef.current) {
      // Focus the input after typing is complete
      setTimeout(() => {
        actionInputRef.current?.focus();
      }, 300);
    }
  }, [currentResponse, isProcessing, isLoading, isTyping]);

  // Show onboarding if needed - this takes priority over everything
  if (needsOnboarding) {
    return (
      <>
        {/* Background Music - always present */}
        <BackgroundMusic src="/main-menu.mp3" restartKey={musicRestartKey} />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white/50">
            <p>Preparing your adventure...</p>
          </div>
        </div>
        <OnboardingModal 
          isOpen={needsOnboarding} 
          onComplete={completeOnboarding} 
        />
      </>
    );
  }

  // Always show scenario selection first - this is the entry point
  if (!scenarioSelected || !selectedScenario) {
    return (
      <>
        {/* Background Music - always present */}
        <BackgroundMusic src="/main-menu.mp3" restartKey={musicRestartKey} />
        <ScenarioSelection onSelectScenario={handleScenarioSelect} />
      </>
    );
  }

  // Show character selection if scenario is selected but character is not
  if (scenarioSelected && !characterSelected && selectedScenario) {
    return (
      <>
        {/* Background Music - always present */}
        <BackgroundMusic src="/main-menu.mp3" restartKey={musicRestartKey} />
        <CharacterSelection 
          scenario={selectedScenario}
          onCharacterSelect={handleCharacterSelect}
          onBack={backToScenarioSelection}
        />
      </>
    );
  }

  // Only show main game if both scenario and character are selected
  if (!scenarioSelected || !characterSelected || !gameStarted) {
    return (
      <>
        {/* Background Music - always present */}
        <BackgroundMusic src="/main-menu.mp3" restartKey={musicRestartKey} />
        <ScenarioSelection onSelectScenario={handleScenarioSelect} />
      </>
    );
  }

  const scenarioWallpaper = getScenarioWallpaper(scenario);

  return (
    <div className="min-h-screen relative p-6 overflow-hidden">
      {/* Background Music */}
      <BackgroundMusic src="/main-menu.mp3" restartKey={musicRestartKey} />
      {/* Background Image */}
      {scenarioWallpaper && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 transition-opacity duration-1000 parallax-bg"
            style={{
              backgroundImage: `url(${scenarioWallpaper})`,
            }}
          />
          {/* Subtle enhancement overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 mix-blend-overlay" />
        </>
      )}
      
      {/* Animated Background Overlay */}
      <div className="absolute inset-0 animated-bg" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Floating decorative elements */}
        <div className="absolute top-10 right-20 w-40 h-40 bg-primary/3 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-chart-2/3 rounded-full blur-2xl floating" style={{animationDelay: '3s'}} />
        
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 flex justify-start gap-3">
              <Button
                onClick={() => setShowStoryRecap(true)}
                variant="outline"
                disabled={!storyRecap}
                className="glass border-chart-2/50 text-chart-2 hover:glass-strong hover:border-chart-2 hover:text-chart-2 glow-hover transition-all duration-300 px-6 py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📜 Chronicle
              </Button>
              
              <Link href="/donate">
                <Button
                  variant="outline"
                  className="glass border-yellow-500/50 text-yellow-500 hover:glass-strong hover:border-yellow-500 hover:text-yellow-500 glow-hover transition-all duration-300 px-6 py-2.5 font-semibold"
                  title="Support the project"
                >
                  ☕ Donate
                </Button>
              </Link>
              
              {/* Controls */}
              <div className="flex gap-2">
                {/* Settings Button */}
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className={`glass transition-all duration-300 px-4 py-2.5 font-semibold ${
                    isConfigured() 
                      ? 'border-primary/70 text-primary hover:border-primary hover:text-primary glow-hover' 
                      : 'border-yellow-500/70 text-yellow-500 hover:border-yellow-500 hover:text-yellow-500 glow-hover animate-pulse'
                  }`}
                  title={isConfigured() ? 'AI Settings' : 'Configure AI Provider (Required)'}
                >
                  ⚙️
                </Button>
                
                {isSpeaking && (
                  <Button
                    onClick={stopSpeech}
                    variant="outline"
                    className="glass border-destructive/50 text-destructive hover:border-destructive hover:text-destructive transition-all duration-300 px-4 py-2.5"
                    title="Stop speech"
                  >
                    ⏹️
                  </Button>
                )}
                
                {/* Skip typing button - only show when typing */}
                {isTyping && (
                  <Button
                    onClick={skipTypewriter}
                    variant="outline"
                    className="glass border-chart-4/50 text-chart-4 hover:border-chart-4 hover:text-chart-4 transition-all duration-300 px-4 py-2.5"
                    title="Skip typing animation"
                  >
                    ⏭️
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 slide-in">
              <h1 className="text-5xl font-bold text-gradient mb-3 tracking-tight">
                Azeroth Chronicles
              </h1>
              <p className="text-muted-foreground text-lg">A Text-Based Saga</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleNewGame}
                variant="outline"
                className="glass border-primary/50 text-primary hover:glass-strong hover:border-primary hover:text-primary glow-hover transition-all duration-300 px-6 py-2.5 font-semibold"
              >
                New Game
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Main Game Area */}
          <div className="lg:col-span-2 fade-in">
            <Card className="glass-strong border-primary/20 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-gradient flex items-center gap-3">
                  <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                  Adventure Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-[500px] w-full glass rounded-2xl p-6 border border-border/30">
                  <div className="space-y-4">
                    {/* Show only current response or processing state */}
                    {currentResponse && (
                      <div className="space-y-4">
                        {/* Current Response */}
                        {(() => {
                          switch (currentResponse.type) {
                            case 'action':
                              return (
                                <div className="text-primary font-semibold bg-primary/5 px-4 py-2 rounded-lg border-l-4 border-primary leading-relaxed transition-all duration-300 fade-in">
                                  <span className="text-primary/70 text-sm mr-2">›</span>
                                  <EnhancedText 
                                    text={displayedText}
                                    scenario={scenario}
                                    enableEnhancement={enableEnhancement}
                                  />
                                  {isTyping && <span className="animate-pulse">|</span>}
                                </div>
                              );
                            
                            case 'dialogue':
                              return (
                                <div 
                                  className="bg-chart-2/10 border-l-4 border-chart-2 px-4 py-3 rounded-lg leading-relaxed transition-all duration-300 fade-in cursor-pointer"
                                  onClick={skipTypewriter}
                                  title={isTyping ? "Click to skip typing animation" : ""}
                                >
                                  <EnhancedDialogue
                                    content={displayedText}
                                    speaker={currentResponse.speaker}
                                    speakerTitle={currentResponse.speakerTitle}
                                    scenario={scenario}
                                    enableEnhancement={enableEnhancement}
                                  />
                                  {isTyping && <span className="animate-pulse">|</span>}
                                </div>
                              );
                            
                            case 'system':
                              return (
                                <div className="text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg border border-border/30 leading-relaxed transition-all duration-300 fade-in">
                                  <span className="text-muted-foreground/60 text-sm mr-2">⚡</span>
                                  <EnhancedText 
                                    text={displayedText}
                                    scenario={scenario}
                                    enableEnhancement={enableEnhancement}
                                  />
                                  {isTyping && <span className="animate-pulse">|</span>}
                                </div>
                              );
                            
                            case 'narrative':
                            default:
                              return (
                                <div 
                                  className="text-card-foreground/90 leading-relaxed transition-all duration-300 px-4 py-4 fade-in cursor-pointer"
                                  onClick={skipTypewriter}
                                  title={isTyping ? "Click to skip typing animation" : ""}
                                >
                                  <EnhancedNarrative
                                    content={displayedText}
                                    scenario={scenario}
                                    enableEnhancement={enableEnhancement}
                                  />
                                  {isTyping && <span className="animate-pulse">|</span>}
                                </div>
                              );
                          }
                        })()}
                        
                        {/* Current Environment Display */}
                        {currentEnvironment && (
                          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2 fade-in">
                            <h4 className="font-semibold text-accent flex items-center gap-2">
                              <span className="w-2 h-2 bg-accent rounded-full"></span>
                              Current Scene
                            </h4>
                            <EnhancedText 
                              text={currentEnvironment.description}
                              scenario={scenario}
                              className="text-sm text-card-foreground/80 leading-relaxed"
                              enableEnhancement={enableEnhancement}
                            />
                            {currentEnvironment.atmosphere && (
                              <p className="text-xs text-muted-foreground italic">
                                Atmosphere: <EnhancedText 
                                  text={currentEnvironment.atmosphere}
                                  scenario={scenario}
                                  enableEnhancement={enableEnhancement}
                                />
                              </p>
                            )}
                            {currentEnvironment.sounds && (
                              <p className="text-xs text-muted-foreground">
                                🔊 <EnhancedText 
                                  text={currentEnvironment.sounds}
                                  scenario={scenario}
                                  enableEnhancement={enableEnhancement}
                                />
                              </p>
                            )}
                            {currentEnvironment.npcsPresent && currentEnvironment.npcsPresent.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs text-muted-foreground mr-1">NPCs:</span>
                                {currentEnvironment.npcsPresent.map((npc, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-chart-3/20 text-chart-3 px-2 py-0.5 rounded"
                                  >
                                    <EnhancedText 
                                      text={npc}
                                      scenario={scenario}
                                      enableEnhancement={enableEnhancement}
                                    />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Choices - Show when available and not processing */}
                    {actionChoices.length > 0 && !isProcessing && (
                      <div className="space-y-3 fade-in">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-2 h-2 bg-chart-4 rounded-full animate-pulse"></span>
                          <span className="font-medium">Suggested Actions:</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {actionChoices.map((choice, index) => (
                            <button
                              key={choice.id}
                              onClick={() => {
                                if (!isProcessing && !isLoading) {
                                  takeTurn(choice.text);
                                }
                              }}
                              disabled={isProcessing || isLoading}
                              className="glass border-chart-4/30 hover:border-chart-4/60 hover:bg-chart-4/10 text-left px-4 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-chart-4 font-bold text-sm mt-0.5 group-hover:scale-110 transition-transform">
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-card-foreground font-medium text-sm">
                                    <EnhancedText 
                                      text={choice.text}
                                      scenario={scenario}
                                      enableEnhancement={enableEnhancement}
                                    />
                                  </div>
                                  {choice.description && (
                                    <div className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                      <EnhancedText 
                                        text={choice.description}
                                        scenario={scenario}
                                        enableEnhancement={enableEnhancement}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="text-center text-muted-foreground text-xs">
                          <span className="px-2 py-1 bg-muted/20 rounded">
                            Or type your own action below
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Processing State */}
                    {isProcessing && (
                      <div className="text-muted-foreground italic flex items-center gap-3 bg-muted/20 px-4 py-3 rounded-lg fade-in">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                        <span className="ml-2">The Dungeon Master is contemplating your action...</span>
                      </div>
                    )}
                    
                    {/* Empty state message */}
                    {!currentResponse && !isProcessing && (
                      <div className="text-center text-muted-foreground/70 py-12">
                        <p className="text-lg">Your story awaits...</p>
                        <p className="text-sm mt-2">Enter an action below to continue your adventure</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Token Usage Display */}
                {character && scenario && (
                  <div className="flex justify-end">
                    <TokenUsageDisplay
                      estimationParams={{
                        contextDetail: llm.contextDetail,
                        historyLength: llm.historyLength,
                        maxTokens: llm.maxTokens,
                        gameContext: {
                          scenario: selectedScenario?.title || scenario,
                          character: character,
                          narrative_history: narrative.map(entry => entry.content)
                        },
                        playerAction: watch('action') || ''
                      }}
                      className="text-slate-400"
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      {...register('action', { required: true })}
                      ref={(e) => {
                        register('action').ref(e);
                        actionInputRef.current = e;
                      }}
                      placeholder="What do you do?"
                      disabled={isLoading || isProcessing}
                      type="text"
                      className="glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-card-foreground placeholder-muted-foreground text-lg py-6 px-4 rounded-xl transition-all duration-300"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || isProcessing}
                      className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-primary-foreground px-8 py-6 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 glow-hover disabled:opacity-50"
                    >
                      {isLoading || isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                          Acting...
                        </div>
                      ) : 'Act'}
                    </Button>
                  </div>
                  <div className="glass rounded-lg p-3 border border-border/30 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      💡 Enter your action in natural language (e.g., &quot;look around&quot;, &quot;talk to the guard&quot;, &quot;head north&quot;)
                    </p>
                    
                    {/* Disclaimer Link */}
                    <div className="text-center pt-2 border-t border-border/20">
                      <Link href="/disclaimer">
                        <span className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors underline cursor-pointer">
                          Legal Disclaimer
                        </span>
                      </Link>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Character Sheet */}
          <div className="lg:col-span-1">
            <CharacterSheet />
          </div>
        </div>
      </div>
      
      {/* Story Recap Modal */}
      {showStoryRecap && storyRecap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-4xl max-h-[80vh] glass-strong border-chart-2/50 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-gradient flex items-center gap-3">
                  <span className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></span>
                  Chronicle of Deeds
                </CardTitle>
                <Button
                  onClick={() => setShowStoryRecap(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <p className="text-white/70 text-sm">
                Last updated: {new Date(storyRecap.lastUpdated).toLocaleString()} • 
                Turn {storyRecap.turnCount}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[50vh] w-full glass rounded-xl p-6 border border-border/30">
                <div className="text-card-foreground/90 leading-relaxed">
                  <EnhancedNarrative
                    content={storyRecap.content}
                    scenario={scenario}
                    className="text-justify"
                    enableEnhancement={enableEnhancement}
                  />
                </div>
              </ScrollArea>
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={generateStoryRecap}
                  disabled={isLoading}
                  variant="outline"
                  className="glass border-chart-2/50 text-chart-2 hover:glass-strong hover:border-chart-2 hover:text-chart-2 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-chart-2/30 border-t-chart-2 rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    '🔄 Update Recap'
                  )}
                </Button>
                <Button
                  onClick={() => setShowStoryRecap(false)}
                  className="bg-gradient-to-r from-chart-2 to-chart-4 hover:from-chart-2/90 hover:to-chart-4/90 text-white px-6 py-2 font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Continue Adventure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Onboarding Modal - can appear if settings are cleared during gameplay */}
      <OnboardingModal 
        isOpen={needsOnboarding} 
        onComplete={completeOnboarding} 
      />
    </div>
  );
}