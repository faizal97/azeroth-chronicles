import { LLMManager, LLMProviderType } from './llm-providers';

// Server-side LLM manager that reads from environment variables or request headers
export function createServerLLMManager(
  providerType?: LLMProviderType, 
  apiKey?: string,
  model?: string
) {
  // Default to environment variables if not provided
  const provider = providerType || (process.env.DEFAULT_LLM_PROVIDER as LLMProviderType) || LLMProviderType.GEMINI;
  const key = apiKey || 
    (provider === LLMProviderType.GEMINI ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.OPENAI_API_KEY) ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Fallback to Gemini for backwards compatibility

  if (!key) {
    throw new Error(`API key not found for provider: ${provider}`);
  }

  return new LLMManager(() => ({
    provider,
    apiKey: key,
    model
  }));
}

// Extract LLM settings from request headers (for client-configured settings)
export function extractLLMSettingsFromHeaders(headers: Headers) {
  const provider = headers.get('x-llm-provider') as LLMProviderType | null;
  const apiKey = headers.get('x-llm-api-key');
  const model = headers.get('x-llm-model');

  return {
    provider: provider || undefined,
    apiKey: apiKey || undefined,
    model: model || undefined
  };
}