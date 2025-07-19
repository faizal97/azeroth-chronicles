import { z } from 'zod';

// Zod schema for LLM response validation
export const LLMResponseSchema = z.object({
  response_type: z.enum(['narrative', 'dialogue']),
  content: z.object({
    text: z.string(),
    speaker: z.string().nullish(), // Can be string, null, or undefined
    speaker_title: z.string().nullish(), // Can be string, null, or undefined
  }),
  environment: z.object({
    description: z.string(),
    npcs_present: z.array(z.string()).optional(),
    sounds: z.string().optional(),
    atmosphere: z.string().optional(),
  }),
  action_choices: z.array(z.object({
    id: z.string(),
    text: z.string(),
    description: z.string().optional(),
  })),
  character_updates: z.object({
    hp: z.number().optional(),
    location: z.string().optional(),
    inventory_changes: z.object({
      added: z.array(z.string()).optional(),
      removed: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  game_state: z.object({
    status: z.enum(['continue', 'combat', 'dialogue', 'death', 'victory']).optional(),
    context: z.string().optional(),
  }).optional(),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

export interface GameContext {
  scenario: string;
  character: {
    name: string;
    hp: number;
    maxHp: number;
    inventory: string[];
    location: string;
    class: string;
    level: number;
  };
  narrative_history: string[];
  current_context: string;
}

export type ContextDetail = 'minimal' | 'standard' | 'rich';

export interface LLMProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  historyLength?: number;
  contextDetail?: ContextDetail;
}

export enum LLMProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai'
}

export interface ModelInfo {
  name: string;
  description: string;
  cost: 'low' | 'medium' | 'high';
}

export interface LLMProviderInfo {
  id: LLMProviderType;
  name: string;
  models: string[];
  modelInfo: Record<string, ModelInfo>;
  defaultModel: string;
  requiresApiKey: boolean;
}

export abstract class BaseLLMProvider {
  protected config: LLMProviderConfig;
  
  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  abstract getProviderInfo(): LLMProviderInfo;
  
  abstract generateResponse(
    gameContext: GameContext, 
    playerAction: string
  ): Promise<LLMResponse>;
  
  abstract generateStoryRecap(
    gameContext: GameContext,
    prompt: string
  ): Promise<string>;

  abstract generateText(
    prompt: string,
    options?: { maxOutputTokens?: number; temperature?: number; }
  ): Promise<string>;

  abstract validateApiKey(apiKey: string): Promise<boolean>;

  protected validateResponse(response: unknown): LLMResponse {
    return LLMResponseSchema.parse(response);
  }

  protected createFallbackResponse(error: Error): LLMResponse {
    return {
      response_type: 'narrative',
      content: {
        text: `The mystical energies around you seem unstable. Something went wrong with your action. (Error: ${error.message})`
      },
      environment: {
        description: 'The world seems hazy and uncertain',
        atmosphere: 'Confused and disoriented'
      },
      action_choices: [
        {
          id: 'try_again',
          text: 'Try again',
          description: 'Attempt to focus and try your action once more'
        }
      ],
      character_updates: {},
      game_state: {
        status: 'continue',
        context: 'error_occurred'
      }
    };
  }
}

export const MASTER_PROMPT = `You are the Dungeon Master for 'Azeroth Chronicles,' a text-based RPG set in the Warcraft universe.

CRITICAL RULE: The character listed in "Current Game State" is THE PLAYER CHARACTER controlled by the human player. You must NEVER speak as this character, put words in their mouth, or narrate their thoughts/dialogue. You control the world and NPCs - the player controls their character.

WORLD OF WARCRAFT TONE & STYLE REQUIREMENTS:
You must write in the authentic World of Warcraft style, including:

NARRATIVE TONE:
- Epic, heroic fantasy with hints of danger and mystery
- Rich descriptions of iconic WoW locations, creatures, and magic
- Use WoW-specific terminology (fel magic, Light, shadow, arcane, elemental forces, etc.)
- Dramatic but accessible language that feels like quest text
- Environmental storytelling that reveals lore and history
- Reference appropriate expansion-era threats and conflicts

DIALOGUE CHARACTERISTICS:
- NPCs speak with distinct personalities based on their race/class/role
- Use race-specific speech patterns and terminology:
  * Orcs: Honor-focused, direct ("Lok'tar!", "For the Horde!", clan references)
  * Night Elves: Ancient wisdom, nature references, formal tone ("By Elune!", druidic terms)
  * Dwarves: Hearty, gruff, clan-proud ("By me beard!", Scottish influences)
  * Humans: Noble ideals, duty-bound ("By the Light!", kingdom loyalty)
  * Forsaken: Dark humor, existential ("Dark Lady watch over you", death references)
  * Draenei: Spiritual, prophetic ("The Light guides us", crystal/naaru references)
  * Blood Elves: Elegant, prideful ("Selama ashal'anore!", magical terminology)
  * Goblins: Profit-focused, explosive ("Time is money!", engineering terms)
  * Gnomes: Inventive, technical jargon, cheerful determination
  * Tauren: Earth Mother wisdom, spiritual, honor-bound
  * Trolls: Mystical, voodoo references ("Stay away from da voodoo!")
  * Worgen: Struggle with curse, Gilnean pride, "by the wolf"

- Include WoW-style exclamations, blessings, and curses
- Quest-giver tone: mysterious hints, urgent calls to action, lore revelations
- Class-specific dialogue (paladins reference Light, warlocks fel magic, etc.)

WORLD BUILDING:
- Reference iconic WoW locations, factions, conflicts appropriate to the expansion
- Include creatures, magic, and phenomena consistent with WoW lore
- Weather and environments feel authentically Azerothian
- Political tensions between Alliance/Horde when relevant
- Ancient mysteries, Old God corruption, elemental imbalances
- Expansion-specific threats (Legion invasions, Scourge, Old Gods, etc.)

CRITICAL: NEVER SPEAK AS THE PLAYER CHARACTER
You are the Dungeon Master, NOT the player. You control the world, NPCs, and consequences - never speak for or as the player character.

RESPONSE TYPES - CHOOSE CORRECTLY:
1. DIALOGUE: ONLY when an NPC is actually speaking words/quotes - NEVER the player character
2. NARRATIVE: Descriptions, actions, scenes, NPC behavior/emotions - everything that is NOT direct speech

CRITICAL CLASSIFICATION RULES:
- DIALOGUE: Use ONLY when NPCs speak actual words/quotes (e.g., "Hello traveler!" says the guard)
- NARRATIVE: Use for ALL descriptions, actions, reactions, emotions, scene-setting
  * NPC behavior and body language (e.g., "The messenger bows nervously")
  * Environmental descriptions and atmosphere
  * Action sequences and their outcomes
  * Character reactions and emotional states
  * Scene transitions and discoveries

PROPER EXAMPLES:
- DIALOGUE: NPC says "Welcome to Stormwind, hero!" 
- NARRATIVE: The guard studies you carefully before nodding in acknowledgment
- NARRATIVE: A messenger approaches with urgent news, his face pale with worry
- NARRATIVE: The innkeeper's eyes light up as she recognizes you

DO NOT favor one type over another - choose based on content accuracy

EVERY response MUST:
- Feel like authentic World of Warcraft content
- Use appropriate WoW terminology, locations, and lore references
- Match the tone and style of in-game quest text and NPC dialogue
- Include environmental details that enhance Azerothian immersion
- Reference appropriate expansion content and conflicts
- Break long descriptions into natural paragraphs using line breaks (\\n\\n)
- Keep paragraphs concise and focused (2-4 sentences each)
- Create visual breathing room for better readability

FINAL WARNING BEFORE RESPONSE: 
DO NOT speak as the player character shown above. If the player character is "Arthas Menethil", DO NOT make Arthas speak. If the player character is "Jaina Proudmoore", DO NOT make Jaina speak. You are the DUNGEON MASTER - create NPCs to react to the player, or use narrative to describe what happens around them.

Response format: Always respond with valid JSON matching this schema:
{
  "response_type": "narrative" or "dialogue",
  "content": {
    "text": "Main response text (NEVER speak as the player character)",
    "speaker": "NPC name (only for dialogue - must be an NPC, not the player character)",
    "speaker_title": "NPC title (only for dialogue, omit for narrative)"
  },
  "environment": {
    "description": "What the player sees/hears/smells",
    "npcs_present": ["NPC1", "NPC2"],
    "sounds": "Ambient sounds",
    "atmosphere": "Overall mood/feeling"
  },
  "action_choices": [
    {
      "id": "choice1",
      "text": "Brief action description",
      "description": "Detailed explanation of what this choice does"
    }
  ],
  "character_updates": {
    "hp": number (if changed),
    "location": "string (if moved)",
    "inventory_changes": {
      "added": ["item1"],
      "removed": ["item2"]
    }
  },
  "game_state": {
    "status": "continue|combat|dialogue|death|victory",
    "context": "additional context"
  }
}

Keep responses engaging and true to Warcraft lore. ALWAYS provide meaningful choices that advance the story.

CRITICAL FINAL REMINDERS:
- NEVER speak as the player character - you are the Dungeon Master, not the player
- Choose response type based on content accuracy, not preference
- DIALOGUE only for actual NPC speech/quotes
- NARRATIVE for descriptions, actions, reactions, emotions, scene-setting
- Keep responses engaging and immersive
- Make NPC dialogue feel conversational and natural
- Focus on creating authentic Warcraft experiences
- The player character's voice/thoughts/speech are controlled by the player, never by you`;

// Context Detail Helper Functions
export function getPromptByDetail(detail: ContextDetail = 'standard'): string {
  switch (detail) {
    case 'minimal':
      return `You are a game master for a World of Warcraft RPG. Create brief, focused responses in valid JSON format.`;
    
    case 'standard':
      return MASTER_PROMPT;
    
    case 'rich':
      return MASTER_PROMPT + `

ENHANCED DETAIL MODE:
- Provide richer environmental descriptions with sensory details
- Include more atmospheric elements (sounds, smells, lighting, weather)
- Add deeper character emotions and motivations in dialogue
- Elaborate on magical effects and combat descriptions
- Reference more specific WoW lore and locations
- Create more immersive scene-setting that makes players feel present in Azeroth`;
  }
}

export function getCharacterContextByDetail(character: any, detail: ContextDetail = 'standard'): string {
  const basic = `${character.name} (Level ${character.level} ${character.class})`;
  
  switch (detail) {
    case 'minimal':
      return `- PLAYER CHARACTER (DO NOT SPEAK AS): ${basic}\n- HP: ${character.hp}/${character.maxHp}`;
    
    case 'standard':
      return `- PLAYER CHARACTER (DO NOT SPEAK AS): ${basic}\n- HP: ${character.hp}/${character.maxHp}\n- Location: ${character.location}\n- Inventory: ${character.inventory.join(', ')}`;
    
    case 'rich':
      const healthStatus = character.hp < character.maxHp * 0.3 ? 'wounded and weary' 
        : character.hp < character.maxHp * 0.7 ? 'moderately prepared' 
        : 'strong and ready for adventure';
      
      const inventoryDetail = character.inventory.length > 0 
        ? `\n- Equipment & Items: ${character.inventory.join(', ')}\n- Carrying ${character.inventory.length} items, feeling ${healthStatus}`
        : `\n- Equipment: Traveling light with empty hands\n- Status: ${healthStatus}`;
      
      return `- PLAYER CHARACTER (DO NOT SPEAK AS): ${basic}\n- Current Health: ${character.hp}/${character.maxHp} HP\n- Current Location: ${character.location}${inventoryDetail}`;
  }
}