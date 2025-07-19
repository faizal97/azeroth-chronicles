'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export interface Scenario {
  id: string;
  title: string;
  expansion: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  description: string;
  startingLocation: string;
  startingClass: string;
  startingHp: number;
  startingInventory: string[];
  backgroundLore: string;
  wallpaper: string;
}

const scenarios: Scenario[] = [
  {
    id: 'third-war',
    title: 'The Third War',
    expansion: 'Warcraft III',
    difficulty: 'Medium',
    description: 'Experience the chaos of the Burning Legion\'s return. Demons pour through dimensional rifts as the world burns.',
    startingLocation: 'Goldshire, Elwynn Forest',
    startingClass: 'Warrior',
    startingHp: 100,
    startingInventory: ['Basic Sword', 'Leather Armor', 'Health Potion'],
    backgroundLore: 'The Burning Legion has returned to Azeroth. Archimonde and his demonic forces threaten to destroy everything. You are a young adventurer caught in the midst of this apocalyptic war.',
    wallpaper: '/warcraft-3.jpg'
  },
  {
    id: 'vanilla-classic',
    title: 'The Age of Heroes',
    expansion: 'World of Warcraft Classic',
    difficulty: 'Easy',
    description: 'Begin your journey in a time of relative peace, exploring the vast world and uncovering ancient mysteries.',
    startingLocation: 'Northshire Abbey',
    startingClass: 'Paladin',
    startingHp: 120,
    startingInventory: ['Training Sword', 'Cloth Armor', 'Holy Light Scroll', 'Bread'],
    backgroundLore: 'The major conflicts have settled, but adventure awaits. Ancient ruins hold secrets, and new threats emerge from the shadows. Start your legend as a novice hero.',
    wallpaper: '/world-of-warcraft-classic.jpg'
  },
  {
    id: 'burning-crusade',
    title: 'Through the Dark Portal',
    expansion: 'The Burning Crusade',
    difficulty: 'Hard',
    description: 'Venture into the shattered realm of Outland to face Illidan and his forces in the twisted Nether.',
    startingLocation: 'Hellfire Peninsula, Outland',
    startingClass: 'Hunter',
    startingHp: 150,
    startingInventory: ['Outland Bow', 'Fel-touched Arrows', 'Survival Kit', 'Dimensional Beacon'],
    backgroundLore: 'The Dark Portal has reopened! You are among the brave souls venturing into Outland, the shattered homeworld of the orcs, now ruled by Illidan Stormrage.',
    wallpaper: '/burning-crusade.jpg'
  },
  {
    id: 'wrath',
    title: 'Wrath of the Lich King',
    expansion: 'Wrath of the Lich King',
    difficulty: 'Hard',
    description: 'Journey to the frozen continent of Northrend to face the undead Scourge and their master, Arthas.',
    startingLocation: 'Borean Tundra, Northrend',
    startingClass: 'Death Knight',
    startingHp: 180,
    startingInventory: ['Runic Blade', 'Plate Armor', 'Unholy Presence', 'Icebreaker Potion'],
    backgroundLore: 'The Lich King stirs in his Frozen Throne. As a Death Knight freed from his control, you must help stop Arthas before he plunges the world into eternal winter.',
    wallpaper: '/wrath-of-the-lich-king.jpg'
  },
  {
    id: 'cataclysm',
    title: 'The Cataclysm',
    expansion: 'Cataclysm',
    difficulty: 'Legendary',
    description: 'The world has been shattered by Deathwing\'s emergence. Navigate a transformed Azeroth in chaos.',
    startingLocation: 'Stormwind City (Rebuilt)',
    startingClass: 'Mage',
    startingHp: 140,
    startingInventory: ['Elemental Staff', 'Robes of Protection', 'Mana Potion', 'Portal Stone'],
    backgroundLore: 'Deathwing the Destroyer has emerged from Deepholm, shattering the world. The elements rage out of control, and you must help restore balance to a broken Azeroth.',
    wallpaper: '/cataclysm.jpg'
  },
  {
    id: 'pandaria',
    title: 'Mists of Pandaria',
    expansion: 'Mists of Pandaria',
    difficulty: 'Medium',
    description: 'Discover the hidden continent of Pandaria and learn the ancient ways of the Pandaren monks.',
    startingLocation: 'Jade Forest, Pandaria',
    startingClass: 'Monk',
    startingHp: 130,
    startingInventory: ['Bamboo Staff', 'Simple Robes', 'Tea Leaves', 'Meditation Beads'],
    backgroundLore: 'The mists have parted to reveal Pandaria, a land untouched by war for thousands of years. But your arrival brings conflict to this peaceful realm.',
    wallpaper: '/mist-of-pandaria.jpg'
  },
  {
    id: 'warlords-draenor',
    title: 'Warlords of Draenor',
    expansion: 'Warlords of Draenor',
    difficulty: 'Hard',
    description: 'Travel back in time to an alternate Draenor where the Iron Horde threatens both timelines.',
    startingLocation: 'Shadowmoon Valley, Draenor',
    startingClass: 'Warrior',
    startingHp: 160,
    startingInventory: ['Iron Horde Blade', 'Draenei Crystal', 'Garrison Hearthstone', 'Time-Lost Artifact'],
    backgroundLore: 'Garrosh has escaped to an alternate timeline, forming the Iron Horde with an uncorrupted Hellscream clan. You must stop this threat before it conquers both timelines.',
    wallpaper: '/warlords-of-draenor.jpg'
  },
  {
    id: 'legion',
    title: 'Legion',
    expansion: 'Legion',
    difficulty: 'Legendary',
    description: 'Face the third invasion of the Burning Legion as they seek to claim Azeroth once and for all.',
    startingLocation: 'Broken Isles',
    startingClass: 'Demon Hunter',
    startingHp: 200,
    startingInventory: ['Fel-forged Warglaives', 'Legion Detector', 'Artifact Research', 'Dalaran Portal Stone'],
    backgroundLore: 'The Burning Legion has returned with unprecedented force. As a Demon Hunter, you have sacrificed everything to gain the power needed to stop this ultimate invasion.',
    wallpaper: '/legion.jpg'
  },
  {
    id: 'battle-azeroth',
    title: 'Battle for Azeroth',
    expansion: 'Battle for Azeroth',
    difficulty: 'Hard',
    description: 'Navigate the renewed faction war while confronting the Old Gods\' corruption of Azeroth itself.',
    startingLocation: 'Boralus Harbor, Kul Tiras',
    startingClass: 'Rogue',
    startingHp: 170,
    startingInventory: ['Kul Tiran Cutlass', 'Azerite Fragment', 'Heart of Azeroth', 'Naval Chart'],
    backgroundLore: 'War has erupted between the Alliance and Horde once more. But beneath the surface, the Old Gods stir, corrupting Azeroth\'s world-soul with the mysterious substance called Azerite.',
    wallpaper: '/battle-for-azeroth.jpg'
  },
  {
    id: 'shadowlands',
    title: 'Shadowlands',
    expansion: 'Shadowlands',
    difficulty: 'Legendary',
    description: 'Journey beyond death itself to the Shadowlands, where the cycle of life and death has been broken.',
    startingLocation: 'The Maw, Shadowlands',
    startingClass: 'Death Knight',
    startingHp: 190,
    startingInventory: ['Soul-forged Blade', 'Covenant Sigil', 'Anima Conductor', 'Maw Walker\'s Pack'],
    backgroundLore: 'The Helm of Domination has been shattered, tearing open the veil between life and death. You must venture into the Shadowlands to restore the cosmic balance before reality itself unravels.',
    wallpaper: '/shadowlands.jpg'
  },
  {
    id: 'dragonflight',
    title: 'Dragonflight',
    expansion: 'Dragonflight',
    difficulty: 'Medium',
    description: 'Explore the Dragon Isles and help restore the power of the dragonflights in their ancestral home.',
    startingLocation: 'Waking Shores, Dragon Isles',
    startingClass: 'Evoker',
    startingHp: 175,
    startingInventory: ['Draconic Focus', 'Dragonriding Gear', 'Ancient Tablet', 'Elemental Essence'],
    backgroundLore: 'The dragonflights have awakened from their long slumber. As an Evoker, you wield the combined magic of all dragonflights to help restore their power and uncover the secrets of the Dragon Isles.',
    wallpaper: '/dragonflight.jpg'
  },
  {
    id: 'war-within',
    title: 'The War Within',
    expansion: 'The War Within',
    difficulty: 'Legendary',
    description: 'Descend into the depths of Azeroth to confront the growing darkness that threatens the world from within.',
    startingLocation: 'Khaz Algar, Azeroth\'s Depths',
    startingClass: 'Paladin',
    startingHp: 185,
    startingInventory: ['Radiant Weapon', 'Light\'s Beacon', 'Earthen Artifact', 'Void Suppressor'],
    backgroundLore: 'A new threat emerges from the very core of Azeroth. The Void stirs beneath the surface, and you must venture into the planet\'s depths to prevent the corruption from consuming everything above.',
    wallpaper: '/war-within.jpg'
  }
];

interface ScenarioSelectionProps {
  onSelectScenario: (scenario: Scenario) => void;
}

export function ScenarioSelection({ onSelectScenario }: ScenarioSelectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [viewType, setViewType] = useState<'carousel' | 'cards'>('carousel');

  // Smooth navigation function with proper state management
  const navigateToIndex = useCallback((newIndex: number) => {
    if (newIndex === currentIndex) return;
    
    setIsTransitioning(true);
    setTransitionKey(prev => prev + 1);
    
    // Start transition immediately
    setCurrentIndex(newIndex);
    
    // Small delay for smooth transition
    setTimeout(() => {
      // Transition effect
    }, 100);
    
    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isTransitioning) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (viewType === 'carousel') {
          const prevIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
          navigateToIndex(prevIndex);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (viewType === 'carousel') {
          const nextIndex = (currentIndex + 1) % scenarios.length;
          navigateToIndex(nextIndex);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedScenario) {
          onSelectScenario(selectedScenario);
        } else {
          setSelectedScenario(scenarios[currentIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setSelectedScenario(null);
        break;
      case 'Tab':
        event.preventDefault();
        setViewType(prev => prev === 'carousel' ? 'cards' : 'carousel');
        break;
    }
  }, [currentIndex, selectedScenario, onSelectScenario, navigateToIndex, isTransitioning, viewType]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-update selected scenario when navigating
  useEffect(() => {
    setSelectedScenario(scenarios[currentIndex]);
  }, [currentIndex]);
  

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/30';
      case 'Medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/30';
      case 'Hard': return 'bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-500/30';
      case 'Legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 shadow-lg shadow-gray-500/30';
    }
  };

  const currentScenario = scenarios[currentIndex];

  // Render card view
  const renderCardView = () => (
    <div className="fixed inset-0 animated-bg overflow-y-auto">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl floating" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl floating" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-chart-3/10 rounded-full blur-2xl floating" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="text-center mb-8 slide-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-3 tracking-tight drop-shadow-2xl">
            Azeroth Chronicles
          </h1>
          <p className="text-white/90 text-xl font-semibold tracking-wide drop-shadow-lg">
            Choose Your Adventure
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="glass-strong rounded-xl p-2 border border-white/20">
            <div className="flex gap-2">
              <button
                onClick={() => setViewType('carousel')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewType === 'carousel'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Carousel View
              </button>
              <button
                onClick={() => setViewType('cards')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewType === 'cards'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Card View
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="relative overflow-hidden border-primary/30 shadow-xl hover:border-primary/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => onSelectScenario(scenario)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${scenario.wallpaper})`,
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95" />
                
                {/* Content */}
                <div className="relative z-10 p-6 h-80 flex flex-col justify-between">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <Badge 
                      className={`${getDifficultyColor(scenario.difficulty)} text-white shadow-lg text-sm px-3 py-1`}
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                  
                  {/* Center Content */}
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                      {scenario.title}
                    </h3>
                    <p className="text-white/90 text-sm font-semibold tracking-wide uppercase drop-shadow">
                      {scenario.expansion}
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {scenario.description}
                    </p>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>{scenario.startingLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
                      <span>{scenario.startingClass} • {scenario.startingHp} HP</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="flex justify-center mt-8">
          <div className="glass-strong rounded-xl p-4 border border-white/20 max-w-2xl">
            <p className="text-white/80 text-sm leading-relaxed text-center">
              💡 Click any scenario to begin • <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Tab</kbd> to switch views
            </p>
            <div className="text-center mt-3 pt-3 border-t border-white/10">
              <Link href="/disclaimer">
                <span className="text-xs text-white/60 hover:text-white/80 transition-colors underline cursor-pointer">
                  Legal Disclaimer
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render carousel view  
  const renderCarouselView = () => (
    <div className="fixed inset-0 animated-bg overflow-hidden">
      {/* Background Image with Key for Force Re-render */}
      <div 
        key={`bg-${transitionKey}`}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-transition parallax-bg"
        style={{
          backgroundImage: `url(${currentScenario.wallpaper})`,
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl floating" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl floating" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-chart-3/10 rounded-full blur-2xl floating" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-8">
        {/* Header */}
        <div className="text-center mb-6 slide-in">
          <div className="flex justify-between items-center w-full max-w-7xl mb-6">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-3 tracking-tight drop-shadow-2xl">
                Azeroth Chronicles
              </h1>
              <p className="text-white/90 text-xl font-semibold tracking-wide drop-shadow-lg">
                Choose Your Adventure
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {/* View Toggle */}
              <div className="glass-strong rounded-xl p-2 border border-white/20">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewType('carousel')}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
                      viewType === 'carousel'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Carousel
                  </button>
                  <button
                    onClick={() => setViewType('cards')}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
                      viewType === 'cards'
                        ? 'bg-primary text-primary-foreground shadow-lg'
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
        
        {/* Main Carousel Container */}
        <div className="flex-1 flex items-center justify-center w-full max-w-7xl">
          {/* Navigation Arrows */}
          <Button
            onClick={() => {
              const prevIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
              navigateToIndex(prevIndex);
            }}
            disabled={isTransitioning}
            variant="ghost"
            size="lg"
            className="hidden md:flex items-center justify-center w-16 h-16 rounded-full glass-strong border-white/20 text-white hover:text-primary hover:border-primary/50 transition-all duration-300 mr-8 glow-hover smooth-scale disabled:opacity-50"
          >
            <span className="text-3xl">‹</span>
          </Button>
          
          {/* Central Scenario Display */}
          <div className="flex-1 max-w-4xl">
            <Card 
              key={`card-${transitionKey}`}
              className="relative overflow-hidden border-primary/50 shadow-2xl scenario-glow carousel-transition h-[70vh] max-h-[600px]"
            >
              {/* Background Image */}
              <div 
                key={`card-bg-${transitionKey}`}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-transition"
                style={{
                  backgroundImage: `url(${currentScenario.wallpaper})`,
                }}
              />
              
              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-8">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <Badge 
                    className={`${getDifficultyColor(currentScenario.difficulty)} text-white shadow-lg text-lg px-4 py-2`}
                  >
                    {currentScenario.difficulty}
                  </Badge>
                  <div className="text-white/70 text-right">
                    <div className="text-sm">{currentIndex + 1} of {scenarios.length}</div>
                  </div>
                </div>
                
                {/* Center Content */}
                <div 
                  key={`content-${transitionKey}`}
                  className="text-center space-y-6 content-fade-in"
                >
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl carousel-transition">
                      {currentScenario.title}
                    </h2>
                    <p className="text-white/90 text-xl font-semibold tracking-wide uppercase drop-shadow-lg carousel-transition">
                      {currentScenario.expansion}
                    </p>
                  </div>
                  
                  <p className="text-white/90 text-lg leading-relaxed drop-shadow-lg max-w-2xl mx-auto carousel-transition">
                    {currentScenario.description}
                  </p>
                </div>
                
                {/* Bottom Section */}
                <div 
                  key={`details-${transitionKey}`}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 content-fade-in"
                >
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 carousel-transition hover:bg-black/50">
                    <div className="flex items-center gap-3 text-white/90">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      <span className="font-medium text-lg">Location:</span>
                    </div>
                    <p className="text-white text-lg mt-2">{currentScenario.startingLocation}</p>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 carousel-transition hover:bg-black/50">
                    <div className="flex items-center gap-3 text-white/90">
                      <span className="w-3 h-3 bg-chart-2 rounded-full"></span>
                      <span className="font-medium text-lg">Class:</span>
                    </div>
                    <p className="text-white text-lg mt-2">{currentScenario.startingClass}</p>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 carousel-transition hover:bg-black/50">
                    <div className="flex items-center gap-3 text-white/90">
                      <span className="w-3 h-3 bg-chart-3 rounded-full"></span>
                      <span className="font-medium text-lg">Health:</span>
                    </div>
                    <p className="text-white text-lg mt-2">{currentScenario.startingHp} HP</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Navigation Arrows */}
          <Button
            onClick={() => {
              const nextIndex = (currentIndex + 1) % scenarios.length;
              navigateToIndex(nextIndex);
            }}
            disabled={isTransitioning}
            variant="ghost"
            size="lg"
            className="hidden md:flex items-center justify-center w-16 h-16 rounded-full glass-strong border-white/20 text-white hover:text-primary hover:border-primary/50 transition-all duration-300 ml-8 glow-hover smooth-scale disabled:opacity-50"
          >
            <span className="text-3xl">›</span>
          </Button>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 space-y-6">
          {/* Scenario Indicators */}
          <div className="flex justify-center gap-2">
            {scenarios.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToIndex(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full carousel-transition smooth-scale disabled:opacity-50 ${
                  index === currentIndex
                    ? 'bg-primary shadow-lg shadow-primary/50 scale-125'
                    : 'bg-white/30 hover:bg-white/50 hover:scale-110'
                }`}
              />
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button
              onClick={() => onSelectScenario(currentScenario)}
              disabled={isTransitioning}
              className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-primary-foreground px-8 py-3 text-xl font-bold rounded-2xl shadow-2xl carousel-transition hover:scale-105 glow-hover smooth-scale disabled:opacity-50"
            >
              Begin {currentScenario.title}
            </Button>
            
            {/* Keyboard Instructions */}
            <div className="glass-strong rounded-xl p-4 border border-white/20 max-w-2xl mx-auto">
              <p className="text-white/80 text-sm leading-relaxed">
                💡 Use <kbd className="px-2 py-1 bg-white/20 rounded text-xs">←</kbd> <kbd className="px-2 py-1 bg-white/20 rounded text-xs">→</kbd> to navigate • <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Enter</kbd> to select • <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Tab</kbd> to switch views
              </p>
              <div className="text-center mt-3 pt-3 border-t border-white/10">
                <Link href="/disclaimer">
                  <span className="text-xs text-white/60 hover:text-white/80 transition-colors underline cursor-pointer">
                    Legal Disclaimer
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return the appropriate view based on viewType
  return viewType === 'carousel' ? renderCarouselView() : renderCardView();
}