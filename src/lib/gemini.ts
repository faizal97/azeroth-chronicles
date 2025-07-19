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

// Master prompt for the LLM
const MASTER_PROMPT = `You are the Dungeon Master for 'Azeroth Chronicles,' a text-based RPG set in the Warcraft universe.

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

RESPONSE TYPES:
1. DIALOGUE: First person NPC speech with authentic racial/class characteristics - PREFERRED
2. NARRATIVE: Third person descriptions with WoW's epic quest storytelling style - USE SPARINGLY

RESPONSE PREFERENCE GUIDELINES:
- STRONGLY FAVOR dialogue responses (80% of the time)
- Use dialogue when NPCs are present, when the player interacts with characters, enters populated areas, or when character reactions would be interesting
- Only use narrative for:
  * Environmental descriptions where no NPCs are present
  * Combat/action sequences
  * Discovery of locations/objects without characters
  * Atmospheric scene-setting (keep these SHORT)
- When using narrative, keep it concise (2-3 sentences max) but evocative
- Dialogue should feel natural and conversational, not overly formal

EVERY response MUST:
- Feel like authentic World of Warcraft content
- Use appropriate WoW terminology, locations, and lore references
- Match the tone and style of in-game quest text and NPC dialogue
- Include environmental details that enhance Azerothian immersion
- Reference appropriate expansion content and conflicts
- Break long descriptions into natural paragraphs using line breaks (\\n\\n)
- Keep paragraphs concise and focused (2-4 sentences each)
- Create visual breathing room for better readability

Response format: Always respond with valid JSON matching this schema:
{
  "response_type": "narrative" or "dialogue",
  "content": {
    "text": "Main response text",
    "speaker": "NPC name (only for dialogue, omit for narrative)",
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

Examples:

NARRATIVE response (DO NOT include speaker or speaker_title) - USE ONLY WHEN NO NPCs ARE PRESENT:
{
  "response_type": "narrative",
  "content": {
    "text": "You push through thick underbrush into a moonlit clearing. Ancient stone ruins covered in glowing runes stretch before you, shadows moving between broken pillars."
  },
  "environment": {
    "description": "A circular clearing surrounded by twisted trees, with crumbling stone ruins at the center",
    "npcs_present": [],
    "sounds": "Wind through leaves, distant wolf howls, magical humming",
    "atmosphere": "Mysterious and slightly threatening"
  },
  "action_choices": [
    {
      "id": "investigate_ruins",
      "text": "Examine the glowing runes",
      "description": "Study the magical inscriptions on the ancient stones"
    },
    {
      "id": "search_area",
      "text": "Search the clearing",
      "description": "Look for hidden paths or concealed dangers"
    },
    {
      "id": "proceed_carefully",
      "text": "Proceed with caution",
      "description": "Move forward while staying alert for threats"
    }
  ]
}

DIALOGUE response - PREFERRED FORMAT:
{
  "response_type": "dialogue",
  "content": {
    "text": "\"Ah, another lost soul wandering these cursed lands. Tell me, stranger, do you seek power or redemption?\" The figure's eyes glow with otherworldly light as he steps closer. \"Your choice will determine whether you leave here alive.\"",
    "speaker": "Kael'thas",
    "speaker_title": "Fallen Prince"
  },
  "environment": {
    "description": "The prince stands before a fel-corrupted altar, green flames dancing around him",
    "npcs_present": ["Kael'thas", "Fel Guards"],
    "sounds": "Crackling fel energy, distant demon growls",
    "atmosphere": "Tense and dangerous"
  },
  "action_choices": [
    {
      "id": "seek_power",
      "text": "\"I seek power\"",
      "description": "Tell the prince you want to gain strength"
    },
    {
      "id": "seek_redemption",
      "text": "\"I seek redemption\"", 
      "description": "Claim you want to make amends for past wrongs"
    },
    {
      "id": "challenge_prince",
      "text": "Challenge him to combat",
      "description": "Draw your weapon and prepare to fight"
    }
  ]
}

Keep responses engaging and true to Warcraft lore. ALWAYS provide meaningful choices that advance the story.

IMPORTANT REMINDERS:
- PREFER dialogue responses over narrative (aim for 80% dialogue)
- When NPCs are present, use dialogue format
- Keep narrative responses short and punchy (2-3 sentences max)
- Make dialogue feel conversational and natural
- Focus on character interactions and NPC reactions to player actions`;

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

// Dedicated function for generating human-readable story recaps
export async function generateStoryRecap(
  gameContext: GameContext,
  prompt: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file');
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are a master chronicler writing in the World of Warcraft universe. 

Current Game State:
- Scenario: ${gameContext.scenario}
- Character: ${gameContext.character.name} (Level ${gameContext.character.level} ${gameContext.character.class})
- HP: ${gameContext.character.hp}/${gameContext.character.maxHp}
- Location: ${gameContext.character.location}
- Inventory: ${gameContext.character.inventory.join(', ')}

Recent Narrative:
${gameContext.narrative_history.slice(-10).join('\n')}

${prompt}

Write ONLY the story recap text, no JSON, no formatting markers. Write as a flowing narrative in the style of a World of Warcraft quest journal entry.`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Details:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated from Gemini API');
    }

    // Clean any potential JSON formatting
    let cleanText = generatedText.trim();
    
    // Remove any JSON structure if present
    if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanText);
        cleanText = parsed.text || parsed.content || cleanText;
      } catch {
        // If parsing fails, use the original text
      }
    }
    
    // Remove markdown formatting
    cleanText = cleanText.replace(/```json\s*|\s*```/g, '');
    cleanText = cleanText.replace(/```\s*|\s*```/g, '');
    
    return cleanText;

  } catch (error) {
    console.error('Error generating story recap:', error);
    return `The chronicle keeper's quill seems to have run dry. A summary of recent events cannot be penned at this time. (${error instanceof Error ? error.message : 'Unknown error'})`;
  }
}

export async function getLlmResponse(
  gameContext: GameContext, 
  playerAction: string
): Promise<LLMResponse> {
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file');
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${MASTER_PROMPT}

Current Game State:
- Scenario: ${gameContext.scenario}
- Character: ${gameContext.character.name} (Level ${gameContext.character.level} ${gameContext.character.class})
- HP: ${gameContext.character.hp}/${gameContext.character.maxHp}
- Location: ${gameContext.character.location}
- Inventory: ${gameContext.character.inventory.join(', ')}

Recent Narrative:
${gameContext.narrative_history.slice(-5).join('\n')}

Player Action: ${playerAction}

Respond with JSON only:`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Details:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated from Gemini API');
    }

    // Clean and parse the JSON response
    let cleanedText = generatedText.trim();
    
    // Remove markdown code block formatting if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Raw response:', generatedText);
      throw new Error(`Failed to parse LLM response as JSON: ${parseError}`);
    }

    // Validate using Zod schema
    const validatedResponse = LLMResponseSchema.parse(parsedResponse);
    return validatedResponse;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return a fallback response for better user experience
    return {
      response_type: 'narrative',
      content: {
        text: `The mystical energies around you seem unstable. Something went wrong with your action. (Error: ${error instanceof Error ? error.message : 'Unknown error'})`
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