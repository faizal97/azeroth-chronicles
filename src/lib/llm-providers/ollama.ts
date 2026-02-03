import { BaseLLMProvider, LLMProviderType, LLMProviderInfo, LLMProviderConfig, GameContext, LLMResponse, getPromptByDetail, getCharacterContextByDetail } from './base';

export class OllamaProvider extends BaseLLMProvider {
  private baseUrl: string;

  constructor(config: LLMProviderConfig) {
    super(config);
    this.baseUrl = 'http://localhost:11434/v1';
  }

  getProviderInfo(): LLMProviderInfo {
    return {
      id: LLMProviderType.OLLAMA,
      name: 'Ollama (Local)',
      models: ['llama3.2', 'llama3.2:3b', 'mistral', 'qwen2.5', 'gemma2'],
      modelInfo: {
        'llama3.2': {
          name: 'Llama 3.2',
          description: 'Latest Llama, great for storytelling',
          cost: 'low'
        },
        'llama3.2:3b': {
          name: 'Llama 3.2 3B',
          description: 'Lightweight, fast responses',
          cost: 'low'
        },
        'mistral': {
          name: 'Mistral 7B',
          description: 'Efficient general model',
          cost: 'low'
        },
        'qwen2.5': {
          name: 'Qwen 2.5',
          description: 'Excellent multilingual',
          cost: 'low'
        },
        'gemma2': {
          name: 'Gemma 2',
          description: 'Google open model',
          cost: 'low'
        }
      },
      defaultModel: 'llama3.2',
      requiresApiKey: false,
      freeTextModel: true,
      modelPlaceholder: 'e.g., llama3.2 or mistral',
      modelHelpText: 'Enter any model installed in Ollama'
    };
  }

  async validateApiKey(_apiKey: string): Promise<boolean> {
    // Check if Ollama server is running
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(gameContext: GameContext, playerAction: string): Promise<LLMResponse> {
    const model = this.config.model || 'llama3.2';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature || 0.8,
          max_tokens: this.config.maxTokens || 1024,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
      const data = await response.json();
      let generatedText = data.choices?.[0]?.message?.content;
      if (!generatedText) throw new Error('No response from Ollama');

      generatedText = generatedText.trim();
      if (generatedText.startsWith('```json')) {
        generatedText = generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (generatedText.startsWith('```')) {
        generatedText = generatedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return this.validateResponse(JSON.parse(generatedText));
    } catch (error) {
      console.error('Ollama error:', error);
      return this.createFallbackResponse(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async generateStoryRecap(gameContext: GameContext, prompt: string): Promise<string> {
    const model = this.config.model || 'llama3.2';
    const systemPrompt = `You are a master chronicler writing in the World of Warcraft universe. Write ONLY the story recap text, no JSON.`;
    const userPrompt = `Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-((this.config.historyLength || 5) * 2)).join('\n')}

${prompt}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 512,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || 'Chronicle unavailable.';
    } catch (error) {
      return `Chronicle unavailable. (${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number }): Promise<string> {
    const model = this.config.model || 'llama3.2';
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxOutputTokens ?? 256,
        stream: false,
      }),
    });
    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}
