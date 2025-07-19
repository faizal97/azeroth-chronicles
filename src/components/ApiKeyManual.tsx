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

  const openaiSteps = [
    {
      step: 1,
      title: "Visit OpenAI Platform",
      content: "Go to the OpenAI Platform at platform.openai.com",
      link: "https://platform.openai.com/api-keys",
      linkText: "Open OpenAI Platform"
    },
    {
      step: 2,
      title: "Create or Sign in to Account",
      content: "Create a new OpenAI account or sign in if you already have one. You can use the same account as ChatGPT."
    },
    {
      step: 3,
      title: "Verify Your Account",
      content: "Check your email for a verification link from OpenAI and click it to confirm your account."
    },
    {
      step: 4,
      title: "Create Organization",
      content: "Click 'Start building' to create an organization. Enter your organization name and select your role."
    },
    {
      step: 5,
      title: "Navigate to API Keys",
      content: "Click on your profile icon (top right) → 'View API keys' or go directly to the API keys page."
    },
    {
      step: 6,
      title: "Generate New Key",
      content: "Click 'Create new secret key'. Give it a name and select a project, then click 'Generate API Key'."
    },
    {
      step: 7,
      title: "Save Your Key",
      content: "Copy the API key immediately! Once you close this window, you won't be able to see it again."
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
                🔗 {stepData.linkText}
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
          Follow these step-by-step instructions to get your API key
        </p>
      </div>

      {/* Provider Tabs */}
      <Tabs value={activeProvider} onValueChange={(value) => setActiveProvider(value as LLMProviderType)}>
        <TabsList className="grid w-full grid-cols-2 glass">
          <TabsTrigger value={LLMProviderType.GEMINI} className="data-[state=active]:bg-primary/20">
            Google Gemini
          </TabsTrigger>
          <TabsTrigger value={LLMProviderType.OPENAI} className="data-[state=active]:bg-primary/20">
            OpenAI
          </TabsTrigger>
        </TabsList>

        {/* Gemini Instructions */}
        <TabsContent value={LLMProviderType.GEMINI} className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              💡 About Google Gemini
            </h3>
            <p className="text-blue-300 text-sm">
              Google&apos;s advanced AI model family. Free tier includes generous usage limits. 
              Perfect for creative storytelling and role-playing scenarios.
            </p>
          </div>

          {renderSteps(geminiSteps)}

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">✅ What You Get:</h4>
            <ul className="text-green-300 text-sm space-y-1">
              <li>• Free tier with generous monthly limits</li>
              <li>• Access to Gemini 1.5 Flash and Pro models</li>
              <li>• Excellent performance for creative writing</li>
              <li>• No credit card required to start</li>
            </ul>
          </div>
        </TabsContent>

        {/* OpenAI Instructions */}
        <TabsContent value={LLMProviderType.OPENAI} className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
              💡 About OpenAI
            </h3>
            <p className="text-green-300 text-sm">
              Industry-leading AI models including GPT-4. Pay-per-use pricing. 
              Excellent for consistent, high-quality responses.
            </p>
          </div>

          {renderSteps(openaiSteps)}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">💳 Pricing Info:</h4>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• Pay-per-use model (very affordable for gaming)</li>
              <li>• $5 free credits for new accounts</li>
              <li>• GPT-4o Mini: ~$0.0001 per turn (extremely cheap)</li>
              <li>• Credit card required after free credits</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
          🔒 Security & Privacy
        </h4>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• Your API key is stored locally in your browser only</li>
          <li>• We never store or have access to your API keys</li>
          <li>• API calls go directly from your browser to the AI provider</li>
          <li>• You can revoke or rotate keys anytime in the provider&apos;s dashboard</li>
        </ul>
      </div>

      {/* Help Links */}
      <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-3">📚 Additional Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => window.open('https://ai.google.dev/gemini-api/docs/api-key', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            📖 Gemini API Documentation
          </Button>
          <Button
            onClick={() => window.open('https://platform.openai.com/docs/quickstart', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            📖 OpenAI API Documentation
          </Button>
          <Button
            onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            🔑 Get Gemini API Key
          </Button>
          <Button
            onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
            variant="outline"
            size="sm"
            className="glass border-primary/30 text-primary hover:bg-primary/10 justify-start"
          >
            🔑 Get OpenAI API Key
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
                  ✕
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