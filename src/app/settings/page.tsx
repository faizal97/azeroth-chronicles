'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { LLMProviderFactory } from '@/lib/llm-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    llm,
    setLLMProvider,
    setLLMModel,
    setLLMApiKey,
    setLLMTemperature,
    setLLMMaxTokens,
    validateApiKey,
    resetToDefaults,
    getCurrentProviderInfo,
    isConfigured
  } = useSettingsStore();

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const allProviders = LLMProviderFactory.getAllProviders();
  const currentProviderInfo = getCurrentProviderInfo();

  const handleProviderChange = (providerId: string) => {
    if (LLMProviderFactory.isValidProviderType(providerId)) {
      setLLMProvider(providerId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-slate-300 text-lg">Configure your Azeroth Chronicles experience</p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" className="glass border-primary/50 text-primary hover:bg-primary/10">
                ← Back to Game
              </Button>
            </Link>
          </div>
        </div>

        {/* LLM Provider Settings */}
        <Card className="glass border-primary/20 shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              LLM Provider Settings
            </CardTitle>
            <p className="text-slate-300">Configure your AI model provider and API credentials</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-white text-lg font-semibold">
                Provider
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
                <Label htmlFor="model" className="text-white text-lg font-semibold">
                  Model
                </Label>
                <Select value={llm.model} onValueChange={setLLMModel}>
                  <SelectTrigger className="glass border-border/50 focus:border-primary/50 text-white">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProviderInfo.models.map((model: string) => (
                      <SelectItem key={model} value={model}>
                        {model} {model === currentProviderInfo.defaultModel && '(Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-white text-lg font-semibold">
                API Key
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={apiKeyVisible ? 'text' : 'password'}
                    value={llm.apiKey}
                    onChange={(e) => setLLMApiKey(e.target.value)}
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
                  className={`min-w-24 ${
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
              <p className="text-xs text-slate-400 mt-1">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h3 className="text-white text-lg font-semibold">Advanced Settings</h3>
              
              {/* Temperature */}
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-white">
                  Temperature ({llm.temperature})
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

              {/* Max Tokens */}
              <div className="space-y-2">
                <Label htmlFor="maxTokens" className="text-white">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="256"
                  max="4096"
                  value={llm.maxTokens}
                  onChange={(e) => setLLMMaxTokens(parseInt(e.target.value) || 1024)}
                  className="glass border-border/50 focus:border-primary/50 text-white"
                />
                <p className="text-xs text-slate-400">
                  Maximum number of tokens in the response (256-4096)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-border/30">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="glass border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Reset to Defaults
              </Button>
              
              <div className="flex-1" />
              
              {isConfigured() && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Configuration Complete
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="glass border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">LLM Provider:</span>
                <span className="text-white font-semibold">{currentProviderInfo?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Model:</span>
                <span className="text-white font-semibold">{llm.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Key:</span>
                <span className={`font-semibold ${llm.apiKey ? 'text-green-400' : 'text-red-400'}`}>
                  {llm.apiKey ? 'Configured' : 'Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Connection:</span>
                <span className={`font-semibold ${
                  connectionStatus === 'success' ? 'text-green-400' : 
                  connectionStatus === 'error' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {connectionStatus === 'success' ? 'Tested Successfully' : 
                   connectionStatus === 'error' ? 'Test Failed' : 'Not Tested'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}