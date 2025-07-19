import OpenAI from 'openai';
import { BaseLLMProvider, LLMProviderType, LLMProviderInfo, LLMProviderConfig, GameContext, LLMResponse, getPromptByDetail, getCharacterContextByDetail } from './base';

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(config: LLMProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  getProviderInfo(): LLMProviderInfo {
    return {
      id: LLMProviderType.OPENAI,
      name: 'OpenAI',
      models: ['o3', 'o4-mini', 'gpt-4.1', 'gpt-4.5', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-mini'],
      modelInfo: {
        'o3': {
          name: 'o3',
          description: 'Latest flagship model, exceptional reasoning',
          cost: 'high'
        },
        'o4-mini': {
          name: 'o4 Mini',
          description: 'Compact powerhouse, efficient performance',
          cost: 'medium'
        },
        'gpt-4.1': {
          name: 'GPT-4.1',
          description: 'Enhanced capabilities, improved accuracy',
          cost: 'high'
        },
        'gpt-4.5': {
          name: 'GPT-4.5 (Preview)',
          description: 'Cutting-edge preview, advanced features',
          cost: 'high'
        },
        'gpt-4o': {
          name: 'GPT-4o',
          description: 'Advanced reasoning, rich narratives',
          cost: 'high'
        },
        'gpt-4.1-mini': {
          name: 'GPT-4.1 Mini',
          description: 'Balanced efficiency, solid performance',
          cost: 'medium'
        },
        'gpt-4.1-nano': {
          name: 'GPT-4.1 Nano',
          description: 'Ultra-fast, lightweight responses',
          cost: 'low'
        },
        'gpt-4o-mini': {
          name: 'GPT-4o Mini',
          description: 'Fast, affordable, good storytelling',
          cost: 'low'
        }
      },
      defaultModel: 'gpt-4o-mini',
      requiresApiKey: true
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      await testClient.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async generateResponse(gameContext: GameContext, playerAction: string): Promise<LLMResponse> {
    const model = this.config.model || 'gpt-4o-mini';
    
    const systemPrompt = getPromptByDetail(this.config.contextDetail);
    const userPrompt = `Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-(this.config.historyLength || 5)).join('\n')}

Player Action: ${playerAction}

Respond with JSON only:`;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: this.config.temperature || 0.8,
        max_tokens: this.config.maxTokens || 1024,
        response_format: { type: 'json_object' }
      });

      const generatedText = response.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No response generated from OpenAI API');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(generatedText);
      } catch (parseError) {
        console.error('Raw response:', generatedText);
        throw new Error(`Failed to parse LLM response as JSON: ${parseError}`);
      }

      // Validate using Zod schema
      return this.validateResponse(parsedResponse);

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.createFallbackResponse(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async generateStoryRecap(gameContext: GameContext, prompt: string): Promise<string> {
    const model = this.config.model || 'gpt-4o-mini';

    const systemPrompt = `You are a master chronicler writing in the World of Warcraft universe. Write ONLY the story recap text, no JSON, no formatting markers. Write as a flowing narrative in the style of a World of Warcraft quest journal entry.`;
    
    const userPrompt = `Current Game State:
- Scenario: ${gameContext.scenario}
${getCharacterContextByDetail(gameContext.character, this.config.contextDetail)}

Recent Narrative:
${gameContext.narrative_history.slice(-((this.config.historyLength || 5) * 2)).join('\n')}

${prompt}`;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 512,
      });

      const generatedText = response.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No response generated from OpenAI API');
      }

      return generatedText.trim();

    } catch (error) {
      console.error('Error generating story recap with OpenAI:', error);
      return `The chronicle keeper's quill seems to have run dry. A summary of recent events cannot be penned at this time. (${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number; }): Promise<string> {
    const model = this.config.model || 'gpt-4o-mini';

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxOutputTokens ?? 256,
      });

      const generatedText = response.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No response generated from OpenAI API');
      }

      return generatedText.trim();

    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error;
    }
  }
}