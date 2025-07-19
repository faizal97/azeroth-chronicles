'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Scenario } from './ScenarioSelection';

interface ExpansionClass {
  name: string;
  description: string;
  startingHp: number;
  abilities: string[];
}

interface WarcharacterCharacter {
  name: string;
  title: string;
  class: string;
  hp: number;
  description: string;
  abilities: string[];
  lore: string;
}

interface CharacterSelectionProps {
  scenario: Scenario;
  onCharacterSelect: (character: {
    name: string;
    class: string;
    hp: number;
    abilities: string[];
    isCustom: boolean;
  }) => void;
  onBack: () => void;
}

// Define classes available for each expansion
const expansionClasses: Record<string, ExpansionClass[]> = {
  'third-war': [
    { name: 'Warrior', description: 'Masters of melee combat and battlefield tactics', startingHp: 120, abilities: ['Charge', 'Battle Shout', 'Defensive Stance'] },
    { name: 'Paladin', description: 'Holy warriors wielding Light magic', startingHp: 110, abilities: ['Holy Light', 'Blessing of Might', 'Divine Protection'] },
    { name: 'Priest', description: 'Wielders of divine magic and healing', startingHp: 90, abilities: ['Heal', 'Inner Fire', 'Dispel Magic'] },
    { name: 'Mage', description: 'Masters of arcane magic and elemental forces', startingHp: 80, abilities: ['Fireball', 'Frost Bolt', 'Arcane Intellect'] },
    { name: 'Rogue', description: 'Stealthy assassins and masters of stealth', startingHp: 100, abilities: ['Stealth', 'Backstab', 'Lockpicking'] }
  ],
  'vanilla-classic': [
    { name: 'Warrior', description: 'Tank and melee damage dealer', startingHp: 120, abilities: ['Taunt', 'Heroic Strike', 'Shield Block'] },
    { name: 'Paladin', description: 'Hybrid tank, healer, and damage dealer', startingHp: 110, abilities: ['Seal of Light', 'Blessing of Kings', 'Consecration'] },
    { name: 'Hunter', description: 'Ranged damage with animal companions', startingHp: 105, abilities: ['Hunter\'s Mark', 'Aimed Shot', 'Animal Companion'] },
    { name: 'Rogue', description: 'Stealth-based melee damage dealer', startingHp: 100, abilities: ['Sinister Strike', 'Stealth', 'Poison'] },
    { name: 'Priest', description: 'Primary healer with shadow magic', startingHp: 90, abilities: ['Greater Heal', 'Power Word: Shield', 'Mind Blast'] },
    { name: 'Shaman', description: 'Elemental magic and spiritual healing', startingHp: 105, abilities: ['Lightning Bolt', 'Healing Wave', 'Ghost Wolf'] },
    { name: 'Mage', description: 'Arcane, fire, and frost magic specialist', startingHp: 85, abilities: ['Polymorph', 'Blizzard', 'Portal'] },
    { name: 'Warlock', description: 'Dark magic and demon summoning', startingHp: 95, abilities: ['Shadow Bolt', 'Summon Imp', 'Drain Life'] },
    { name: 'Druid', description: 'Shapeshifting nature magic user', startingHp: 105, abilities: ['Bear Form', 'Rejuvenation', 'Moonfire'] }
  ],
  'burning-crusade': [
    { name: 'Blood Elf Paladin', description: 'Sin\'dorei holy warrior with arcane knowledge', startingHp: 115, abilities: ['Seal of Blood', 'Arcane Torrent', 'Divine Storm'] },
    { name: 'Draenei Shaman', description: 'Eredar exile wielding elemental forces', startingHp: 110, abilities: ['Gift of the Naaru', 'Chain Lightning', 'Heroism'] },
    { name: 'Demon Hunter', description: 'Fel-infused warrior hunting demons', startingHp: 125, abilities: ['Immolation', 'Evasion', 'Mana Burn'] }
  ],
  'wrath': [
    { name: 'Death Knight', description: 'Undead warrior wielding necromantic power', startingHp: 140, abilities: ['Death Grip', 'Icy Touch', 'Undying Will'] },
    { name: 'Frost Mage', description: 'Northrend-trained ice magic specialist', startingHp: 90, abilities: ['Frostbolt', 'Ice Barrier', 'Blizzard'] }
  ],
  'cataclysm': [
    { name: 'Worgen Druid', description: 'Cursed shapeshifter with dual nature', startingHp: 110, abilities: ['Worgen Form', 'Hurricane', 'Barkskin'] },
    { name: 'Goblin Shaman', description: 'Ingenious engineer with elemental mastery', startingHp: 100, abilities: ['Rocket Jump', 'Lightning Shield', 'Engineering'] }
  ],
  'pandaria': [
    { name: 'Monk', description: 'Martial artist channeling inner chi', startingHp: 115, abilities: ['Tiger Palm', 'Healing Sphere', 'Roll'] },
    { name: 'Pandaren Monk', description: 'Ancient martial arts master', startingHp: 120, abilities: ['Crackling Jade Lightning', 'Soothing Mist', 'Zen Meditation'] }
  ],
  'warlords-draenor': [
    { name: 'Orc Warrior', description: 'Iron Horde battle-hardened fighter', startingHp: 130, abilities: ['Bloodlust', 'Intimidating Shout', 'Iron Will'] },
    { name: 'Draenei Paladin', description: 'Lightforged protector of Draenor', startingHp: 125, abilities: ['Light\'s Hammer', 'Aura Mastery', 'Divine Purpose'] }
  ],
  'legion': [
    { name: 'Demon Hunter', description: 'Illidari warrior trained to fight demons', startingHp: 150, abilities: ['Fel Rush', 'Spectral Sight', 'Metamorphosis'] },
    { name: 'Artifact Wielder', description: 'Hero empowered by legendary weapons', startingHp: 140, abilities: ['Artifact Power', 'Legendary Strike', 'Ancient Knowledge'] }
  ],
  'battle-azeroth': [
    { name: 'Void Elf Mage', description: 'Ren\'dorei wielding shadow and arcane', startingHp: 95, abilities: ['Void Form', 'Arcane Orb', 'Rift'] },
    { name: 'Dark Iron Dwarf Warrior', description: 'Fire-forged mountain clan fighter', startingHp: 135, abilities: ['Fireblood', 'Mole Machine', 'Forge Mastery'] },
    { name: 'Heart of Azeroth Bearer', description: 'Champion empowered by the world\'s essence', startingHp: 130, abilities: ['Azerite Power', 'Heart Strike', 'World\'s Blessing'] }
  ],
  'shadowlands': [
    { name: 'Covenant Champion', description: 'Maw Walker bound to afterlife powers', startingHp: 145, abilities: ['Covenant Ability', 'Soulbind Power', 'Anima Surge'] },
    { name: 'Soul Reaper', description: 'Death-touched warrior of the Shadowlands', startingHp: 140, abilities: ['Soul Harvest', 'Death\'s Advance', 'Spectral Form'] }
  ],
  'dragonflight': [
    { name: 'Evoker', description: 'Dracthyr wielding combined dragonflight magic', startingHp: 125, abilities: ['Living Flame', 'Dragonriding', 'Temporal Anomaly'] },
    { name: 'Dragon Isles Explorer', description: 'Adventurer attuned to draconic magic', startingHp: 120, abilities: ['Draconic Empowerment', 'Ancient Knowledge', 'Elemental Mastery'] }
  ],
  'war-within': [
    { name: 'Earthen Warrior', description: 'Stone-forged defender of Azeroth\'s depths', startingHp: 160, abilities: ['Stone Form', 'Earthen Might', 'Seismic Strike'] },
    { name: 'Void Walker', description: 'Corruption-resistant champion of Light', startingHp: 150, abilities: ['Light\'s Beacon', 'Void Resistance', 'Radiant Strike'] }
  ]
};

// Define notable Warcraft characters for each expansion
const warcraftCharacters: Record<string, WarcharacterCharacter[]> = {
  'third-war': [
    { name: 'Arthas Menethil', title: 'Crown Prince of Lordaeron', class: 'Paladin', hp: 180, description: 'The fallen prince wielding Frostmourne', abilities: ['Frostmourne', 'Divine Storm', 'Death Coil'], lore: 'Once a noble paladin, now consumed by his quest to save his people at any cost.' },
    { name: 'Jaina Proudmoore', title: 'Archmage of Dalaran', class: 'Mage', hp: 140, description: 'Powerful mage and leader of Theramore', abilities: ['Blizzard', 'Teleport', 'Mass Polymorph'], lore: 'A brilliant sorceress who seeks peace between Alliance and Horde.' },
    { name: 'Thrall', title: 'Warchief of the Horde', class: 'Shaman', hp: 160, description: 'Orc shaman and leader of the new Horde', abilities: ['Chain Lightning', 'Far Sight', 'Earthquake'], lore: 'Former slave who united the orcish clans and leads them with honor.' },
    { name: 'Tyrande Whisperwind', title: 'High Priestess of Elune', class: 'Priest', hp: 150, description: 'Night elf priestess and military leader', abilities: ['Starfall', 'Heal', 'Searing Arrows'], lore: 'Ancient leader of the night elves, blessed by the moon goddess Elune.' }
  ],
  'vanilla-classic': [
    { name: 'Varian Wrynn', title: 'King of Stormwind', class: 'Warrior', hp: 200, description: 'The High King of the Alliance', abilities: ['Colossus Smash', 'Rally', 'Sword Specialization'], lore: 'Rightful king of Stormwind, returned to unite the Alliance.' },
    { name: 'Sylvanas Windrunner', title: 'Banshee Queen', class: 'Hunter', hp: 180, description: 'Undead ranger-general turned Forsaken leader', abilities: ['Multi-Shot', 'Black Arrow', 'Possession'], lore: 'Former high elf ranger, now leads the Forsaken in their struggle for survival.' },
    { name: 'Cairne Bloodhoof', title: 'High Chieftain of the Tauren', class: 'Shaman', hp: 190, description: 'Wise tauren leader and spiritual guide', abilities: ['War Stomp', 'Healing Wave', 'Ancestral Spirit'], lore: 'Ancient and wise leader of the tauren tribes, ally to Thrall.' }
  ],
  'burning-crusade': [
    { name: 'Illidan Stormrage', title: 'The Betrayer', class: 'Demon Hunter', hp: 250, description: 'Lord of Outland, master of fel magic', abilities: ['Metamorphosis', 'Immolation', 'Evasion'], lore: 'Night elf who sacrificed everything in his obsession to defeat the Burning Legion.' },
    { name: 'Kael\'thas Sunstrider', title: 'Prince of Quel\'Thalas', class: 'Mage', hp: 180, description: 'Blood elf prince seeking power for his people', abilities: ['Phoenix', 'Flamestrike', 'Mana Tap'], lore: 'Desperate prince who turned to fel magic to save his people from their addiction.' },
    { name: 'Lady Vashj', title: 'Coilfang Matron', class: 'Naga Sea Witch', hp: 200, description: 'Naga sorceress and Illidan\'s lieutenant', abilities: ['Forked Lightning', 'Frost Arrows', 'Tornado'], lore: 'Former night elf noble, transformed by the Sundering into a powerful naga.' }
  ],
  'wrath': [
    { name: 'Arthas Menethil', title: 'The Lich King', class: 'Death Knight', hp: 300, description: 'Fallen paladin merged with Ner\'zhul', abilities: ['Frostmourne', 'Defile', 'Soul Reaper'], lore: 'The ultimate fusion of Arthas and Ner\'zhul, ruler of all undead.' },
    { name: 'Jaina Proudmoore', title: 'Leader of the Kirin Tor', class: 'Archmage', hp: 160, description: 'Powerful mage defending Dalaran', abilities: ['Blizzard', 'Ice Block', 'Portal Network'], lore: 'Now a leader in the magical city of Dalaran, fighting against the Lich King.' },
    { name: 'Tirion Fordring', title: 'Highlord of the Silver Hand', class: 'Paladin', hp: 220, description: 'Redeemed paladin leading the Argent Crusade', abilities: ['Ashbringer', 'Divine Storm', 'Turn Undead'], lore: 'Former hermit who returned to lead the fight against the Scourge.' }
  ],
  'cataclysm': [
    { name: 'Deathwing', title: 'The Destroyer', class: 'Dragon Aspect', hp: 500, description: 'Corrupted Earth-Warder bringing apocalypse', abilities: ['Cataclysm', 'Elementium Bolt', 'Corruption'], lore: 'Once the Earth-Warder, now a force of pure destruction driven mad by Old God whispers.' },
    { name: 'Thrall', title: 'World-Shaman', class: 'Shaman', hp: 200, description: 'Former Warchief seeking to heal the world', abilities: ['Doomhammer', 'Elemental Mastery', 'World Healing'], lore: 'Now focused on healing the shattered world through shamanic power.' },
    { name: 'Malfurion Stormrage', title: 'Archdruid of the Night Elves', class: 'Druid', hp: 180, description: 'First druid awakened to face the crisis', abilities: ['Hurricane', 'Nature\'s Wrath', 'Tranquility'], lore: 'Ancient archdruid who emerges from the Emerald Dream to defend nature.' }
  ],
  'pandaria': [
    { name: 'Chen Stormstout', title: 'Legendary Brewmaster', class: 'Monk', hp: 170, description: 'Wandering pandaren seeking adventure', abilities: ['Drunken Haze', 'Storm Bolt', 'Keg Smash'], lore: 'Legendary pandaren who helped shape the destiny of both Alliance and Horde.' },
    { name: 'Garrosh Hellscream', title: 'Warchief of the Horde', class: 'Warrior', hp: 240, description: 'Aggressive orc leader consumed by pride', abilities: ['Whirlwind', 'Intimidating Shout', 'True Horde'], lore: 'Son of Grom Hellscream, whose aggression threatens to tear the Horde apart.' },
    { name: 'Anduin Wrynn', title: 'Prince of Stormwind', class: 'Priest', hp: 150, description: 'Young prince learning to lead with compassion', abilities: ['Mass Heal', 'Inner Fire', 'Diplomacy'], lore: 'Varian\'s son, who seeks peace and understanding rather than war.' }
  ],
  'warlords-draenor': [
    { name: 'Grommash Hellscream', title: 'Warchief of the Iron Horde', class: 'Warrior', hp: 220, description: 'Uncorrupted orc chieftain leading the Iron Horde', abilities: ['Gorehowl', 'Iron Will', 'Rallying Cry'], lore: 'Alternate timeline version of Grom, free from demonic corruption.' },
    { name: 'Yrel', title: 'Exarch of the Draenei', class: 'Paladin', hp: 190, description: 'Young draenei rising to leadership', abilities: ['Light\'s Hammer', 'Consecration', 'Divine Purpose'], lore: 'Young draenei who grows into a powerful leader under the player\'s guidance.' },
    { name: 'Khadgar', title: 'Archmage of the Kirin Tor', class: 'Mage', hp: 160, description: 'Medivh\'s former apprentice guiding the expedition', abilities: ['Polymorph', 'Time Warp', 'Arcane Power'], lore: 'Former apprentice to Medivh, now a key figure in the fight against the Iron Horde.' }
  ],
  'legion': [
    { name: 'Illidan Stormrage', title: 'The Betrayer', class: 'Demon Hunter', hp: 280, description: 'Reborn demon hunter leading against the Legion', abilities: ['Eye Beam', 'Metamorphosis', 'Fel Barrage'], lore: 'Resurrected to lead the final assault against the Burning Legion he\'s fought for millennia.' },
    { name: 'Velen', title: 'Prophet of the Draenei', class: 'Priest', hp: 200, description: 'Ancient draenei prophet wielding the Light', abilities: ['Divine Insight', 'Gift of the Naaru', 'Purify'], lore: 'Ancient prophet who has foreseen this final battle against the Legion.' },
    { name: 'Khadgar', title: 'Guardian of Tirisfal', class: 'Archmage', hp: 180, description: 'New Guardian coordinating the war effort', abilities: ['Guardian\'s Power', 'Mass Teleport', 'Arcane Mastery'], lore: 'Takes up the mantle of Guardian to coordinate Azeroth\'s defenses.' }
  ],
  'battle-azeroth': [
    { name: 'Jaina Proudmoore', title: 'Lord Admiral of Kul Tiras', class: 'Frost Mage', hp: 200, description: 'Kul Tiran leader hardened by loss', abilities: ['Tide Wall', 'Glacial Spike', 'Blessing of the Tides'], lore: 'Returns to her homeland to unite Kul Tiras against the growing threats.' },
    { name: 'Sylvanas Windrunner', title: 'Warchief of the Horde', class: 'Dark Ranger', hp: 220, description: 'Banshee Queen leading the Horde to war', abilities: ['Wailing Arrow', 'Banshee Wail', 'Shadow Clone'], lore: 'Now Warchief, she leads the Horde down an increasingly dark path.' },
    { name: 'Anduin Wrynn', title: 'King of Stormwind', class: 'Priest', hp: 180, description: 'Young king learning to balance peace and war', abilities: ['Mass Resurrection', 'Shalamayne', 'Divine Hymn'], lore: 'Now king after his father\'s death, struggling with the weight of leadership.' }
  ],
  'shadowlands': [
    { name: 'Sylvanas Windrunner', title: 'The Banshee Queen', class: 'Banshee', hp: 250, description: 'Jailer\'s champion reshaping reality', abilities: ['Domination Magic', 'Banshee Form', 'Reality Tear'], lore: 'Serves the Jailer in an attempt to break the cycle of death and suffering.' },
    { name: 'Uther the Lightbringer', title: 'Forsworn of Bastion', class: 'Paladin', hp: 200, description: 'First Paladin struggling with doubt in death', abilities: ['Divine Storm', 'Memories of Light', 'Judgment'], lore: 'The first paladin, now questioning his faith in the afterlife of Bastion.' },
    { name: 'Jaina Proudmoore', title: 'Maw Walker', class: 'Archmage', hp: 180, description: 'Mage exploring the realms of death', abilities: ['Frost Magic', 'Planar Shift', 'Death Magic'], lore: 'Ventures into the Shadowlands to help save reality itself.' }
  ],
  'dragonflight': [
    { name: 'Alexstrasza', title: 'Life-Binder', class: 'Dragon Aspect', hp: 300, description: 'Red Dragon Aspect restored to power', abilities: ['Life Magic', 'Dragon Form', 'Renewal'], lore: 'The Life-Binder, working to restore the dragonflights to their former glory.' },
    { name: 'Wrathion', title: 'The Black Prince', class: 'Dragon', hp: 250, description: 'Last uncorrupted black dragon', abilities: ['Shadow Flame', 'Dragon Magic', 'Prophecy'], lore: 'The Black Prince, heir to Deathwing\'s legacy but free from corruption.' },
    { name: 'Kalecgos', title: 'Aspect of Magic', class: 'Dragon Mage', hp: 220, description: 'Blue Dragon Aspect guiding magic\'s return', abilities: ['Arcane Power', 'Time Magic', 'Spell Steal'], lore: 'Leader of the blue dragonflight, working to restore magic to the Dragon Isles.' }
  ],
  'war-within': [
    { name: 'Anduin Wrynn', title: 'The Broken King', class: 'Shadow Priest', hp: 200, description: 'Former king struggling with darkness within', abilities: ['Shadow Magic', 'Inner Conflict', 'Light\'s Memory'], lore: 'Haunted by his experiences, Anduin grapples with the shadow within his soul.' },
    { name: 'Thrall', title: 'World Shaman', class: 'Shaman', hp: 210, description: 'Elemental lord protecting Azeroth\'s core', abilities: ['Earthen Power', 'Core Magic', 'Primal Wisdom'], lore: 'Ventures into Azeroth\'s depths to heal the world\'s wounded heart.' },
    { name: 'Magni Bronzebeard', title: 'Speaker for Azeroth', class: 'Diamond King', hp: 250, description: 'Diamond-cursed dwarf speaking for the world', abilities: ['Diamond Skin', 'Earth Speech', 'World\'s Voice'], lore: 'Transformed by Azeroth\'s power, he serves as the world\'s voice and protector.' }
  ]
};

export function CharacterSelection({ scenario, onCharacterSelect, onBack }: CharacterSelectionProps) {
  const [mode, setMode] = useState<'select' | 'custom' | 'warcraft'>('select');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<WarcharacterCharacter | null>(null);
  const [customName, setCustomName] = useState('');
  const [transitionKey, setTransitionKey] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewType, setViewType] = useState<'carousel' | 'cards'>('carousel');
  const [selectedOption, setSelectedOption] = useState<'custom' | 'warcraft'>('custom'); // For main menu navigation
  const [selectedClassIndex, setSelectedClassIndex] = useState(0); // For class selection navigation

  // Get available options for current scenario
  const availableClasses = expansionClasses[scenario.id] || expansionClasses['vanilla-classic'];
  const availableCharacters = warcraftCharacters[scenario.id] || warcraftCharacters['vanilla-classic'];

  // Handle mode transitions
  const handleModeChange = useCallback((newMode: 'select' | 'custom' | 'warcraft') => {
    setTransitionKey(prev => prev + 1);
    setMode(newMode);
    setSelectedClass('');
    setSelectedCharacter(null);
    setCustomName('');
    setCurrentCharacterIndex(0);
    if (newMode === 'warcraft' && availableCharacters.length > 0) {
      setSelectedCharacter(availableCharacters[0]);
    }
  }, [availableCharacters]);

  // Character submission functions
  const handleWarcraftCharacterSubmit = useCallback(() => {
    if (selectedCharacter) {
      onCharacterSelect({
        name: selectedCharacter.name,
        class: selectedCharacter.class,
        hp: selectedCharacter.hp,
        abilities: selectedCharacter.abilities,
        isCustom: false
      });
    }
  }, [selectedCharacter, onCharacterSelect]);

  const handleCustomCharacterSubmit = useCallback(() => {
    const selectedClassData = availableClasses.find(c => c.name === selectedClass);
    if (customName.trim() && selectedClassData) {
      onCharacterSelect({
        name: customName.trim(),
        class: selectedClassData.name,
        hp: selectedClassData.startingHp,
        abilities: selectedClassData.abilities,
        isCustom: true
      });
    }
  }, [customName, selectedClass, availableClasses, onCharacterSelect]);

  // Character carousel navigation
  const navigateToCharacter = useCallback((newIndex: number) => {
    if (newIndex === currentCharacterIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionKey(prev => prev + 1);
    setCurrentCharacterIndex(newIndex);
    setSelectedCharacter(availableCharacters[newIndex]);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [currentCharacterIndex, isTransitioning, availableCharacters]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isTransitioning) return;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        if (mode !== 'select') {
          handleModeChange('select');
        } else {
          onBack();
        }
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        if (mode === 'select') {
          // Navigate between main options
          setSelectedOption(prev => prev === 'warcraft' ? 'custom' : 'warcraft');
        } else if (mode === 'warcraft' && viewType === 'carousel') {
          // Navigate warcraft characters in carousel
          const prevIndex = (currentCharacterIndex - 1 + availableCharacters.length) % availableCharacters.length;
          navigateToCharacter(prevIndex);
        } else if (mode === 'custom') {
          // Navigate between classes
          const prevIndex = (selectedClassIndex - 1 + availableClasses.length) % availableClasses.length;
          setSelectedClassIndex(prevIndex);
          setSelectedClass(availableClasses[prevIndex].name);
        }
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        if (mode === 'select') {
          // Navigate between main options
          setSelectedOption(prev => prev === 'custom' ? 'warcraft' : 'custom');
        } else if (mode === 'warcraft' && viewType === 'carousel') {
          // Navigate warcraft characters in carousel
          const nextIndex = (currentCharacterIndex + 1) % availableCharacters.length;
          navigateToCharacter(nextIndex);
        } else if (mode === 'custom') {
          // Navigate between classes
          const nextIndex = (selectedClassIndex + 1) % availableClasses.length;
          setSelectedClassIndex(nextIndex);
          setSelectedClass(availableClasses[nextIndex].name);
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (mode === 'warcraft' && viewType === 'cards') {
          // Navigate warcraft characters in card view
          const prevIndex = Math.max(0, currentCharacterIndex - 1);
          if (prevIndex !== currentCharacterIndex) {
            navigateToCharacter(prevIndex);
          }
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (mode === 'warcraft' && viewType === 'cards') {
          // Navigate warcraft characters in card view
          const nextIndex = Math.min(availableCharacters.length - 1, currentCharacterIndex + 1);
          if (nextIndex !== currentCharacterIndex) {
            navigateToCharacter(nextIndex);
          }
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (mode === 'select') {
          // Select the selected option
          handleModeChange(selectedOption);
        } else if (mode === 'warcraft' && selectedCharacter) {
          // Submit warcraft character
          handleWarcraftCharacterSubmit();
        } else if (mode === 'custom' && selectedClass && customName.trim()) {
          // Submit custom character
          handleCustomCharacterSubmit();
        }
        break;
        
      case 'Tab':
        if (mode === 'warcraft') {
          event.preventDefault();
          setViewType(prev => prev === 'carousel' ? 'cards' : 'carousel');
        }
        break;
    }
  }, [mode, currentCharacterIndex, availableCharacters.length, selectedCharacter, isTransitioning, viewType, selectedOption, selectedClassIndex, availableClasses.length, selectedClass, customName, handleModeChange, onBack, navigateToCharacter, handleWarcraftCharacterSubmit, handleCustomCharacterSubmit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);



  return (
    <div className="min-h-screen animated-bg overflow-y-auto">
      {/* Background Image */}
      <div 
        key={`bg-${transitionKey}`}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-transition parallax-bg"
        style={{
          backgroundImage: `url(${scenario.wallpaper})`,
        }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/80" />
      
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4">
        {/* Header */}
        <div className="text-center mb-6 slide-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3 tracking-tight drop-shadow-2xl">
            Character Selection
          </h1>
          <p className="text-white/90 text-lg font-semibold tracking-wide drop-shadow-lg">
            {scenario.title} • {scenario.expansion}
          </p>
          
          {/* Keyboard Controls Hint */}
          <div className="mt-4 glass rounded-lg p-3 mx-auto max-w-2xl border border-white/10">
            <p className="text-white/70 text-sm">
              {mode === 'select' && '← → Navigate options • Enter Select • Esc Back'}
              {mode === 'custom' && '← → Navigate classes • Enter Create character • Esc Back'}
              {mode === 'warcraft' && 'Tab Toggle view • ← → Navigate • ↑ ↓ (Cards) • Enter Select • Esc Back'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center w-full max-w-6xl mx-auto">
          {mode === 'select' && (
            <div key={`select-${transitionKey}`} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full carousel-transition">
              {/* Create Own Character */}
              <Card className={`relative overflow-hidden shadow-2xl h-[300px] cursor-pointer group transition-all duration-300 ${
                selectedOption === 'custom' 
                  ? 'border-primary ring-4 ring-primary/50 scenario-glow transform scale-[1.02]' 
                  : 'border-primary/50 scenario-glow hover:border-primary hover:scale-[1.01]'
              }`}
                    onClick={() => handleModeChange('custom')}>
                <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${
                  selectedOption === 'custom' ? 'from-primary/30 to-chart-4/30' : 'from-primary/20 to-chart-4/20'
                }`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                
                <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">⚔️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Create Own Character</h2>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    Forge your own legend with a custom character suited for the {scenario.expansion} era
                  </p>
                  <Badge className="bg-primary/20 text-primary border-primary/50 text-lg px-4 py-2">
                    {availableClasses.length} Classes Available
                  </Badge>
                </div>
              </Card>

              {/* Play as Warcraft Character */}
              <Card className={`relative overflow-hidden shadow-2xl h-[300px] cursor-pointer group transition-all duration-300 ${
                selectedOption === 'warcraft' 
                  ? 'border-chart-3 ring-4 ring-chart-3/50 scenario-glow transform scale-[1.02]' 
                  : 'border-primary/50 scenario-glow hover:border-chart-3 hover:scale-[1.01]'
              }`}
                    onClick={() => handleModeChange('warcraft')}>
                <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${
                  selectedOption === 'warcraft' ? 'from-chart-3/30 to-chart-5/30' : 'from-chart-3/20 to-chart-5/20'
                }`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                
                <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
                  <div className="w-20 h-20 bg-chart-3/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">👑</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Play as Warcraft Character</h2>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    Step into the role of legendary heroes and villains from {scenario.expansion}
                  </p>
                  <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/50 text-lg px-4 py-2">
                    {availableCharacters.length} Heroes Available
                  </Badge>
                </div>
              </Card>
            </div>
          )}

          {mode === 'custom' && (
            <div key={`custom-${transitionKey}`} className="w-full max-w-4xl carousel-transition content-fade-in">
              <Card className="relative overflow-hidden border-primary/50 shadow-2xl scenario-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-chart-4/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                
                <div className="relative z-10 p-8">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-3xl font-bold text-white mb-2">Create Your Hero</CardTitle>
                    <p className="text-white/80 text-base">{scenario.expansion} • Available Classes</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Character Name */}
                    <div className="space-y-2">
                      <Label htmlFor="character-name" className="text-white text-lg font-semibold">Character Name</Label>
                      <Input
                        id="character-name"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter your character's name"
                        className="glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white placeholder-muted-foreground text-lg py-3"
                      />
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-4">
                      <Label className="text-white text-lg font-semibold">Choose Your Class</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableClasses.map((classData, index) => (
                          <Card
                            key={classData.name}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                              selectedClass === classData.name
                                ? 'border-primary/70 shadow-lg shadow-primary/30 bg-primary/10'
                                : index === selectedClassIndex && mode === 'custom'
                                ? 'border-chart-2 ring-2 ring-chart-2/50 bg-chart-2/10'
                                : 'border-border/50 hover:border-primary/40 bg-black/30'
                            }`}
                            onClick={() => {
                              setSelectedClass(classData.name);
                              setSelectedClassIndex(index);
                            }}
                          >
                            <CardContent className="p-4">
                              <h3 className="text-white font-bold text-lg mb-2">{classData.name}</h3>
                              <p className="text-white/80 text-sm mb-3">{classData.description}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/70">Starting HP:</span>
                                  <span className="text-white">{classData.startingHp}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-white/70">Abilities:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {classData.abilities.map((ability) => (
                                      <Badge key={ability} variant="outline" className="text-xs text-primary border-primary/50">
                                        {ability}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button
                        onClick={() => handleModeChange('select')}
                        variant="outline"
                        className="flex-1 glass border-white/20 text-white hover:bg-white/10 py-2 text-base"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleCustomCharacterSubmit}
                        disabled={!customName.trim() || !selectedClass}
                        className="flex-1 bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-primary-foreground py-2 text-base font-bold disabled:opacity-50"
                      >
                        Create Character
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {mode === 'warcraft' && availableCharacters.length > 0 && (
            <div key={`warcraft-${transitionKey}`} className="w-full max-w-7xl carousel-transition">
              {/* Header with View Toggle */}
              <div className="text-center mb-6">
                <div className="flex justify-between items-center w-full mb-6">
                  <div className="flex-1"></div>
                  <div className="flex-1 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-2">Choose Your Legend</h2>
                    <p className="text-white/80 text-base">{scenario.expansion} • {viewType === 'carousel' ? `${currentCharacterIndex + 1} of ${availableCharacters.length}` : `${availableCharacters.length} Heroes`}</p>
                  </div>
                  <div className="flex-1 flex justify-end">
                    {/* View Toggle */}
                    <div className="glass-strong rounded-xl p-2 border border-white/20">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewType('carousel')}
                          className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
                            viewType === 'carousel'
                              ? 'bg-chart-3 text-white shadow-lg'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Carousel
                        </button>
                        <button
                          onClick={() => setViewType('cards')}
                          className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
                            viewType === 'cards'
                              ? 'bg-chart-3 text-white shadow-lg'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Cards
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render appropriate view */}
              {viewType === 'carousel' ? (
                <div>

              {/* Main Carousel Container */}
              <div className="flex items-center justify-center w-full">
                {/* Navigation Arrows */}
                <Button
                  onClick={() => {
                    const prevIndex = (currentCharacterIndex - 1 + availableCharacters.length) % availableCharacters.length;
                    navigateToCharacter(prevIndex);
                  }}
                  disabled={isTransitioning}
                  variant="ghost"
                  size="lg"
                  className="hidden md:flex items-center justify-center w-16 h-16 rounded-full glass-strong border-white/20 text-white hover:text-chart-3 hover:border-chart-3/50 transition-all duration-300 mr-8 glow-hover smooth-scale disabled:opacity-50"
                >
                  <span className="text-3xl">‹</span>
                </Button>
                
                {/* Central Character Display */}
                <div className="flex-1 max-w-4xl">
                  <Card 
                    key={`character-card-${transitionKey}`}
                    className="relative overflow-hidden border-chart-3/50 shadow-2xl scenario-glow carousel-transition h-[70vh] max-h-[600px]"
                  >
                    {/* Background Image would go here if characters had wallpapers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-3/20 to-chart-5/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-8">
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <Badge 
                          className="bg-chart-3/20 text-chart-3 border-chart-3/50 text-lg px-4 py-2"
                        >
                          {selectedCharacter?.class}
                        </Badge>
                        <div className="text-white/70 text-right">
                          <div className="text-sm">{currentCharacterIndex + 1} of {availableCharacters.length}</div>
                        </div>
                      </div>
                      
                      {/* Center Content */}
                      <div 
                        key={`character-content-${transitionKey}`}
                        className="text-center space-y-6 content-fade-in"
                      >
                        <div>
                          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl carousel-transition">
                            {selectedCharacter?.name}
                          </h2>
                          <p className="text-chart-3 text-xl font-semibold tracking-wide drop-shadow-lg carousel-transition">
                            {selectedCharacter?.title}
                          </p>
                        </div>
                        
                        <p className="text-white/90 text-lg leading-relaxed drop-shadow-lg max-w-2xl mx-auto carousel-transition italic">
                          &quot;{selectedCharacter?.description}&quot;
                        </p>
                        
                        <div className="text-white/90 text-base leading-relaxed drop-shadow max-w-3xl mx-auto">
                          {selectedCharacter?.lore}
                        </div>
                      </div>
                      
                      {/* Bottom Section */}
                      <div 
                        key={`character-details-${transitionKey}`}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 content-fade-in"
                      >
                        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 carousel-transition hover:bg-black/50">
                          <div className="flex items-center gap-3 text-white/90 mb-2">
                            <span className="w-3 h-3 bg-chart-3 rounded-full"></span>
                            <span className="font-medium text-lg">Health:</span>
                          </div>
                          <p className="text-white text-lg">{selectedCharacter?.hp} HP</p>
                        </div>
                        
                        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 carousel-transition hover:bg-black/50">
                          <div className="flex items-center gap-3 text-white/90 mb-2">
                            <span className="w-3 h-3 bg-chart-5 rounded-full"></span>
                            <span className="font-medium text-lg">Abilities:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedCharacter?.abilities.map((ability) => (
                              <Badge key={ability} variant="outline" className="text-xs text-chart-5 border-chart-5/50">
                                {ability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Navigation Arrows */}
                <Button
                  onClick={() => {
                    const nextIndex = (currentCharacterIndex + 1) % availableCharacters.length;
                    navigateToCharacter(nextIndex);
                  }}
                  disabled={isTransitioning}
                  variant="ghost"
                  size="lg"
                  className="hidden md:flex items-center justify-center w-16 h-16 rounded-full glass-strong border-white/20 text-white hover:text-chart-3 hover:border-chart-3/50 transition-all duration-300 ml-8 glow-hover smooth-scale disabled:opacity-50"
                >
                  <span className="text-3xl">›</span>
                </Button>
              </div>
              
              {/* Bottom Section */}
              <div className="mt-8 space-y-6">
                {/* Character Indicators */}
                <div className="flex justify-center gap-2">
                  {availableCharacters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToCharacter(index)}
                      disabled={isTransitioning}
                      className={`w-3 h-3 rounded-full carousel-transition smooth-scale disabled:opacity-50 ${
                        index === currentCharacterIndex
                          ? 'bg-chart-3 shadow-lg shadow-chart-3/50 scale-125'
                          : 'bg-white/30 hover:bg-white/50 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="text-center space-y-4">
                  <Button
                    onClick={handleWarcraftCharacterSubmit}
                    disabled={isTransitioning || !selectedCharacter}
                    className="bg-gradient-to-r from-chart-3 to-chart-5 hover:from-chart-3/90 hover:to-chart-5/90 text-white px-8 py-3 text-xl font-bold rounded-2xl shadow-2xl carousel-transition hover:scale-105 glow-hover smooth-scale disabled:opacity-50"
                  >
                    Play as {selectedCharacter?.name}
                  </Button>
                </div>
              </div>
                </div>
              ) : (
                // Card View
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableCharacters.map((character, index) => (
                      <Card
                        key={character.name}
                        className="relative overflow-hidden border-chart-3/30 shadow-xl hover:border-chart-3/60 transition-all duration-300 hover:scale-105 cursor-pointer group h-96"
                        onClick={() => {
                          setSelectedCharacter(character);
                          setCurrentCharacterIndex(index);
                          handleWarcraftCharacterSubmit();
                        }}
                      >
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-chart-3/20 to-chart-5/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95" />
                        
                        {/* Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                          {/* Top Section */}
                          <div className="flex justify-between items-start">
                            <Badge 
                              className="bg-chart-3/20 text-chart-3 border-chart-3/50 text-sm px-3 py-1"
                            >
                              {character.class}
                            </Badge>
                            <div className="text-white/70 text-right">
                              <div className="text-xs">{character.hp} HP</div>
                            </div>
                          </div>
                          
                          {/* Center Content */}
                          <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
                            <div>
                              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                                {character.name}
                              </h3>
                              <p className="text-chart-3 text-sm font-semibold tracking-wide drop-shadow">
                                {character.title}
                              </p>
                            </div>
                            
                            <p className="text-white/80 text-sm leading-relaxed italic overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              &quot;{character.description}&quot;
                            </p>
                            
                            <p className="text-white/70 text-xs leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                              {character.lore}
                            </p>
                          </div>
                          
                          {/* Bottom Section */}
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="text-white/70">Abilities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {character.abilities.slice(0, 3).map((ability) => (
                                  <Badge key={ability} variant="outline" className="text-xs text-chart-5 border-chart-5/50">
                                    {ability}
                                  </Badge>
                                ))}
                                {character.abilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs text-white/50 border-white/30">
                                    +{character.abilities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Action Buttons for Card View */}
                  <div className="text-center mt-8">
                    <div className="glass-strong rounded-xl p-4 border border-white/20 max-w-2xl mx-auto">
                      <p className="text-white/80 text-sm leading-relaxed">
                        💡 Click any hero to begin your legend • Tab to switch views
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Instructions */}
        <div className="mt-6 pb-4">
          <div className="glass-strong rounded-xl p-3 border border-white/20 max-w-2xl mx-auto">
            <p className="text-white/80 text-sm leading-relaxed text-center">
              {mode === 'warcraft' ? (
                <>💡 {viewType === 'carousel' ? 
                  <><kbd className="px-2 py-1 bg-white/20 rounded text-xs">←</kbd> <kbd className="px-2 py-1 bg-white/20 rounded text-xs">→</kbd> to navigate • </> :
                  <>Click any hero • </>
                }<kbd className="px-2 py-1 bg-white/20 rounded text-xs">Tab</kbd> to switch views • <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Esc</kbd> to go back</>
              ) : (
                <>💡 <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Esc</kbd> to go back • Choose your path wisely, hero!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}