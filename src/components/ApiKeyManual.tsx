'use client';

import React, { useState } from 'react';
import { LLMProviderType } from '@/lib/llm-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiKeyManualProps {
  provider?: LLMProviderType;
  isModal?: boolean;
  onClose?: () => void;
}

export function ApiKeyManual({ provider, isModal = false, onClose }: ApiKeyManualProps) {
  const [activeProvider, setActiveProvider] = useState<LLMProviderType>(provider || LLMProviderType.GEMINI);

  const geminiSteps = [
    {
      step: 1,
      title: "Visit Google AI Studio",
      content: "Go to Google AI Studio at aistudio.google.com",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Open Google AI Studio"
    },
    {
      step: 2,
      title: "Sign in with Google",
      content: "Use your existing Google account or create a new one if needed. Any Gmail account will work."
    },
    {
      step: 3,
      title: "Navigate to API Keys",
      content: "Once signed in, you'll see the API key management interface. Look for the 'Create API Key' section."
    },
    {
      step: 4,
      title: "Create Your API Key",
      content: "Click 'Create API Key' button. You can optionally name your key for easy identification."
    },
    {
      step: 5,
      title: "Copy Your Key",
      content: "Your API key will be displayed. Copy it immediately and store it safely - you won't be able to see it again!"
    }
  ];

  const openrouterSteps = [
    {
      step: 1,
      title: "Visit OpenRouter",
      content: "Go to OpenRouter at openrouter.ai",
      link: "https://openrouter.ai/keys",
      linkText: "Open OpenRouter"
    },
    {
      step: 2,
      title: "Create or Sign in to Account",
      content: "Create a new OpenRouter account or sign in. You can use Google, GitHub, or email to sign up."
    },
    {
      step: 3,
      title: "Add Credits (Optional)",
      content: "OpenRouter offers pay-per-use pricing. Add credits to your account, or use free models to get started."
    },
    {
      step: 4,
      title: "Navigate to API Keys",
      content: "Go to the Keys section in your account dashboard."
    },
    {
      step: 5,
      title: "Generate New Key",
      content: "Click 'Create Key'. Give it a name for identification, then click 'Create'."
    },
    {
      step: 6,
      title: "Copy Your Key",
      content: "Copy the API key immediately! Once you close this window, you won't be able to see it again."
    }
  ];

  const ollamaSteps = [
    {
      step: 1,
      title: "Download Ollama",
      content: "Go to ollama.ai and download the installer for your operating system (macOS, Windows, or Linux).",
      link: "https://ollama.ai",
      linkText: "Download Ollama"
    },
    {
      step: 2,
      title: "Install Ollama",
      content: "Run the installer and follow the on-screen instructions. Ollama will be installed as a system service."
    },
    {
      step: 3,
      title: "Start Ollama Server",
      content: "Open a terminal and run 'ollama serve' to start the local server. It will run on localhost:11434."
    },
    {
      step: 4,
      title: "Pull a Model",
      content: "In a new terminal, run 'ollama pull llama3.2' to download a model. You can also try 'mistral' or 'gemma2'."
    },
    {
      step: 5,
      title: "Test Connection",
      content: "Go back to the game settings and click 'Test Connection' to verify Ollama is running correctly."
    }
  ];

  const renderSteps = (steps: typeof geminiSteps) => (
    <div className="space-y-4">
      {steps.map((stepData) => (
        <div key={stepData.step} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            {stepData.step}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{stepData.title}</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{stepData.content}</p>
            {stepData.link && (
              <Button
                onClick={() => window.open(stepData.link, '_blank')}
                variant="outline"
                size="sm"
                className="mt-2 glass border-primary/50 text-primary hover:bg-primary/10"
              >
                {stepData.linkText}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">
          AI Provider Setup Guide
        </h2>
        <p className="text-slate-400">
          Follow these step-by-step instructions to get your API key or set up local AI
        </p>
      </div>

      {/* Provider Tabs */}
      <Tabs value={activeProvider} onValueChange={(value) => setActiveProvider(value as LLMProviderType)}>
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value={LLMProviderType.GEMINI} className="data-[state=active]:bg-primary/20">
            Gemini
          </TabsTrigger>
          <TabsTrigger value={LLMProviderType.OPENROUTER} className="data-[state=active]:bg-primary/20">
            OpenRouter
          </TabsTrigger>
          <TabsTrigger value={LLMProviderType.OLLAMA} className="data-[state=active]:bg-primary/20">
            Ollama
          </TabsTrigger>
        </TabsList>

        {/* Gemini Instructions */}
        <TabsContent value={LLMProviderType.GEMINI} className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              About Google Gemini
            </h3>
            <p className="text-blue-300 text-sm">
              Google&apos;s advanced AI model family. Free tier includes generous usage limits.
              Perfect for creative storytelling and role-playing scenarios.
            </p>
          </div>

          {renderSteps(geminiSteps)}

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">What You Get:</h4>
            <ul className="text-green-300 text-sm space-y-1">
              <li>Free tier with generous monthly limits</li>
              <li>Access to Gemini 2.5 Flash and Pro models</li>
              <li>Excellent performance for creative writing</li>
              <li>No credit card required to start</li>
            </ul>
          </div>
        </TabsContent>

        {/* OpenRouter Instructions */}
        <TabsContent value={LLMProviderType.OPENROUTER} className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              About OpenRouter
            </h3>
            <p className="text-purple-300 text-sm">
              Access 100+ AI models through one API. Use Claude, GPT-4, Llama, Mistral, and more.
              Pay only for what you use with unified billing.
            </p>
          </div>

          {renderSteps(openrouterSteps)}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">Pricing Info:</h4>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>Pay-per-use model (very affordable for gaming)</li>
              <li>Many free models available</li>
              <li>Access to Claude, GPT-4, Llama, and more</li>
              <li>Single API key for all models</li>
            </ul>
          </div>
        </TabsContent>

        {/* Ollama Instructions */}
        <TabsContent value={LLMProviderType.OLLAMA} className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
              About Ollama
            </h3>
            <p className="text-green-300 text-sm">
              Run AI models locally on your machine. Completely free and private - your data never leaves your computer.
              Requires a reasonably powerful computer with 8GB+ RAM.
            </p>
          </div>

          {renderSteps(ollamaSteps)}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Benefits:</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>Completely free - no API costs</li>
              <li>100% private - data stays on your machine</li>
              <li>Works offline</li>
              <li>Many open-source models available</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">Requirements:</h4>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>8GB RAM minimum (16GB recommended)</li>
              <li>5-10GB disk space per model</li>
              <li>Modern CPU (Apple Silicon or recent Intel/AMD)</li>
              <li>GPU optional but improves speed significantly</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
          Security & Privacy
        </h4>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>Your API key is stored locally in your browser only</li>
          <li>We never store or have access to your API keys</li>
          <li>API calls go directly from your browser to the AI provider</li>
          <li>You can revoke or rotate keys anytime in the provider&apos;s dashboard</li>
        </ul>
      </div>

      {/* Help Links */}
      <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-3">Additional Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => window.open('https://ai.google.dev/gemini-api/docs/api-key', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            Gemini API Documentation
          </Button>
          <Button
            onClick={() => window.open('https://openrouter.ai/docs', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            OpenRouter Documentation
          </Button>
          <Button
            onClick={() => window.open('https://github.com/ollama/ollama', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            Ollama Documentation
          </Button>
          <Button
            onClick={() => window.open('https://ollama.ai/library', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            Browse Ollama Models
          </Button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border-primary/50 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-gradient">
                API Key Setup Guide
              </CardTitle>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                >
                  X
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto glass-strong border-primary/50">
      <CardHeader>
        <CardTitle className="text-2xl text-gradient">
          API Key Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
