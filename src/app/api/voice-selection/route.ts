import { NextRequest, NextResponse } from 'next/server';
import { createServerLLMManager, extractLLMSettingsFromHeaders } from '@/lib/llm-manager';

interface VoiceSelectionRequest {
  character: string;
  availableVoices: string[];
  scenario: string;
}

export async function POST(request: NextRequest) {
  try {
    const { character, availableVoices, scenario }: VoiceSelectionRequest = await request.json();

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

    const prompt = `You are an expert voice director for World of Warcraft characters. Your task is to select the most appropriate voice from the available options for the character "${character}" in the "${scenario}" scenario.

Character: ${character}
Available Voices: ${availableVoices.join(', ')}

Consider the character's:
- Race and cultural background
- Gender and age
- Personality traits and demeanor
- Social status and role
- Speaking style in WoW lore

Voice Selection Criteria:
- For male characters: Look for deeper, more masculine voices
- For female characters: Look for higher, more feminine voices
- For authoritative characters: Choose voices that sound commanding
- For mystical characters: Prefer voices with ethereal or mysterious qualities
- For aggressive characters: Select voices with intensity
- For wise characters: Choose voices that sound experienced

Available voices include various accents and tones. Select the single best match.

Respond with ONLY the exact voice name from the list, nothing else. Do not explain your choice.`;

    // Use LLM manager to get voice recommendation
    const response = await llmManager.generateText(prompt, {
      maxOutputTokens: 50,
      temperature: 0.3
    });
    
    const recommendedVoice = response.trim();

    if (!recommendedVoice) {
      return NextResponse.json(
        { error: 'No voice recommendation received' },
        { status: 500 }
      );
    }

    // Validate that the recommended voice is in the available list
    const isValidVoice = availableVoices.some(voice => 
      voice.toLowerCase().includes(recommendedVoice.toLowerCase()) ||
      recommendedVoice.toLowerCase().includes(voice.split(' (')[0].toLowerCase())
    );

    if (!isValidVoice) {
      // Fallback to first available voice if recommendation is invalid
      console.warn(`Invalid voice recommendation: ${recommendedVoice}, using fallback`);
      return NextResponse.json({
        recommendedVoice: availableVoices[0]
      });
    }

    return NextResponse.json({
      recommendedVoice: recommendedVoice
    });

  } catch (error) {
    console.error('Voice selection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}