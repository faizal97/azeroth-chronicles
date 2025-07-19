import { NextRequest } from 'next/server';
import { type GameContext } from '@/lib/llm-providers';
import { createServerLLMManager, extractLLMSettingsFromHeaders } from '@/lib/llm-manager';

interface GameResponseRequest {
  gameContext: GameContext;
  playerAction: string;
}

export async function POST(request: NextRequest) {
  try {
    const { gameContext, playerAction }: GameResponseRequest = await request.json();
    
    // Extract LLM settings from headers (client-configured) or fall back to env vars
    const headerSettings = extractLLMSettingsFromHeaders(request.headers);
    
    let llmManager;
    try {
      llmManager = createServerLLMManager(
        headerSettings.provider,
        headerSettings.apiKey,
        headerSettings.model
      );
    } catch {
      return new Response(
        JSON.stringify({ error: 'LLM provider not configured or API key missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Helper function to send SSE data
        const sendSSEData = (data: { type: string; message?: string; data?: unknown; text?: string; isComplete?: boolean }) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Send initial processing indicator
          sendSSEData({ type: 'processing', message: 'Generating response...' });

          // Use the LLM manager to generate response
          const validatedResponse = await llmManager.generateResponse(gameContext, playerAction);
          
          // Stream the text content first (for immediate display)
          const textContent = validatedResponse.content.text;
          const words = textContent.split(/(\s+)/);
          
          // Send text chunks word by word for streaming effect
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            sendSSEData({ 
              type: 'text_chunk', 
              text: word,
              isComplete: i === words.length - 1
            });
            
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Send metadata after text is complete
          sendSSEData({ 
            type: 'metadata', 
            data: {
              response_type: validatedResponse.response_type,
              speaker: validatedResponse.content.speaker,
              speaker_title: validatedResponse.content.speaker_title
            }
          });

          // Send environment data
          sendSSEData({ 
            type: 'environment', 
            data: validatedResponse.environment 
          });

          // Send action choices
          sendSSEData({ 
            type: 'action_choices', 
            data: validatedResponse.action_choices 
          });

          // Send character updates
          if (validatedResponse.character_updates) {
            sendSSEData({ 
              type: 'character_updates', 
              data: validatedResponse.character_updates 
            });
          }

          // Send game state
          if (validatedResponse.game_state) {
            sendSSEData({ 
              type: 'game_state', 
              data: validatedResponse.game_state 
            });
          }

          // Send completion signal
          sendSSEData({ type: 'complete' });

        } catch (error) {
          console.error('SSE Error:', error);
          sendSSEData({ 
            type: 'error', 
            message: error instanceof Error ? error.message : 'Unknown error' 
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Request error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}