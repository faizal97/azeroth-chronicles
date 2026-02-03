import { BaseLLMProvider, LLMProviderType, LLMProviderConfig, LLMProviderInfo, ContextDetail } from './base';
import { GeminiProvider } from './gemini';
import { OpenRouterProvider } from './openrouter';
import { OllamaProvider } from './ollama';

export * from './base';
export { GeminiProvider } from './gemini';
export { OpenRouterProvider } from './openrouter';
export { OllamaProvider } from './ollama';

function createTempProvider(type: LLMProviderType): BaseLLMProvider {
  const dummyConfig = { apiKey: '' };
  switch (type) {
    case LLMProviderType.GEMINI:
      return new GeminiProvider(dummyConfig);
    case LLMProviderType.OPENROUTER:
      return new OpenRouterProvider(dummyConfig);
    case LLMProviderType.OLLAMA:
      return new OllamaProvider(dummyConfig);
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

export class LLMProviderFactory {
  static createProvider(type: LLMProviderType, config: LLMProviderConfig): BaseLLMProvider {
    switch (type) {
      case LLMProviderType.GEMINI:
        return new GeminiProvider(config);
      case LLMProviderType.OPENROUTER:
        return new OpenRouterProvider(config);
      case LLMProviderType.OLLAMA:
        return new OllamaProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getProviderInfo(type: LLMProviderType): LLMProviderInfo {
    return createTempProvider(type).getProviderInfo();
  }

  static getAllProviders(): LLMProviderInfo[] {
    return Object.values(LLMProviderType).map(type => createTempProvider(type).getProviderInfo());
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
    const providerInfo = LLMProviderFactory.getProviderInfo(settings.provider);

    // Ollama doesn't require API key
    if (providerInfo.requiresApiKey && !settings.apiKey) {
      throw new Error(`API key not configured for: ${settings.provider}`);
    }

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
    return this.ensureProvider().generateResponse(gameContext, playerAction);
  }

  async generateStoryRecap(gameContext: any, prompt: string) {
    return this.ensureProvider().generateStoryRecap(gameContext, prompt);
  }

  async generateText(prompt: string, options?: { maxOutputTokens?: number; temperature?: number }) {
    return this.ensureProvider().generateText(prompt, options);
  }

  async validateApiKey(providerType: LLMProviderType, apiKey: string): Promise<boolean> {
    return LLMProviderFactory.createProvider(providerType, { apiKey }).validateApiKey(apiKey);
  }

  getCurrentProviderInfo(): LLMProviderInfo | null {
    if (!this.currentProviderType) return null;
    return LLMProviderFactory.getProviderInfo(this.currentProviderType);
  }
}
