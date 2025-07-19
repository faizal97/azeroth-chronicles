import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameContext } from '@/lib/llm-providers';
import type { Scenario } from '@/components/ScenarioSelection';
import { useSettingsStore } from './useSettingsStore';

export interface GameState {
  character: {
    name: string;
    hp: number;
    maxHp: number;
    inventory: string[];
    location: string;
    class: string;
    level: number;
    abilities: string[];
    isCustom: boolean;
  };
  narrative: Array<{
    type: 'narrative' | 'dialogue' | 'action' | 'system';
    content: string;
    speaker?: string;
    speakerTitle?: string;
    timestamp?: number;
  }>;
  currentEnvironment: {
    description: string;
    npcsPresent: string[];
    sounds?: string;
    atmosphere?: string;
  } | null;
  currentResponse: {
    type: 'narrative' | 'dialogue' | 'action' | 'system';
    content: string;
    speaker?: string;
    speakerTitle?: string;
    timestamp?: number;
  } | null;
  actionChoices: Array<{
    id: string;
    text: string;
    description?: string;
  }>;
  storyRecap: {
    content: string;
    lastUpdated: number;
    turnCount: number;
  } | null;
  scenario: string;
  selectedScenario: Scenario | null;
  isLoading: boolean;
  isProcessing: boolean;
  gameStarted: boolean;
  scenarioSelected: boolean;
  characterSelected: boolean;
}

interface GameActions {
  addNarrative: (entry: {
    type: 'narrative' | 'dialogue' | 'action' | 'system';
    content: string;
    speaker?: string;
    speakerTitle?: string;
  }) => void;
  setCurrentResponse: (response: GameState['currentResponse']) => void;
  clearCurrentResponse: () => void;
  updateEnvironment: (environment: GameState['currentEnvironment']) => void;
  updateCharacterState: (updates: Partial<GameState['character']>) => void;
  setActionChoices: (choices: GameState['actionChoices']) => void;
  clearActionChoices: () => void;
  setLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  generateStoryRecap: () => Promise<void>;
  initializeGame: () => void;
  initializeWithScenario: (scenario: Scenario) => void;
  selectCharacter: (character: {
    name: string;
    class: string;
    hp: number;
    abilities: string[];
    isCustom: boolean;
  }) => void;
  takeTurn: (playerAction: string) => Promise<void>;
  resetGame: () => void;
  backToScenarioSelection: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  character: {
    name: 'Adventurer',
    hp: 100,
    maxHp: 100,
    inventory: ['Basic Sword', 'Leather Armor', 'Health Potion'],
    location: 'Eastern Kingdoms',
    class: 'Warrior',
    level: 1,
    abilities: [],
    isCustom: true,
  },
  narrative: [],
  currentEnvironment: null,
  currentResponse: null,
  actionChoices: [],
  storyRecap: null,
  scenario: '',
  selectedScenario: null,
  isLoading: false,
  isProcessing: false,
  gameStarted: false,
  scenarioSelected: false,
  characterSelected: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addNarrative: (entry: {
        type: 'narrative' | 'dialogue' | 'action' | 'system';
        content: string;
        speaker?: string;
        speakerTitle?: string;
      }) =>
        set((state) => ({
          narrative: [...state.narrative, {
            ...entry,
            timestamp: Date.now()
          }],
        })),

      setCurrentResponse: (response: GameState['currentResponse']) =>
        set({ currentResponse: response }),

      clearCurrentResponse: () =>
        set({ currentResponse: null }),

      updateEnvironment: (environment: GameState['currentEnvironment']) =>
        set({ currentEnvironment: environment }),

      updateCharacterState: (updates) =>
        set((state) => ({
          character: { ...state.character, ...updates },
        })),

      setActionChoices: (choices: GameState['actionChoices']) =>
        set({ actionChoices: choices }),

      clearActionChoices: () =>
        set({ actionChoices: [] }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setProcessing: (processing: boolean) =>
        set({ isProcessing: processing }),

      generateStoryRecap: async () => {
        const state = get();
        
        // Check if recap needs to be generated (every 5 turns or if none exists)
        const currentTurnCount = state.narrative.filter(entry => entry.type === 'action').length;
        const shouldGenerate = !state.storyRecap || 
          (currentTurnCount - state.storyRecap.turnCount >= 5);
        
        if (!shouldGenerate) return;
        
        // Don't generate if there's insufficient narrative (less than 2 actions)
        if (currentTurnCount < 2) return;
        
        try {
          set({ isLoading: true });
          
          // Prepare narrative history for recap generation
          const narrativeText = state.narrative
            .filter(entry => entry.content && entry.content.trim().length > 0)
            .map(entry => {
              if (entry.type === 'action') return `Player: ${entry.content}`;
              if (entry.type === 'dialogue' && entry.speaker) return `${entry.speaker}: "${entry.content}"`;
              return entry.content;
            })
            .join('\n');
          
          // Don't proceed if no valid narrative content
          if (!narrativeText.trim()) return;
          
          // Create a special context for recap generation
          const recapContext: GameContext = {
            scenario: state.scenario,
            character: state.character,
            narrative_history: [narrativeText],
            current_context: 'Generate story recap'
          };
          
          // Get LLM settings and prepare headers
          const llmSettings = useSettingsStore.getState().llm;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (llmSettings.provider && llmSettings.apiKey) {
            headers['x-llm-provider'] = llmSettings.provider;
            headers['x-llm-api-key'] = llmSettings.apiKey;
            if (llmSettings.model) {
              headers['x-llm-model'] = llmSettings.model;
            }
          }
          
          // Call story recap API endpoint instead of direct function
          const response = await fetch('/api/generate-story-recap', {
            method: 'POST',
            headers,
            body: JSON.stringify({ 
              gameContext: recapContext, 
              prompt: 'Create a concise story recap in the style of a World of Warcraft quest journal entry. Keep it to 2-3 short paragraphs using double line breaks (\\n\\n) between them. Focus on: key encounters/conflicts and current situation. Use epic fantasy language befitting Azeroth but keep it compact and engaging. Include the most important NPCs met, locations visited, and conflicts faced. Write as if this were a brief entry in the hero\'s personal chronicle - memorable but not overly detailed.'
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Story recap API error: ${response.status}`);
          }
          
          const data = await response.json();
          const recapText = data.recap || data.content || 'Story recap unavailable';
          
          set({
            storyRecap: {
              content: recapText,
              lastUpdated: Date.now(),
              turnCount: currentTurnCount
            },
            isLoading: false
          });
          
        } catch (error) {
          console.error('Error generating story recap:', error);
          // Set a fallback recap if generation fails
          set({ 
            storyRecap: {
              content: `The chronicler's quill runs dry as mystical energies interfere with the telling of recent deeds. The hero's tale continues, though some chapters remain unwritten...`,
              lastUpdated: Date.now(),
              turnCount: currentTurnCount
            },
            isLoading: false 
          });
        }
      },

      initializeGame: () =>
        set(() => ({
          ...initialState,
          gameStarted: true,
        })),

      initializeWithScenario: (scenario: Scenario) => {
        set(() => ({
          selectedScenario: scenario,
          scenario: scenario.title,
          isLoading: false,
          gameStarted: false,
          scenarioSelected: true,
          characterSelected: false,
        }));
      },

      selectCharacter: (character: {
        name: string;
        class: string;
        hp: number;
        abilities: string[];
        isCustom: boolean;
      }) => {
        const state = get();
        const scenario = state.selectedScenario;
        
        if (!scenario) return;

        // Character-specific narratives for legendary characters
        const characterSpecificNarratives: Record<string, Record<string, string[]>> = {
          'third-war': {
            'Arthas Menethil': [
              'You are Arthas Menethil, Crown Prince of Lordaeron and a paladin of the Silver Hand.',
              'The plague of undeath spreads through your kingdom. You stand in the throne room of Lordaeron\'s palace, where polished marble reflects the worried faces of nobles.',
              'Your father King Terenas discusses urgent reports with his advisors. To your left, a messenger in travel-stained clothes waits with news from the northern villages. The court mage Antonidas has requested your presence in his chambers.',
              'What do you do? Approach the messenger, join your father\'s council, or visit Antonidas?'
            ],
            'Jaina Proudmoore': [
              'You are Jaina Proudmoore, a brilliant young sorceress and student of Dalaran.',
              'You stand in your study at the Violet Citadel, arcane crystals humming with power around you. Through the window, you see smoke rising from distant villages.',
              'A magical sending from Prince Arthas glows on your desk, requesting aid investigating the plague. Your mentor Antonidas has summoned the Kirin Tor to an emergency meeting. Outside your door, a breathless scout reports orc sightings near the city.',
              'Will you answer Arthas\'s call, attend the Kirin Tor meeting, or investigate the orc sightings?'
            ],
            'Thrall': [
              'You are Thrall, Warchief of the new Horde and former slave turned liberator.',
              'You stand in your command tent in the Barrens, the dry wind carrying the scent of dust and freedom. Maps of this strange continent cover your war table.',
              'The mysterious prophet\'s words echo in your mind about sailing west. Your advisor Nazgrel reports human settlements to the east. A shaman elder speaks of disturbing visions from the spirits.',
              'Do you prepare ships to sail west, send scouts to observe the humans, or consult with the shaman about the visions?'
            ],
            'Tyrande Whisperwind': [
              'You are Tyrande Whisperwind, High Priestess of Elune and leader of the night elf resistance.',
              'You kneel in the Temple of Elune in Darnassus, moonlight streaming through ancient branches. The sacred waters ripple with ominous portents.',
              'A sentinel captain reports strange green fires in Ashenvale. Your hippogryph scouts have spotted outlanders - both orcs and humans - in your forests. Malfurion stirs in the Emerald Dream, nearly ready to wake.',
              'Will you lead your sentinels to investigate the green fires, confront the outlanders, or perform the ritual to wake Malfurion?'
            ]
          },
          'vanilla-classic': {
            'Varian Wrynn': [
              'You are King Varian Wrynn, rightful ruler of Stormwind, recently returned from captivity.',
              'You sit on your throne in Stormwind Keep, the rebuilt spires gleaming through tall windows. The sound of hammers echoes from the Trade District as the city continues its reconstruction.',
              'Marshal Windsor stands at attention with reports of gnoll activity in Elwynn Forest. Lady Katrana Prestor whispers urgently about political matters in your ear. A dwarf ambassador waits to discuss trade agreements.',
              'Do you address the gnoll threat, listen to Prestor\'s counsel, or meet with the dwarf ambassador?'
            ],
            'Sylvanas Windrunner': [
              'You are Sylvanas Windrunner, the Banshee Queen and leader of the Forsaken.',
              'You stand atop the towers of the Undercity, overlooking the sewers turned stronghold beneath Lordaeron\'s ruins. The green glow of plague cauldrons illuminates your pale features.',
              'Varimathras reports Scourge movements in the Plaguelands. Your Royal Apothecary Society requests approval for new plague experiments. A message from Thrall arrives, seeking continued Horde cooperation.',
              'Will you send forces against the Scourge, oversee the plague research, or respond to Thrall\'s message?'
            ],
            'Cairne Bloodhoof': [
              'You are Cairne Bloodhoof, High Chieftain of the tauren and wise elder of the Horde.',
              'You stand on Elder Rise in Thunder Bluff, the wind whispering through the totems while the golden plains of Mulgore stretch endlessly below.',
              'A young brave reports centaur raids on the southern borders. A shaman brings disturbing dreams from the spirits about growing darkness. A messenger from Orgrimmar seeks your wisdom on Horde matters.',
              'Do you organize a defense against the centaurs, investigate the spiritual warnings, or travel to counsel Thrall?'
            ]
          },
          'burning-crusade': {
            'Illidan Stormrage': [
              'You are Illidan Stormrage, the Betrayer, Lord of Outland and master of the Black Temple.',
              'You stand in the highest chamber of the Black Temple, fel energies crackling around your form. Through the massive window, the twisted spires of Shadowmoon Valley stretch toward a burning sky.',
              'Your lieutenant Akama reports unrest among the Ashtongue. Lady Vashj sends word that heroes from Azeroth have breached Serpentshrine Cavern. Prince Kael\'thas requests an audience about his research.',
              'Do you address Akama\'s concerns, rush to aid Vashj, or meet with Kael\'thas about his discoveries?'
            ],
            'Kael\'thas Sunstrider': [
              'You are Prince Kael\'thas Sunstrider, last of the Sunstrider dynasty and leader of the blood elves.',
              'You pace within your sanctum at Tempest Keep, arcane energies swirling around crystalline formations. The screams of your addicted people echo in your mind.',
              'Your magisters report successful experiments with naaru energy. A message from Illidan summons you to the Black Temple. Reports arrive of Alliance and Horde forces approaching Netherstorm.',
              'Will you continue the naaru experiments, answer Illidan\'s summons, or prepare defenses against the approaching forces?'
            ],
            'Lady Vashj': [
              'You are Lady Vashj, once a night elf noble, now a powerful naga sea witch.',
              'You coil within the depths of Serpentshrine Cavern, bioluminescent waters casting eerie patterns on the coral walls. The pressure of the deep soothes your ancient form.',
              'Your tidecallers report intruders breaching the outer chambers. Scouts bring word that the Sha\'tar are marshaling forces in Shattrath. A magical sending from Illidan requests a status report.',
              'Do you personally hunt the intruders, strike at the Sha\'tar forces, or report to Illidan immediately?'
            ]
          },
          'wrath': {
            'Arthas Menethil': [
              'You are Arthas Menethil, the Lich King, master of the undead Scourge.',
              'You sit motionless upon the Frozen Throne atop Icecrown Citadel, ice and shadow radiating from your armored form. The winds of Northrend howl through the spire, carrying the whispers of the dead.',
              'Your death knight lieutenants report champions gathering at the Argent Tournament. The Lich King\'s voice in your mind urges you to crush this resistance. Sindragosa circles the citadel, awaiting your command.',
              'Do you send death knights to eliminate the champions, command Sindragosa to attack the tournament, or draw the heroes deeper into your trap?'
            ],
            'Jaina Proudmoore': [
              'You are Jaina Proudmoore, leader of the Kirin Tor and one of the most powerful mages alive.',
              'You stand in your study in Dalaran, the floating city now positioned above Northrend\'s frozen wastes. Arcane energies hum through crystalline formations while snow swirls past your windows.',
              'Rhonin reports successful evacuations from Naxxramas\'s path. A messenger from the Argent Crusade requests magical support for their offensive. Your scrying bowl shows disturbing visions of Arthas on his throne.',
              'Will you aid the evacuation efforts, support the Argent Crusade, or investigate the visions of Arthas?'
            ],
            'Tirion Fordring': [
              'You are Tirion Fordring, Highlord of the Argent Crusade and bearer of Ashbringer.',
              'You kneel in prayer at Light\'s Hope Chapel, Ashbringer gleaming beside you as paladins and priests prepare for the final assault. The sound of sharpening weapons echoes through the sacred halls.',
              'Your scouts report increased Scourge activity around Icecrown. King Varian offers Alliance reinforcements for your crusade. Darion Mograine seeks guidance on leading the reformed death knights.',
              'Do you lead a reconnaissance mission to Icecrown, coordinate with the Alliance forces, or counsel Darion about redemption?'
            ]
          },
          'cataclysm': {
            'Deathwing': [
              'You are Deathwing the Destroyer, the mad Earth-Warder who has shattered the world.',
              'You perch atop the spires of your volcanic lair in Deepholm, molten elementium plates barely containing your massive form. The whispers of the Old Gods echo through the caverns, urging greater destruction.',
              'Your twilight cultists report resistance forming in both Stormwind and Orgrimmar. The Dragon Soul has been discovered by mortal heroes. Your lieutenant Cho\'gall brings news of setbacks in the Twilight Highlands.',
              'Do you personally hunt the heroes seeking the Dragon Soul, empower more twilight drakes, or unleash another cataclysmic assault on the world?'
            ],
            'Thrall': [
              'You are Thrall, former Warchief turned World-Shaman, seeking to heal the broken world.',
              'You stand in the Maelstrom\'s heart, wind and lightning swirling around you as you commune with the wounded elements. The very air crackles with chaotic energies that tear at your spirit.',
              'The Earth Mother whispers of Deathwing\'s next target. Aggra brings word that your shamanic knowledge is needed to forge the Dragon Soul. Reports arrive that Garrosh struggles to maintain Horde unity.',
              'Will you pursue Deathwing\'s trail, aid in reforging the Dragon Soul, or return to counsel Garrosh?'
            ],
            'Malfurion Stormrage': [
              'You are Malfurion Stormrage, first of the druids and guardian of the natural world.',
              'You stand in the Stormrage Barrow Dens, surrounded by ancient roots that tremble with the world\'s pain. Through the Emerald Dream, you sense every wound Deathwing has torn in Azeroth.',
              'Hamuul Runetotem reports widespread corruption in Felwood spreading faster than before. Tyrande sends word that Mount Hyjal burns once again. The Emerald Dream itself shows signs of Nightmare influence.',
              'Do you cleanse the corruption in Felwood, rush to defend Hyjal, or investigate the Nightmare\'s return?'
            ]
          },
          'pandaria': {
            'Chen Stormstout': [
              'You are Chen Stormstout, legendary pandaren brewmaster and wandering adventurer.',
              'You sit cross-legged in the Wandering Isle\'s training grounds, watching young pandaren practice their forms. The morning mist carries the scent of brewing tea and distant shores.',
              'A messenger brings word that the mists around Pandaria have finally parted. Your nephew Li Li begs to join you on an expedition to the mainland. Elders request your counsel on whether to welcome outsiders.',
              'Do you sail immediately to explore Pandaria, take Li Li under your wing, or first seek the elders\' wisdom?'
            ],
            'Garrosh Hellscream': [
              'You are Garrosh Hellscream, Warchief of the Horde and son of Grom Hellscream.',
              'You stand in your war room in Orgrimmar, maps of the newly discovered Pandaria spread across the table. The scent of weapon oil fills the air as your warriors prepare for deployment.',
              'General Nazgrim reports Alliance forces already moving toward Pandaria. Malkorok suggests mining operations in the mysterious continent. Your advisors warn of unknown magical defenses.',
              'Do you launch an immediate military expedition, send advance scouts, or focus on strengthening your war machine first?'
            ],
            'Anduin Wrynn': [
              'You are Prince Anduin Wrynn, heir to Stormwind and student of diplomacy.',
              'You stand in Stormwind\'s library, ancient texts about the lost pandaren empire spread before you. Sunlight streams through stained glass, illuminating passages about inner peace and harmony.',
              'Your father plans a military expedition to Pandaria to counter Horde expansion. Prophet Velen offers to teach you more about spiritual guidance. A messenger reports that Admiral Taylor requests a diplomatic envoy.',
              'Will you convince your father to pursue diplomacy, study further with Velen, or join Taylor\'s mission as a peace ambassador?'
            ]
          }
        };

        const getCharacterNarrative = () => {
          if (character.isCustom) {
            // Action-oriented narratives for custom characters
            const customNarratives: Record<string, string[]> = {
              'third-war': [
                `You are ${character.name}, a ${character.class} during the Third War.`,
                'You stand in the village square of Goldshire, where panicked refugees flee northward with tales of demonic invasions. The inn keeper shouts urgent news while smoke rises from distant forests.',
                'A mounted knight calls for volunteers to defend nearby farms. Local guards discuss reports of undead sightings. A mysterious hooded figure beckons you toward the shadowed alley.',
                'What do you do? Join the knight\'s defense mission, investigate the undead reports, or follow the mysterious figure?'
              ],
              'vanilla-classic': [
                `You are ${character.name}, a ${character.class} beginning your heroic journey.`,
                'You kneel in the peaceful chapel of Northshire Abbey, where morning light streams through stained glass windows. Brother Sammuel prepares to send you on your first mission.',
                'A young page brings news of kobold raids in the nearby mines. Outside, you hear horses approaching with what sounds like urgent dispatches. The quartermaster waves you over to inspect some unusual equipment.',
                'Will you investigate the kobold threat, check on the arriving messengers, or examine the quartermaster\'s mysterious gear?'
              ],
              'burning-crusade': [
                `You are ${character.name}, a ${character.class} who has journeyed to Outland.`,
                'You emerge from the Dark Portal onto the scorched red soil of Hellfire Peninsula, where the air shimmers with fel energy. Expedition camps sprawl before you under an alien sky.',
                'A commander shouts orders about demonic incursions to the west. Scouts report strange energy readings from nearby fel geysers. A draenei survivor limps toward the camp, clutching ancient artifacts.',
                'Do you report to the commander for combat duty, investigate the fel energy anomalies, or aid the wounded draenei survivor?'
              ],
              'wrath': [
                `You are ${character.name}, a ${character.class} who has come to Northrend.`,
                'You step off the ship onto the frozen docks of Borean Tundra, where your breath forms clouds in the bitter cold. Argent Crusade banners snap in the wind above hastily built fortifications.',
                'A paladin captain organizes patrols against nearby Scourge forces. Engineers work frantically to establish a beachhead before the next undead assault. A captured nerubian spy awaits interrogation.',
                'What\'s your first move? Join the anti-Scourge patrols, assist with fortification efforts, or question the nerubian prisoner?'
              ],
              'cataclysm': [
                `You are ${character.name}, a ${character.class} in a world transformed by catastrophe.`,
                'You stand in the rebuilt Trade District of Stormwind, where workers repair Deathwing\'s damage while earth tremors still shake the foundations. Citizens look skyward nervously.',
                'A Twilight cultist prisoner is being escorted to the Stockade for questioning. Earthquake victims need rescue from a partially collapsed building. A dragon expert calls for heroes to investigate strange elemental disturbances.',
                'How do you respond? Interrogate the cultist, rescue trapped civilians, or investigate the elemental anomalies?'
              ],
              'pandaria': [
                `You are ${character.name}, a ${character.class} who has discovered the hidden continent.`,
                'You stand on a mist-shrouded path in the Jade Forest, where ancient trees tower overhead and strange wildlife watches from the undergrowth. Pandaren voices echo from a nearby village.',
                'Local pandaren discuss territorial disputes with aggressive hozen tribes. A wounded Alliance scout stumbles from the forest with reports of Horde forces landing nearby. Ancient jinyu fishermen speak of dark sha energy corrupting the waters.',
                'What draws your attention? The hozen conflict, the enemy faction\'s movements, or the mysterious sha corruption?'
              ],
              'warlords-draenor': [
                `You are ${character.name}, a ${character.class} who has traveled through time itself.`,
                'You materialize in the twilight realm of Shadowmoon Valley, where crystalline spires pierce a star-filled sky. The draenei settlement of Karabor gleams in the distance.',
                'Vindicator Maraad coordinates defenses against Iron Horde raiders closing in from the east. Prophet Velen meditates before the Dark Star, seeking visions of this timeline\'s future. Wounded refugees flee burning villages.',
                'Where do you make your stand? With Maraad\'s military forces, seeking Velen\'s prophetic guidance, or helping evacuate the refugees?'
              ],
              'legion': [
                `You are ${character.name}, a ${character.class} facing the Legion\'s final invasion.`,
                'You stand on the floating spires of Dalaran as it hovers above the Broken Isles, fel-green portals tearing open across the horizon. Artifact weapons pulse with ancient power in your hands.',
                'Khadgar coordinates multi-front battles against massive demon invasions. Class trainers offer to unlock your artifact\'s hidden potential. Desperate calls for aid come from the Broken Shore where heroes are falling.',
                'What\'s your priority? Join Khadgar\'s strategic planning, focus on artifact mastery, or rush to reinforce the failing Broken Shore?'
              ],
              'battle-azeroth': [
                `You are ${character.name}, a ${character.class} caught in the renewed faction war.`,
                'You stand on the harbor docks of Boralus, where Kul Tiran ships prepare for war while azerite ore glows ominously in shipping containers. The sound of cannons echoes from naval battles offshore.',
                'Admiral Proudmoore briefs captains on Horde naval movements near Drustvar. Azerite researchers warn of dangerous weapon experiments. Local tidesages report disturbing visions from the sea itself.',
                'Where do you lend your expertise? Naval intelligence gathering, azerite research oversight, or investigating the tidesages\' oceanic omens?'
              ],
              'shadowlands': [
                `You are ${character.name}, a ${character.class} who has journeyed beyond death.`,
                'You awaken in the gray wasteland of the Maw, where tortured souls wander endlessly under a sunless sky. The Jailer\'s tower looms impossibly tall in the distance.',
                'A dying soul whispers about secret paths to other realms. Ve\'nari, a mysterious broker, offers forbidden knowledge in exchange for service. Mawsworn patrols march nearby, hunting escaped souls.',
                'How do you begin your escape? Follow the dying soul\'s directions, bargain with the enigmatic Ve\'nari, or evade the Mawsworn to find your own path?'
              ],
              'dragonflight': [
                `You are ${character.name}, a ${character.class} witnessing the dragons\' return.`,
                'You stand on the volcanic shores of the Waking Shores, where ancient dragon roosts carved into cliffsides show signs of recent awakening. Draconic magic crackles through the air.',
                'Alexstrasza calls for mortal champions to aid in reclaiming the Dragon Isles. Wrathion investigates black dragonflight corruption that predates his father. Primalist forces attack the ruby dragonshrine.',
                'Where do you offer your service? Alexstrasza\'s restoration efforts, Wrathion\'s corruption investigation, or defending against the primalist assault?'
              ],
              'war-within': [
                `You are ${character.name}, a ${character.class} venturing into Azeroth\'s depths.`,
                'You descend through crystalline caverns into Khaz Algar, where earthen machinery hums with world-soul energy. Void whispers echo from deeper tunnels while Titan constructs stand sentinel.',
                'Machine Speaker Brinthe reports critical malfunctions in the world-soul\'s protective systems. Void-touched nerubians emerge from collapsed tunnels. Ancient earthen awakening protocols await activation.',
                'What demands immediate attention? Repairing the failing protective systems, confronting the void corruption, or awakening the slumbering earthen guardians?'
              ]
            };
            return customNarratives[scenario.id] || [`Your adventure as ${character.name} begins...`];
          } else {
            // Character-specific narrative for legendary characters
            const scenarioCharacters = characterSpecificNarratives[scenario.id];
            if (scenarioCharacters && scenarioCharacters[character.name]) {
              return scenarioCharacters[character.name];
            }
            // Fallback for characters not in this scenario
            return [
              `You are ${character.name}, ${character.class}, brought to this time and place by mysterious forces.`,
              `Though this is not your era, your legendary power remains undimmed.`,
              `You stand in ${scenario.startingLocation}, ready to shape destiny once again.`,
              `Your presence here may change the course of history itself.`
            ];
          }
        };

        const narrativeArray = getCharacterNarrative();
        const formattedNarrative = narrativeArray.map((text, index) => ({
          type: 'narrative' as const,
          content: text,
          timestamp: Date.now() + index
        }));

        // Create the initial current response from the narrative
        const initialResponse = {
          type: 'narrative' as const,
          content: narrativeArray.join('\n\n'),
          timestamp: Date.now()
        };

        set(() => ({
          character: {
            name: character.name,
            hp: character.hp,
            maxHp: character.hp,
            inventory: [...scenario.startingInventory],
            location: scenario.startingLocation,
            class: character.class,
            level: 1,
            abilities: character.abilities,
            isCustom: character.isCustom,
          },
          narrative: formattedNarrative,
          currentResponse: initialResponse,
          currentEnvironment: {
            description: scenario.startingLocation,
            npcsPresent: [],
            atmosphere: "The beginning of your adventure"
          },
          storyRecap: null, // Clear any existing story recap
          isLoading: false,
          gameStarted: true,
          characterSelected: true,
        }));
      },

      takeTurn: async (playerAction: string) => {
        const state = get();
        
        try {
          // Clear action choices when player takes turn
          state.clearActionChoices();
          
          // Step 1: Show player action and clear after short delay
          state.setCurrentResponse({
            type: 'action',
            content: playerAction,
            timestamp: Date.now()
          });
          
          // Add player action to permanent narrative
          state.addNarrative({
            type: 'action',
            content: playerAction
          });
          
          // Wait briefly to show the action
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Step 2: Clear and show processing
          state.clearCurrentResponse();
          state.setProcessing(true);
          
          // Prepare game context for LLM
          const narrativeHistory = state.narrative.map(entry => {
            if (entry.type === 'action') return `> ${entry.content}`;
            if (entry.type === 'dialogue') return `${entry.speaker}: "${entry.content}"`;
            return entry.content;
          });

          const gameContext: GameContext = {
            scenario: state.scenario,
            character: state.character,
            narrative_history: narrativeHistory,
            current_context: state.currentEnvironment?.description || 'Exploring the world'
          };
          
          // Get LLM settings and prepare headers
          const llmSettings = useSettingsStore.getState().llm;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (llmSettings.provider && llmSettings.apiKey) {
            headers['x-llm-provider'] = llmSettings.provider;
            headers['x-llm-api-key'] = llmSettings.apiKey;
            if (llmSettings.model) {
              headers['x-llm-model'] = llmSettings.model;
            }
          }
          
          // Call SSE API for streaming response
          const response = await fetch('/api/game-response', {
            method: 'POST',
            headers,
            body: JSON.stringify({ gameContext, playerAction }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response stream available');
          }

          const decoder = new TextDecoder();
          let streamedText = '';
          // eslint-disable-next-line prefer-const
          let streamingResponse = {
            type: 'narrative' as 'narrative' | 'dialogue',
            content: '',
            speaker: undefined as string | undefined,
            speakerTitle: undefined as string | undefined,
            timestamp: Date.now()
          };

          // Handle streaming response
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  switch (data.type) {
                    case 'processing':
                      // Keep processing state
                      break;
                      
                    case 'text_chunk':
                      streamedText += data.text;
                      streamingResponse.content = streamedText;
                      state.setCurrentResponse({ ...streamingResponse });
                      break;
                      
                    case 'metadata':
                      streamingResponse.type = data.data.response_type;
                      streamingResponse.speaker = data.data.speaker;
                      streamingResponse.speakerTitle = data.data.speaker_title;
                      state.setCurrentResponse({ ...streamingResponse });
                      break;
                      
                    case 'environment':
                      state.updateEnvironment({
                        description: data.data.description,
                        npcsPresent: data.data.npcs_present || [],
                        sounds: data.data.sounds,
                        atmosphere: data.data.atmosphere
                      });
                      break;
                      
                    case 'action_choices':
                      state.setActionChoices(data.data);
                      break;
                      
                    case 'character_updates':
                      if (data.data) {
                        const updates: Partial<GameState['character']> = {};
                        
                        if (data.data.hp !== undefined) {
                          updates.hp = data.data.hp;
                        }
                        
                        if (data.data.location) {
                          updates.location = data.data.location;
                        }
                        
                        if (data.data.inventory_changes) {
                          const currentInventory = [...state.character.inventory];
                          
                          // Remove items
                          if (data.data.inventory_changes.removed) {
                            data.data.inventory_changes.removed.forEach((item: string) => {
                              const index = currentInventory.indexOf(item);
                              if (index > -1) {
                                currentInventory.splice(index, 1);
                              }
                            });
                          }
                          
                          // Add items
                          if (data.data.inventory_changes.added) {
                            currentInventory.push(...data.data.inventory_changes.added);
                          }
                          
                          updates.inventory = currentInventory;
                        }
                        
                        if (Object.keys(updates).length > 0) {
                          state.updateCharacterState(updates);
                        }
                      }
                      break;
                      
                    case 'complete':
                      // Add final response to permanent narrative
                      state.addNarrative({
                        type: streamingResponse.type,
                        content: streamingResponse.content,
                        speaker: streamingResponse.speaker,
                        speakerTitle: streamingResponse.speakerTitle
                      });
                      
                      state.setProcessing(false);
                      
                      // Auto-generate story recap if needed
                      setTimeout(() => {
                        state.generateStoryRecap();
                      }, 1000);
                      break;
                      
                    case 'error':
                      console.error('SSE Error:', data.message);
                      state.setProcessing(false);
                      state.setCurrentResponse({
                        type: 'system',
                        content: `Something went wrong: ${data.message}`,
                        timestamp: Date.now()
                      });
                      break;
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
          
        } catch (error) {
          console.error('Error taking turn:', error);
          state.setProcessing(false);
          state.setCurrentResponse({
            type: 'system',
            content: 'Something went wrong. Please try again.',
            timestamp: Date.now()
          });
        }
      },


      resetGame: () => {
        // Clear all caches and reset game state
        if (typeof window !== 'undefined') {
          // Clear localStorage cache
          localStorage.removeItem('azeroth-game-storage');
        }
        // Reset to initial state including clearing story recap
        set({ 
          ...initialState, 
          gameStarted: false, 
          scenarioSelected: false, 
          characterSelected: false,
          storyRecap: null, // Explicitly clear story recap
          actionChoices: [] // Explicitly clear action choices
        });
        
        // Force page reload after state is set
        if (typeof window !== 'undefined') {
          setTimeout(() => window.location.reload(), 100);
        }
      },

      backToScenarioSelection: () =>
        set((state) => ({ 
          ...state,
          scenarioSelected: false, 
          characterSelected: false,
          gameStarted: false,
          selectedScenario: null,
          storyRecap: null, // Clear story recap when going back
          narrative: [], // Clear narrative history
          currentResponse: null, // Clear current response
          actionChoices: [] // Clear action choices
        })),
    }),
    {
      name: 'azeroth-game-storage',
      partialize: (state) => ({
        character: state.character,
        narrative: state.narrative,
        currentEnvironment: state.currentEnvironment,
        actionChoices: state.actionChoices,
        storyRecap: state.storyRecap,
        scenario: state.scenario,
        gameStarted: state.gameStarted,
        scenarioSelected: state.scenarioSelected,
        characterSelected: state.characterSelected,
      }),
    }
  )
);