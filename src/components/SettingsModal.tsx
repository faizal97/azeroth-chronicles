'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { LLMProviderFactory } from '@/lib/llm-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyManual } from './ApiKeyManual';
import { TokenUsageDisplay } from './TokenUsageDisplay';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    llm,
    ui,
    setLLMProvider,
    setLLMModel,
    setLLMApiKey,
    setLLMTemperature,
    setLLMMaxTokens,
    setLLMHistoryLength,
    setLLMContextDetail,
    setTTSEnabled,
    setSpeechRate,
    setSelectedVoice,
    setTypewriterEnabled,
    setTypewriterSpeed,
    setMusicEnabled,
    setMusicVolume,
    validateApiKey,
    getCurrentProviderInfo,
    isConfigured
  } = useSettingsStore();

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState('ai');
  const [hasValidatedCurrentSettings, setHasValidatedCurrentSettings] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({ provider: llm.provider, apiKey: llm.apiKey });
  const [showApiManual, setShowApiManual] = useState(false);

  const allProviders = LLMProviderFactory.getAllProviders();
  const currentProviderInfo = getCurrentProviderInfo();

  const handleProviderChange = (providerId: string) => {
    if (LLMProviderFactory.isValidProviderType(providerId)) {
      setLLMProvider(providerId);
      setConnectionStatus('idle');
      setHasValidatedCurrentSettings(false);
    }
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setLLMApiKey(newApiKey);
    setConnectionStatus('idle');
    setHasValidatedCurrentSettings(false);
  };

  const handleTestConnection = async () => {
    if (!llm.apiKey.trim()) {
      setConnectionStatus('error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const isValid = await validateApiKey(llm.provider, llm.apiKey);
      setConnectionStatus(isValid ? 'success' : 'error');
      if (isValid) {
        setHasValidatedCurrentSettings(true);
        setOriginalSettings({ provider: llm.provider, apiKey: llm.apiKey });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  // Voice loading functionality
  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (voices.length > 0 && !ui.selectedVoice) {
        const defaultVoice = voices.find(voice => 
          voice.name.includes('David') || voice.name.includes('Samantha') ||
          (voice.lang.startsWith('en-') && voice.name.includes('Natural'))
        ) || voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
        setSelectedVoice(defaultVoice.name);
      }
    }
  }, [ui.selectedVoice, setSelectedVoice]);

  // Check if current settings have been validated
  const hasSettingsChanged = () => {
    return originalSettings.provider !== llm.provider || originalSettings.apiKey !== llm.apiKey;
  };

  const canSaveSettings = () => {
    if (!hasSettingsChanged()) return true; // No changes, can save
    return hasValidatedCurrentSettings && connectionStatus === 'success';
  };

  useEffect(() => {
    // Initialize with current settings if they're already configured
    if (isConfigured()) {
      setOriginalSettings({ provider: llm.provider, apiKey: llm.apiKey });
      setHasValidatedCurrentSettings(true);
      setConnectionStatus('success');
    }
  }, []);

  useEffect(() => {
    loadVoices();
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong border-primary/50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              Game Settings
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
            >
              ✕
            </Button>
          </div>
          <p className="text-slate-300">Configure your game settings and preferences</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="ai" className="data-[state=active]:bg-primary/20">
                🤖 AI Settings
              </TabsTrigger>
              <TabsTrigger value="ui" className="data-[state=active]:bg-primary/20">
                🎮 Game Experience
              </TabsTrigger>
            </TabsList>

            {/* AI Settings Tab */}
            <TabsContent value="ai" className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-white font-semibold">
              LLM Provider
            </Label>
            <Select value={llm.provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {allProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {currentProviderInfo && (
            <div className="space-y-2">
              <Label htmlFor="model" className="text-white font-semibold">
                Model
              </Label>
              <div className="text-xs text-slate-400 mb-2">
                💰 = Low cost • 💰💰 = Medium cost • 💰💰💰 = High cost
              </div>
              <Select value={llm.model} onValueChange={setLLMModel}>
                <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white px-4 pt-7 pb-6">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="min-w-[400px] max-h-[300px] p-4">
                  {currentProviderInfo.models.map((model) => {
                    const modelInfo = currentProviderInfo.modelInfo?.[model];
                    const costIcon = modelInfo?.cost === 'low' ? '💰' : modelInfo?.cost === 'medium' ? '💰💰' : '💰💰💰';
                    const displayName = modelInfo?.name || model;
                    const isDefault = model === currentProviderInfo.defaultModel;
                    
                    return (
                      <SelectItem key={model} value={model} className="py-4 px-4 cursor-pointer hover:bg-accent">
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm">{displayName}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm">{costIcon}</span>
                              {isDefault && (
                                <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-md font-medium">Default</span>
                              )}
                            </div>
                          </div>
                          {modelInfo?.description && (
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {modelInfo.description}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-white font-semibold">
              API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={apiKeyVisible ? 'text' : 'password'}
                  value={llm.apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder={`Enter your ${currentProviderInfo?.name || 'API'} key`}
                  className="glass border-border/50 focus:border-primary/50 text-white placeholder-slate-400 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                >
                  {apiKeyVisible ? '🙈' : '👁️'}
                </Button>
              </div>
              <Button
                onClick={handleTestConnection}
                disabled={testingConnection || !llm.apiKey.trim()}
                variant={connectionStatus === 'success' ? 'default' : 'outline'}
                className={`min-w-20 ${
                  connectionStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : connectionStatus === 'error'
                    ? 'border-red-500 text-red-500 hover:bg-red-500/10'
                    : 'glass border-primary/50 text-primary hover:bg-primary/10'
                }`}
              >
                {testingConnection ? '⏳' : connectionStatus === 'success' ? '✅' : connectionStatus === 'error' ? '❌' : 'Test'}
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Stored locally and never sent to our servers
            </p>
            {hasSettingsChanged() && (
              <p className="text-xs text-yellow-400 flex items-center gap-1">
                ⚠️ Settings changed - please test connection before saving
              </p>
            )}
            
            {/* API Key Help */}
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-300 text-sm">Need help getting your API key?</h4>
                <Button
                  onClick={() => setShowApiManual(true)}
                  variant="outline"
                  size="sm"
                  className="glass border-primary/50 text-primary hover:bg-primary/10"
                >
                  📚 Full Guide
                </Button>
              </div>
              <div className="text-xs text-slate-400">
                {llm.provider === 'gemini' ? (
                  <p>Quick link: <Button 
                    onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                  >
                    aistudio.google.com/app/apikey
                  </Button></p>
                ) : (
                  <p>Quick link: <Button 
                    onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                  >
                    platform.openai.com/api-keys
                  </Button></p>
                )}
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-white font-semibold">
              Creativity ({llm.temperature})
            </Label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={llm.temperature}
              onChange={(e) => setLLMTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Focused</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-white font-semibold">
              Response Length ({llm.maxTokens} tokens)
            </Label>
            <input
              id="maxTokens"
              type="range"
              min="256"
              max="2048"
              step="64"
              value={llm.maxTokens}
              onChange={(e) => setLLMMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Shorter (Cheaper)</span>
              <span>Longer (More Expensive)</span>
            </div>
            <p className="text-xs text-slate-400">
              Controls response length and cost. Lower values = cheaper, shorter responses. Higher values = more expensive, detailed responses.
            </p>
          </div>

          {/* History Length */}
          <div className="space-y-2">
            <Label htmlFor="historyLength" className="text-white font-semibold">
              Context History ({llm.historyLength} interactions)
            </Label>
            <input
              id="historyLength"
              type="range"
              min="2"
              max="10"
              step="1"
              value={llm.historyLength}
              onChange={(e) => setLLMHistoryLength(parseInt(e.target.value))}
              className="w-full h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Less Context (Cheaper)</span>
              <span>More Context (Better Story)</span>
            </div>
            <p className="text-xs text-slate-400">
              Controls how much game history is sent to the AI. Less history = lower input costs but AI may forget recent events. More history = better story continuity but higher costs.
            </p>
          </div>

          {/* Context Detail */}
          <div className="space-y-2">
            <Label htmlFor="contextDetail" className="text-white font-semibold">
              Context Detail Level
            </Label>
            <Select value={llm.contextDetail} onValueChange={setLLMContextDetail}>
              <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white px-4 py-3">
                <SelectValue placeholder="Select context detail" />
              </SelectTrigger>
              <SelectContent className="p-2">
                <SelectItem value="minimal" className="py-2">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">💰 Minimal</span>
                      <span className="text-xs text-green-400">~600 tokens</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Basic info only - cheapest option</span>
                  </div>
                </SelectItem>
                <SelectItem value="standard" className="py-2">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">⚖️ Standard</span>
                      <span className="text-xs text-blue-400">~1000 tokens</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Balanced detail - recommended</span>
                  </div>
                </SelectItem>
                <SelectItem value="rich" className="py-2">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">✨ Rich</span>
                      <span className="text-xs text-purple-400">~1400 tokens</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Detailed descriptions - premium experience</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Controls how detailed the context and prompts are. Minimal = cheaper but less immersive. Rich = more expensive but better storytelling.
            </p>
          </div>

          {/* Token Usage Preview */}
          <div className="bg-black/20 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-white border-b border-border/30 pb-2">
              💰 Cost Preview
            </h4>
            <TokenUsageDisplay
              estimationParams={{
                contextDetail: llm.contextDetail,
                historyLength: llm.historyLength,
                maxTokens: llm.maxTokens
              }}
              showDetails={true}
              className="text-slate-300"
            />
            <p className="text-xs text-slate-400">
              Estimated token usage per interaction with current settings. Actual usage may vary based on game context.
            </p>
          </div>

          {/* Status */}
          <div className="bg-black/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Status:</span>
              <span className={`font-semibold ${isConfigured() ? 'text-green-400' : 'text-red-400'}`}>
                {isConfigured() ? 'Ready' : 'Needs API Key'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Provider:</span>
              <span className="text-white">{currentProviderInfo?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Model:</span>
              <span className="text-white">{llm.model}</span>
            </div>
          </div>
            </TabsContent>

            {/* UI Settings Tab */}
            <TabsContent value="ui" className="space-y-6">
              {/* Typewriter Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-border/30 pb-2">
                  📝 Text Display
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-semibold">Typewriter Effect</Label>
                      <p className="text-sm text-slate-400">Animate text as it appears character by character</p>
                    </div>
                    <Button
                      onClick={() => setTypewriterEnabled(!ui.typewriterEnabled)}
                      variant={ui.typewriterEnabled ? "default" : "outline"}
                      size="sm"
                      className={ui.typewriterEnabled 
                        ? "bg-primary hover:bg-primary/90" 
                        : "glass border-border/50 hover:bg-white/10"
                      }
                    >
                      {ui.typewriterEnabled ? "ON" : "OFF"}
                    </Button>
                  </div>

                  {ui.typewriterEnabled && (
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">
                        Typing Speed ({ui.typewriterSpeed}ms per character)
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-8">Fast</span>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={ui.typewriterSpeed}
                          onChange={(e) => setTypewriterSpeed(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 w-8">Slow</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TTS Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-border/30 pb-2">
                  🔊 Text-to-Speech
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-semibold">Voice Narration</Label>
                      <p className="text-sm text-slate-400">Have the game read text aloud</p>
                    </div>
                    <Button
                      onClick={() => setTTSEnabled(!ui.ttsEnabled)}
                      variant={ui.ttsEnabled ? "default" : "outline"}
                      size="sm"
                      className={ui.ttsEnabled 
                        ? "bg-primary hover:bg-primary/90" 
                        : "glass border-border/50 hover:bg-white/10"
                      }
                    >
                      {ui.ttsEnabled ? "ON" : "OFF"}
                    </Button>
                  </div>

                  {ui.ttsEnabled && availableVoices.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Voice</Label>
                        <Select value={ui.selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {availableVoices.map((voice) => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">
                          Speech Speed ({ui.speechRate}x)
                        </Label>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400 w-12">0.5x</span>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={ui.speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-slate-400 w-12">2.0x</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Background Music Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-border/30 pb-2">
                  🎵 Background Music
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-semibold">Background Music</Label>
                      <p className="text-sm text-slate-400">Play atmospheric music during gameplay</p>
                    </div>
                    <Button
                      onClick={() => setMusicEnabled(!ui.musicEnabled)}
                      variant={ui.musicEnabled ? "default" : "outline"}
                      size="sm"
                      className={ui.musicEnabled 
                        ? "bg-primary hover:bg-primary/90" 
                        : "glass border-border/50 hover:bg-white/10"
                      }
                    >
                      {ui.musicEnabled ? "ON" : "OFF"}
                    </Button>
                  </div>

                  {ui.musicEnabled && (
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">
                        Music Volume ({Math.round(ui.musicVolume * 100)}%)
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-8">0%</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={ui.musicVolume}
                          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-border/30 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 w-12">100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-border/30">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 glass border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              disabled={!canSaveSettings()}
              className="flex-1 bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-bold disabled:opacity-50"
            >
              Save & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* API Key Manual Modal */}
      {showApiManual && (
        <ApiKeyManual 
          isOpen={showApiManual} 
          onClose={() => setShowApiManual(false)} 
        />
      )}
    </div>
  );
}