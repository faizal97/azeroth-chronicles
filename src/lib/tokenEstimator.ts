// Token estimation utility for cost awareness
export interface TokenEstimate {
  input: number;
  output: number;
  total: number;
  costTier: 'low' | 'medium' | 'high';
}

export interface EstimationParams {
  contextDetail: 'minimal' | 'standard' | 'rich';
  historyLength: number;
  maxTokens: number;
  gameContext?: {
    scenario: string;
    character: any;
    narrative_history: string[];
  };
  playerAction?: string;
}

// Rough token counting (4 characters ≈ 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Base prompt sizes by detail level
const PROMPT_SIZES = {
  minimal: 150,    // Simple prompt
  standard: 400,   // Full MASTER_PROMPT
  rich: 600       // Enhanced prompt with extra details
};

// Character context sizes by detail level
const CHARACTER_CONTEXT_SIZES = {
  minimal: 30,     // Basic info only
  standard: 80,    // Standard character info
  rich: 150       // Rich character descriptions
};

export function estimateTokenUsage(params: EstimationParams): TokenEstimate {
  const {
    contextDetail = 'standard',
    historyLength = 5,
    maxTokens = 1024,
    gameContext,
    playerAction = ''
  } = params;

  // Base prompt tokens
  let inputTokens = PROMPT_SIZES[contextDetail];
  
  // Character context tokens
  inputTokens += CHARACTER_CONTEXT_SIZES[contextDetail];
  
  // Scenario tokens (if provided)
  if (gameContext?.scenario) {
    inputTokens += estimateTokens(gameContext.scenario);
  } else {
    inputTokens += 50; // Estimated average scenario length
  }
  
  // History tokens
  if (gameContext?.narrative_history) {
    const recentHistory = gameContext.narrative_history.slice(-historyLength);
    const historyText = recentHistory.join('\n');
    inputTokens += estimateTokens(historyText);
  } else {
    // Estimate based on typical history length
    const avgHistoryPerItem = 100; // tokens per history item
    inputTokens += historyLength * avgHistoryPerItem;
  }
  
  // Player action tokens
  inputTokens += estimateTokens(playerAction);
  
  // Output tokens (what we've set as max)
  const outputTokens = maxTokens;
  
  // Total tokens
  const totalTokens = inputTokens + outputTokens;
  
  // Determine cost tier based on total usage
  let costTier: 'low' | 'medium' | 'high';
  if (totalTokens < 800) {
    costTier = 'low';
  } else if (totalTokens < 1500) {
    costTier = 'medium';  
  } else {
    costTier = 'high';
  }

  return {
    input: inputTokens,
    output: outputTokens,
    total: totalTokens,
    costTier
  };
}

// Format token count for display
export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

// Get cost color based on tier
export function getCostColor(tier: 'low' | 'medium' | 'high'): string {
  switch (tier) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
  }
}

// Get cost description
export function getCostDescription(tier: 'low' | 'medium' | 'high'): string {
  switch (tier) {
    case 'low': return 'Budget-friendly';
    case 'medium': return 'Moderate cost';
    case 'high': return 'Premium cost';
  }
}