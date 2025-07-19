'use client';

import { useGameStore } from '@/stores/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CharacterSheet() {
  const { character, scenario } = useGameStore();

  const hpPercentage = (character.hp / character.maxHp) * 100;

  return (
    <div className="fade-in" style={{animationDelay: '0.3s'}}>
      <Card className="glass-strong border-primary/20 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gradient flex items-center gap-3">
            <span className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></span>
            Character Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Character Info */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="text-2xl font-bold text-card-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              {character.name}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-chart-1/60 rounded-full"></span>
                <span className="font-medium">Level {character.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-chart-2/60 rounded-full"></span>
                <span className="font-medium">{character.class}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-chart-3/60 rounded-full"></span>
              <span className="font-medium">Location:</span>
              <span className="text-card-foreground/80">{character.location}</span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-chart-4 rounded-full"></span>
                <span className="text-primary font-semibold">Health</span>
              </div>
              <span className="text-card-foreground font-bold">
                {character.hp}/{character.maxHp}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-muted/30 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-700 shadow-lg ${
                    hpPercentage > 75
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : hpPercentage > 50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                      : hpPercentage > 25
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Inventory */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-chart-5 rounded-full"></span>
              <span className="text-primary font-semibold">Inventory</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {character.inventory.length > 0 ? (
                character.inventory.map((item, index) => (
                  <div
                    key={index}
                    className="glass rounded-lg px-3 py-2 border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-chart-5/60 rounded-full group-hover:bg-chart-5 transition-colors"></span>
                      <span className="text-card-foreground/80 group-hover:text-card-foreground text-sm font-medium transition-colors">
                        {item}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground italic text-center py-4 glass rounded-lg border border-dashed border-border/30">
                  Empty inventory
                </div>
              )}
            </div>
          </div>

          {/* Scenario Info */}
          <div className="glass rounded-xl p-4 border-t-2 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary font-semibold">Current Scenario</span>
            </div>
            <div className="text-card-foreground/80 font-medium">{scenario}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}