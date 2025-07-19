import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LLMProviderType, LLMProviderFactory } from '@/lib/llm-providers';

type ContextDetail = 'minimal' | 'standard' | 'rich';

interface LLMSettings {
  provider: LLMProviderType;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  historyLength: number;
  contextDetail: ContextDetail;
}

interface UISettings {
  // Text-to-Speech settings
  ttsEnabled: boolean;
  speechRate: number;
  selectedVoice: string;
  
  // Typewriter settings
  typewriterEnabled: boolean;
  typewriterSpeed: number;
  
  // Background Music settings
  musicEnabled: boolean;
  musicVolume: number;
}

interface SettingsState {
  // LLM Settings
  llm: LLMSettings;
  
  // UI/UX Settings
  ui: UISettings;
  
  // LLM Actions
  setLLMProvider: (provider: LLMProviderType) => void;
  setLLMModel: (model: string) => void;
  setLLMApiKey: (apiKey: string) => void;
  setLLMTemperature: (temperature: number) => void;
  setLLMMaxTokens: (maxTokens: number) => void;
  setLLMHistoryLength: (historyLength: number) => void;
  setLLMContextDetail: (contextDetail: ContextDetail) => void;
  validateApiKey: (provider: LLMProviderType, apiKey: string) => Promise<boolean>;
  
  // UI Actions
  setTTSEnabled: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSelectedVoice: (voice: string) => void;
  setTypewriterEnabled: (enabled: boolean) => void;
  setTypewriterSpeed: (speed: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  
  // General
  resetToDefaults: () => void;
  
  // Getters
  getCurrentProviderInfo: () => any;
  isConfigured: () => boolean;
}

const DEFAULT_LLM_SETTINGS: LLMSettings = {
  provider: LLMProviderType.GEMINI,
  model: 'gemini-1.5-flash',
  apiKey: '',
  temperature: 0.8,
  maxTokens: 1024,
  historyLength: 5,
  contextDetail: 'standard',
};

const DEFAULT_UI_SETTINGS: UISettings = {
  ttsEnabled: false,
  speechRate: 1.0,
  selectedVoice: '',
  typewriterEnabled: true,
  typewriterSpeed: 15,
  musicEnabled: true,
  musicVolume: 0.3,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      llm: DEFAULT_LLM_SETTINGS,
      ui: DEFAULT_UI_SETTINGS,

      setLLMProvider: (provider: LLMProviderType) => {
        const providerInfo = LLMProviderFactory.getProviderInfo(provider);
        set((state) => ({
          llm: {
            ...state.llm,
            provider,
            model: providerInfo.defaultModel, // Reset to default model when provider changes
          }
        }));
      },

      setLLMModel: (model: string) => {
        set((state) => ({
          llm: {
            ...state.llm,
            model,
          }
        }));
      },

      setLLMApiKey: (apiKey: string) => {
        set((state) => ({
          llm: {
            ...state.llm,
            apiKey,
          }
        }));
      },

      setLLMTemperature: (temperature: number) => {
        set((state) => ({
          llm: {
            ...state.llm,
            temperature,
          }
        }));
      },

      setLLMMaxTokens: (maxTokens: number) => {
        set((state) => ({
          llm: {
            ...state.llm,
            maxTokens,
          }
        }));
      },

      setLLMHistoryLength: (historyLength: number) => {
        set((state) => ({
          llm: {
            ...state.llm,
            historyLength,
          }
        }));
      },

      setLLMContextDetail: (contextDetail: ContextDetail) => {
        set((state) => ({
          llm: {
            ...state.llm,
            contextDetail,
          }
        }));
      },

      validateApiKey: async (provider: LLMProviderType, apiKey: string) => {
        try {
          const providerInstance = LLMProviderFactory.createProvider(provider, { apiKey });
          return await providerInstance.validateApiKey(apiKey);
        } catch (error) {
          console.error('Error validating API key:', error);
          return false;
        }
      },

      // UI Settings Actions
      setTTSEnabled: (enabled: boolean) => {
        set((state) => ({
          ui: {
            ...state.ui,
            ttsEnabled: enabled,
          }
        }));
      },

      setSpeechRate: (rate: number) => {
        set((state) => ({
          ui: {
            ...state.ui,
            speechRate: rate,
          }
        }));
      },

      setSelectedVoice: (voice: string) => {
        set((state) => ({
          ui: {
            ...state.ui,
            selectedVoice: voice,
          }
        }));
      },

      setTypewriterEnabled: (enabled: boolean) => {
        set((state) => ({
          ui: {
            ...state.ui,
            typewriterEnabled: enabled,
          }
        }));
      },

      setTypewriterSpeed: (speed: number) => {
        set((state) => ({
          ui: {
            ...state.ui,
            typewriterSpeed: speed,
          }
        }));
      },

      setMusicEnabled: (enabled: boolean) => {
        set((state) => ({
          ui: {
            ...state.ui,
            musicEnabled: enabled,
          }
        }));
      },

      setMusicVolume: (volume: number) => {
        set((state) => ({
          ui: {
            ...state.ui,
            musicVolume: volume,
          }
        }));
      },

      resetToDefaults: () => {
        set({ 
          llm: DEFAULT_LLM_SETTINGS,
          ui: DEFAULT_UI_SETTINGS
        });
      },

      getCurrentProviderInfo: () => {
        const { llm } = get();
        return LLMProviderFactory.getProviderInfo(llm.provider);
      },

      isConfigured: () => {
        const { llm } = get();
        return llm.apiKey.trim() !== '';
      },
    }),
    {
      name: 'azeroth-chronicles-settings',
      partialize: (state) => ({
        llm: state.llm, // Persist all LLM settings including API key
        ui: state.ui,   // Persist all UI/UX settings
      }),
    }
  )
);

// Utility hook for getting LLM settings in a format compatible with LLMManager
export const useLLMSettings = () => {
  const { llm } = useSettingsStore();
  return {
    provider: llm.provider,
    apiKey: llm.apiKey,
    model: llm.model,
    temperature: llm.temperature,
    maxTokens: llm.maxTokens,
    historyLength: llm.historyLength,
    contextDetail: llm.contextDetail,
  };
};