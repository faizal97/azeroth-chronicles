import { NextRequest, NextResponse } from 'next/server';
import { createServerLLMManager, extractLLMSettingsFromHeaders } from '@/lib/llm-manager';
import type { GameContext } from '@/lib/llm-providers';

interface StoryRecapRequest {
  gameContext: GameContext;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { gameContext, prompt }: StoryRecapRequest = await request.json();
    
    // Extract LLM settings from headers or use environment defaults
    const headerSettings = extractLLMSettingsFromHeaders(request.headers);
    
    let llmManager;
    try {
      llmManager = createServerLLMManager(
        headerSettings.provider,
        headerSettings.apiKey,
        headerSettings.model
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'LLM provider not configured or API key missing' }, 
        { status: 500 }
      );
    }

    // Use the LLM manager to generate story recap
    const recapText = await llmManager.generateStoryRecap(gameContext, prompt);

    return NextResponse.json({ recap: recapText });

  } catch (error) {
    console.error('Error generating story recap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}