import { BaseLLMProvider, LLMProviderType, LLMProviderConfig, LLMProviderInfo, ContextDetail } from './base';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

// Export all types and classes
export * from './base';
export { GeminiProvider } from './gemini';
export { OpenAIProvider } from './openai';

// Get provider info from actual provider instances
function getProviderInfoFromInstance(type: LLMProviderType): LLMProviderInfo {
  const tempProvider = createTempProvider(type);
  return tempProvider.getProviderInfo();
}

function createTempProvider(type: LLMProviderType): BaseLLMProvider {
  // Create a temporary provider with dummy config just to get the info
  const dummyConfig = { apiKey: 'dummy' };
  switch (type) {
    case LLMProviderType.GEMINI:
      return new GeminiProvider(dummyConfig);
    case LLMProviderType.OPENAI:
      return new OpenAIProvider(dummyConfig);
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

export class LLMProviderFactory {
  static createProvider(type: LLMProviderType, config: LLMProviderConfig): BaseLLMProvider {
    switch (type) {
      case LLMProviderType.GEMINI:
        return new GeminiProvider(config);
      case LLMProviderType.OPENAI:
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getProviderInfo(type: LLMProviderType): LLMProviderInfo {
    return getProviderInfoFromInstance(type);
  }

  static getAllProviders(): LLMProviderInfo[] {
    return Object.values(LLMProviderType).map(type => getProviderInfoFromInstance(type));
  }

  static isValidProviderType(type: string): type is LLMProviderType {
    return Object.values(LLMProviderType).includes(type as LLMProviderType);
  }
}

export class LLMManager {
  private provider: BaseLLMProvider | null = null;
  private currentProviderType: LLMProviderType | null = null;

  constructor(
    private getSettings: () => { 
      provider: LLMProviderType; 
      apiKey: string; 
      model?: string; 
      temperature?: number;
      maxTokens?: number;
      historyLength?: number;
      contextDetail?: ContextDetail;
    }
  ) {}

  private ensureProvider(): BaseLLMProvider {
    const settings = this.getSettings();
    
    if (!settings.apiKey) {
      throw new Error(`API key not configured for provider: ${settings.provider}`);
    }

    // Create new provider if type changed or provider doesn't exist
    if (!this.provider || this.currentProviderType !== settings.provider) {
      this.provider = LLMProviderFactory.createProvider(settings.provider, {
        apiKey: settings.apiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        historyLength: settings.historyLength,
        contextDetail: settings.contextDetail
      });
      this.currentProviderType = settings.provider;
    }

    return this.provider;
  }

  async generateResponse(gameContext: any, playerAction: string) {
    const provider = this.ensureProvider();
    return provider.generateResponse(gameContext, playerAction);
  }

  async generateStoryRecap(gameContext: any, prompt: string) {
    const provider = this.ensureProvider();
    return provider.generateStoryRecap(gameContext, prompt);
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number; }) {
    const provider = this.ensureProvider();
    return provider.generateText(prompt, options);
  }

  async validateApiKey(providerType: LLMProviderType, apiKey: string): Promise<boolean> {
    const provider = LLMProviderFactory.createProvider(providerType, { apiKey });
    return provider.validateApiKey(apiKey);
  }

  getCurrentProviderInfo(): LLMProviderInfo | null {
    if (!this.currentProviderType) return null;
    return LLMProviderFactory.getProviderInfo(this.currentProviderType);
  }
}