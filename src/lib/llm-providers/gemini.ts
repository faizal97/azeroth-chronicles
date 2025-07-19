import { BaseLLMProvider, LLMProviderType, LLMProviderInfo, LLMProviderConfig, GameContext, LLMResponse, getPromptByDetail, getCharacterContextByDetail } from './base';

export class GeminiProvider extends BaseLLMProvider {
  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getProviderInfo(): LLMProviderInfo {
    return {
      id: LLMProviderType.GEMINI,
      name: 'Google Gemini',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-06-17'],
      modelInfo: {
        'gemini-1.5-flash': {
          name: 'Gemini 1.5 Flash',
          description: 'Fast responses, creative storytelling',
          cost: 'low'
        },
        'gemini-1.5-pro': {
          name: 'Gemini 1.5 Pro',
          description: 'Deep intelligence, nuanced narratives',
          cost: 'medium'
        },
        'gemini-1.0-pro': {
          name: 'Gemini 1.0 Pro',
          description: 'Reliable foundation model, stable performance',
          cost: 'low'
        },
        'gemini-2.5-pro': {
          name: 'Gemini 2.5 Pro',
          description: 'Next-gen intelligence, advanced reasoning',
          cost: 'high'
        },
        'gemini-2.5-flash': {
          name: 'Gemini 2.5 Flash',
          description: 'Ultra-fast next-gen, enhanced creativity',
          cost: 'medium'
        },
        'gemini-2.5-flash-lite-preview-06-17': {
          name: 'Gemini 2.5 Flash Lite (Preview)',
          description: 'Lightweight preview, experimental features',
          cost: 'low'
        }
      },
      defaultModel: 'gemini-1.5-flash',
      requiresApiKey: true
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(gameContext: GameContext, playerAction: string): Promise<LLMResponse> {
    const model = this.config.model || 'gemini-1.5-flash';
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${getPromptByDetail(this.config.contextDetail)}

Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-(this.config.historyLength || 5)).join('\n')}

Player Action: ${playerAction}

Respond with JSON only:`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.config.temperature || 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: this.config.maxTokens || 1024,
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Details:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response generated from Gemini API');
      }

      // Clean and parse the JSON response
      let cleanedText = generatedText.trim();
      
      // Remove markdown code block formatting if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Raw response:', generatedText);
        throw new Error(`Failed to parse LLM response as JSON: ${parseError}`);
      }

      // Validate using Zod schema
      return this.validateResponse(parsedResponse);

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.createFallbackResponse(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async generateStoryRecap(gameContext: GameContext, prompt: string): Promise<string> {
    const model = this.config.model || 'gemini-1.5-flash';

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a master chronicler writing in the World of Warcraft universe. 

Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-((this.config.historyLength || 5) * 2)).join('\n')}

${prompt}

Write ONLY the story recap text, no JSON, no formatting markers. Write as a flowing narrative in the style of a World of Warcraft quest journal entry.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: this.config.maxTokens || 512,
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Details:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response generated from Gemini API');
      }

      // Clean any potential JSON formatting
      let cleanText = generatedText.trim();
      
      // Remove any JSON structure if present
      if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanText);
          cleanText = parsed.text || parsed.content || cleanText;
        } catch {
          // If parsing fails, use the original text
        }
      }
      
      // Remove markdown formatting
      cleanText = cleanText.replace(/```json\s*|\s*```/g, '');
      cleanText = cleanText.replace(/```\s*|\s*```/g, '');
      
      return cleanText;

    } catch (error) {
      console.error('Error generating story recap:', error);
      return `The chronicle keeper's quill seems to have run dry. A summary of recent events cannot be penned at this time. (${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number; }): Promise<string> {
    const model = this.config.model || 'gemini-1.5-flash';

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: options?.maxOutputTokens ?? 256,
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Details:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response generated from Gemini API');
      }

      return generatedText.trim();

    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
}