'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { LLMProviderFactory, LLMProviderType } from '@/lib/llm-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiKeyManual } from './ApiKeyManual';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const {
    llm,
    setLLMProvider,
    setLLMModel,
    setLLMApiKey,
    setLLMTemperature,
    validateApiKey,
    getCurrentProviderInfo,
    isConfigured
  } = useSettingsStore();

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [showApiManual, setShowApiManual] = useState(false);

  const allProviders = LLMProviderFactory.getAllProviders();
  const currentProviderInfo = getCurrentProviderInfo();

  const handleProviderChange = (providerId: string) => {
    if (LLMProviderFactory.isValidProviderType(providerId)) {
      setLLMProvider(providerId);
      setConnectionStatus('idle');
    }
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
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleComplete = () => {
    if (isConfigured() && connectionStatus === 'success') {
      onComplete();
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && llm.provider) {
      setCurrentStep(2);
    } else if (currentStep === 2 && llm.apiKey.trim() && connectionStatus === 'success') {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-strong border-primary/50 shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-chart-4 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧙‍♂️</span>
            </div>
          </div>
          <CardTitle className="text-3xl text-gradient">
            Welcome to Azeroth Chronicles
          </CardTitle>
          <p className="text-slate-300 mt-2">
            Before we begin your adventure, let&apos;s set up your AI companion
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-primary scale-125'
                    : step < currentStep
                    ? 'bg-primary/70'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Provider Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 fade-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Choose Your AI Provider</h3>
                <p className="text-slate-400 text-sm">
                  Select which AI service will power your adventure
                </p>
              </div>
              
              <div className="space-y-4">
                {allProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      llm.provider === provider.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{provider.name}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Models: {provider.models.slice(0, 2).join(', ')}
                          {provider.models.length > 2 && ` +${provider.models.length - 2} more`}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        llm.provider === provider.id
                          ? 'border-primary bg-primary'
                          : 'border-slate-500'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Model Selection */}
              {currentProviderInfo && llm.provider && (
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <Label htmlFor="model" className="text-white font-semibold">
                    Model
                  </Label>
                  <div className="text-xs text-slate-400 mb-2">
                    💰 = Low cost • 💰💰 = Medium cost • 💰💰💰 = High cost
                  </div>
                  <Select value={llm.model} onValueChange={setLLMModel}>
                    <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white px-4 py-3">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[400px] max-h-[300px] p-4">
                      {currentProviderInfo.models.map((model: string) => {
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
                                    <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-md font-medium">Recommended</span>
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
            </div>
          )}

          {/* Step 2: API Key Setup */}
          {currentStep === 2 && (
            <div className="space-y-6 fade-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Configure API Access</h3>
                <p className="text-slate-400 text-sm">
                  Enter your {currentProviderInfo?.name} API key to enable the AI
                </p>
              </div>

              <div className="space-y-4">
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
                        onChange={(e) => {
                          setLLMApiKey(e.target.value);
                          setConnectionStatus('idle');
                        }}
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
                    Your API key is stored locally and never sent to our servers
                  </p>
                </div>

                {/* API Key Help */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
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
                    {llm.provider === LLMProviderType.GEMINI ? (
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
            </div>
          )}

          {/* Step 3: Final Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6 fade-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Perfect! You&apos;re All Set</h3>
                <p className="text-slate-400 text-sm">
                  Your AI companion is ready. You can adjust these settings anytime from the game.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Provider:</span>
                  <span className="text-white font-semibold">{currentProviderInfo?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Model:</span>
                  <span className="text-white">{llm.model}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Status:</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    ✅ Connected
                  </span>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-white font-semibold">
                    Creativity Level ({llm.temperature})
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
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-700">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="glass border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              ← Back
            </Button>
            
            <div className="text-xs text-slate-400">
              Step {currentStep} of 3
            </div>

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !llm.provider) ||
                  (currentStep === 2 && (!llm.apiKey.trim() || connectionStatus !== 'success'))
                }
                className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-bold disabled:opacity-50"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
              >
                Start Adventure! 🚀
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* API Key Manual Modal */}
      {showApiManual && (
        <ApiKeyManual 
          provider={llm.provider}
          isModal={true}
          onClose={() => setShowApiManual(false)}
        />
      )}
    </div>
  );
}