import { entityDetectionLimiter, entityDescriptionLimiter } from './rateLimiter';

// Global flag to disable LLM enhancement when rate limited
let llmEnhancementDisabled = false;
let disabledUntil = 0;

export function disableLLMEnhancement(minutes: number = 10) {
  llmEnhancementDisabled = true;
  disabledUntil = Date.now() + minutes * 60 * 1000;
  console.log(`LLM enhancement disabled for ${minutes} minutes due to rate limits`);
}

export function isLLMEnhancementDisabled(): boolean {
  if (llmEnhancementDisabled && Date.now() >= disabledUntil) {
    llmEnhancementDisabled = false;
    console.log('LLM enhancement re-enabled');
  }
  return llmEnhancementDisabled;
}

export interface ContentEntity {
  text: string;
  type: 'person' | 'place' | 'thing';
  startIndex: number;
  endIndex: number;
  description?: string;
}

export interface EntityCache {
  [key: string]: {
    type: 'person' | 'place' | 'thing';
    description: string;
    timestamp: number;
  };
}

// In-memory cache for entity information
let entityCache: EntityCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Load cache from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem('azeroth-entity-cache');
    if (cached) {
      entityCache = JSON.parse(cached);
      // Clean expired entries
      const now = Date.now();
      Object.keys(entityCache).forEach(key => {
        if (now - entityCache[key].timestamp > CACHE_DURATION) {
          delete entityCache[key];
        }
      });
    }
  } catch (error) {
    console.warn('Failed to load entity cache:', error);
  }
}

// Save cache to localStorage
function saveCache() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('azeroth-entity-cache', JSON.stringify(entityCache));
    } catch (error) {
      console.warn('Failed to save entity cache:', error);
    }
  }
}

// LLM-powered entity detection and description with rate limiting
export async function detectContentEntitiesWithLLM(text: string, scenario?: string): Promise<ContentEntity[]> {
  return entityDetectionLimiter.addRequest(async () => {
    try {
      const response = await fetch('/api/entity-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          scenario: scenario || 'general'
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit exceeded for entity detection. Falling back to pattern matching.');
          throw new Error('Rate limit exceeded');
        }
        console.warn(`Entity detection API returned ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      // Handle error responses gracefully
      if (data.error) {
        console.warn('Entity detection API error:', data.error);
        return [];
      }
      
      return Array.isArray(data.entities) ? data.entities : [];
    } catch (error) {
      console.warn('LLM entity detection failed:', error);
      return [];
    }
  });
}

// Get entity description with caching
export async function getEntityDescription(entityText: string, entityType: 'person' | 'place' | 'thing', scenario?: string): Promise<string> {
  const cacheKey = `${entityText.toLowerCase()}-${entityType}`;
  
  // Check cache first
  if (entityCache[cacheKey]) {
    return entityCache[cacheKey].description;
  }

  return entityDescriptionLimiter.addRequest(async () => {
    try {
      const response = await fetch('/api/entity-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity: entityText,
          type: entityType,
          scenario: scenario || 'general'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get entity description');
      }

      const data = await response.json();
      const description = data.description || `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} in the Warcraft universe`;

      // Cache the result
      entityCache[cacheKey] = {
        type: entityType,
        description,
        timestamp: Date.now()
      };
      saveCache();

      return description;
    } catch (error) {
      console.error('Failed to get entity description:', error);
      return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} in the Warcraft universe`;
    }
  });
}

// Fallback pattern-based detection for offline or error cases
function detectEntitiesWithPatterns(text: string): ContentEntity[] {
  const entities: ContentEntity[] = [];
  const processedRanges = new Set<string>();

  // Helper function to check if range overlaps with existing entities
  const hasOverlap = (start: number, end: number): boolean => {
    const rangeKey = `${start}-${end}`;
    if (processedRanges.has(rangeKey)) return true;
    
    for (const entity of entities) {
      if ((start >= entity.startIndex && start < entity.endIndex) ||
          (end > entity.startIndex && end <= entity.endIndex) ||
          (start <= entity.startIndex && end >= entity.endIndex)) {
        return true;
      }
    }
    return false;
  };

  // Helper function to add entity if no overlap
  const addEntity = (match: string, start: number, type: 'person' | 'place' | 'thing'): void => {
    const end = start + match.length;
    if (!hasOverlap(start, end)) {
      entities.push({
        text: match,
        type,
        startIndex: start,
        endIndex: end
      });
      processedRanges.add(`${start}-${end}`);
    }
  };

  // Enhanced patterns for fallback detection
  const personPatterns = [
    // Titles with names
    /\b(King|Queen|Prince|Princess|Lord|Lady|Sir|Champion|Hero|Chieftain|Warchief|High\s+\w+|Arch\s+\w+)\s+[A-Z][a-z]+/gi,
    /\b(?:Captain|Commander|General|Admiral|Lieutenant|Sergeant|Corporal)\s+[A-Z][a-z]+/gi,
    
    // Common WoW character names
    /\b(Arthas|Jaina|Thrall|Sylvanas|Illidan|Malfurion|Tyrande|Uther|Varian|Anduin|Garrosh|Lich\s+King|Antonidas|Terenas)\b/gi,
    
    // Character patterns
    /\b[A-Z][a-z]+(?:'[a-z]+)?\s+(?:the\s+)?[A-Z][a-z]+(?:wing|blade|storm|fire|frost|shadow|light|born|bane|slayer|heart|soul|mind)/gi,
    
    // Classes and roles
    /\b(Paladin|Priest|Mage|Warrior|Hunter|Rogue|Warlock|Shaman|Druid|Death\s+Knight|Demon\s+Hunter|Monk|Evoker)\b/gi,
    
    // Organizations
    /\b(Silver\s+Hand|Knights?\s+of\s+the\s+Silver\s+Hand|Kirin\s+Tor|Horde|Alliance|Scourge|Burning\s+Legion)\b/gi
  ];

  const placePatterns = [
    // WoW locations
    /\b(Lordaeron|Stormwind|Orgrimmar|Ironforge|Darnassus|Undercity|Thunder\s+Bluff|Silvermoon|Exodar|Dalaran|Goldshire|Northrend|Kalimdor|Eastern\s+Kingdoms)\b/gi,
    
    // Place structures
    /\b(?:City|Town|Village|Fortress|Castle|Keep|Tower|Temple|Cathedral|Shrine|Sanctuary)\s+of\s+[A-Z][a-z]+/gi,
    /\b[A-Z][a-z]+(?:'[a-z]+)?\s+(?:City|Town|Village|Fortress|Castle|Keep|Tower|Temple|Cathedral|Shrine|Sanctuary|Bay|Harbor|Port|Isle|Island|Mountain|Peak|Valley|Forest|Woods|Swamp|Desert|Plains|Steppes|Tundra|Fjord)/gi
  ];

  const thingPatterns = [
    // Famous weapons/items
    /\b(Frostmourne|Ashbringer|Doomhammer|Gorehowl|Atiesh|Light|Shadow|Fel|Arcane|Nature)\b/gi,
    
    // Item patterns
    /\b(?:Sword|Blade|Axe|Mace|Staff|Wand|Bow|Crossbow|Dagger|Shield|Armor|Helm|Crown|Ring|Amulet|Cloak|Boots|Gloves)\s+of\s+[A-Z][a-z]+/gi,
    /\b[A-Z][a-z]+(?:'[a-z]+)?\s+(?:Sword|Blade|Axe|Mace|Staff|Wand|Bow|Crossbow|Dagger|Shield|Armor|Helm|Crown|Ring|Amulet|Cloak|Boots|Gloves)/gi
  ];

  // Apply patterns
  personPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      addEntity(match[0], match.index, 'person');
    }
  });

  placePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      addEntity(match[0], match.index, 'place');
    }
  });

  thingPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      addEntity(match[0], match.index, 'thing');
    }
  });

  return entities.sort((a, b) => a.startIndex - b.startIndex);
}

// Main detection function with LLM and fallback
export async function detectContentEntities(text: string, scenario?: string): Promise<ContentEntity[]> {
  // Skip LLM if disabled due to rate limits or text is too short
  if (isLLMEnhancementDisabled() || text.length < 10) {
    return detectEntitiesWithPatterns(text);
  }

  try {
    // Try LLM-powered detection first
    const llmEntities = await detectContentEntitiesWithLLM(text, scenario);
    if (llmEntities.length > 0) {
      return llmEntities;
    }
  } catch (error) {
    console.warn('LLM detection failed, falling back to patterns:', error);
    
    // If it's a rate limit error, disable LLM enhancement
    if (error instanceof Error && error.message.includes('429')) {
      disableLLMEnhancement(10);
    }
  }

  // Fallback to pattern-based detection
  return detectEntitiesWithPatterns(text);
}

// Enhanced content function - returns plain text without highlighting
export function enhanceContent(text: string, scenario?: string): { text: string; entities: ContentEntity[] } {
  // Just return the original text without any modification
  return { text, entities: [] };
}

// Clear cache function for admin use
export function clearEntityCache() {
  entityCache = {};
  if (typeof window !== 'undefined') {
    localStorage.removeItem('azeroth-entity-cache');
  }
}

// Add cache clearing and rate limit controls to console for testing
if (typeof window !== 'undefined') {
  const windowWithControls = window as { 
    clearEntityCache?: () => void;
    disableLLMEnhancement?: (minutes?: number) => void;
    enableLLMEnhancement?: () => void;
    isLLMDisabled?: () => boolean;
  };
  
  windowWithControls.clearEntityCache = clearEntityCache;
  windowWithControls.disableLLMEnhancement = disableLLMEnhancement;
  windowWithControls.enableLLMEnhancement = () => {
    llmEnhancementDisabled = false;
    disabledUntil = 0;
    console.log('LLM enhancement manually re-enabled');
  };
  windowWithControls.isLLMDisabled = isLLMEnhancementDisabled;
}