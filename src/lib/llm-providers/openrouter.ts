import { BaseLLMProvider, LLMProviderType, LLMProviderInfo, LLMProviderConfig, GameContext, LLMResponse, getPromptByDetail, getCharacterContextByDetail } from './base';

export class OpenRouterProvider extends BaseLLMProvider {
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getProviderInfo(): LLMProviderInfo {
    return {
      id: LLMProviderType.OPENROUTER,
      name: 'OpenRouter',
      models: [
        'google/gemini-2.5-flash',
        'google/gemini-2.5-pro',
        'anthropic/claude-3.5-sonnet',
        'meta-llama/llama-3.3-70b-instruct'
      ],
      modelInfo: {
        'google/gemini-2.5-flash': {
          name: 'Gemini 2.5 Flash',
          description: 'Fast Google model via OpenRouter',
          cost: 'low'
        },
        'google/gemini-2.5-pro': {
          name: 'Gemini 2.5 Pro',
          description: 'Advanced Google model via OpenRouter',
          cost: 'medium'
        },
        'anthropic/claude-3.5-sonnet': {
          name: 'Claude 3.5 Sonnet',
          description: 'Excellent storytelling and creativity',
          cost: 'medium'
        },
        'meta-llama/llama-3.3-70b-instruct': {
          name: 'Llama 3.3 70B',
          description: 'Open source, strong performance',
          cost: 'low'
        }
      },
      defaultModel: 'google/gemini-2.5-flash',
      requiresApiKey: true,
      freeTextModel: true,
      modelPlaceholder: 'e.g., google/gemini-2.5-flash',
      modelHelpText: 'Enter any model from openrouter.ai/models'
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(gameContext: GameContext, playerAction: string): Promise<LLMResponse> {
    const model = this.config.model || 'google/gemini-2.5-flash';
    const systemPrompt = getPromptByDetail(this.config.contextDetail);
    const userPrompt = `Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-(this.config.historyLength || 5)).join('\n')}

Player Action: ${playerAction}

Respond with JSON only:`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://azeroth-chronicles.app',
          'X-Title': 'Azeroth Chronicles RPG',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature || 0.8,
          max_tokens: this.config.maxTokens || 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      let generatedText = data.choices?.[0]?.message?.content;
      if (!generatedText) throw new Error('No response from OpenRouter');

      // Clean markdown code blocks
      generatedText = generatedText.trim();
      if (generatedText.startsWith('```json')) {
        generatedText = generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (generatedText.startsWith('```')) {
        generatedText = generatedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return this.validateResponse(JSON.parse(generatedText));
    } catch (error) {
      console.error('OpenRouter error:', error);
      return this.createFallbackResponse(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async generateStoryRecap(gameContext: GameContext, prompt: string): Promise<string> {
    const model = this.config.model || 'google/gemini-2.5-flash';
    const systemPrompt = `You are a master chronicler writing in the World of Warcraft universe. Write ONLY the story recap text, no JSON, no formatting markers.`;
    const userPrompt = `Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-((this.config.historyLength || 5) * 2)).join('\n')}

${prompt}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://azeroth-chronicles.app',
          'X-Title': 'Azeroth Chronicles RPG',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 512,
        }),
      });

      if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || 'Chronicle unavailable.';
    } catch (error) {
      return `Chronicle unavailable. (${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number }): Promise<string> {
    const model = this.config.model || 'google/gemini-2.5-flash';
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://azeroth-chronicles.app',
        'X-Title': 'Azeroth Chronicles RPG',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxOutputTokens ?? 256,
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}
