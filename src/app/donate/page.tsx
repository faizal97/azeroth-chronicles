'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="min-h-screen animated-bg p-6">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl floating" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl floating" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-chart-3/10 rounded-full blur-2xl floating" style={{animationDelay: '4s'}} />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 slide-in">
          <h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight drop-shadow-2xl">
            Support Azeroth Chronicles
          </h1>
          <p className="text-white/90 text-xl font-semibold tracking-wide drop-shadow-lg">
            Help keep this adventure alive
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="outline" 
              className="glass border-primary/50 text-primary hover:glass-strong hover:border-primary hover:text-primary glow-hover transition-all duration-300 px-6 py-3"
            >
              ← Back to Game
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {/* Donation Card */}
          <Card className="glass-strong border-primary/20 shadow-2xl fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-gradient flex items-center gap-3">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                Buy Me a Coffee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-6">
                {/* Coffee Icon */}
                <div className="text-6xl mb-4">☕</div>
                
                <div className="space-y-4">
                  <p className="text-white/90 text-lg leading-relaxed">
                    Enjoying your adventures in Azeroth? Your support helps keep this project running and enables new features!
                  </p>
                  
                  <p className="text-white/80 text-base leading-relaxed">
                    Development takes time and coffee. Lots of coffee. If you'd like to fuel future updates, 
                    epic new scenarios, and gameplay improvements, consider buying me a coffee!
                  </p>
                </div>

                {/* Donation Button */}
                <div className="pt-4">
                  <a 
                    href="https://coff.ee/faizalputra" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-8 py-4 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 glow-hover"
                    >
                      ☕ Buy Me a Coffee
                    </Button>
                  </a>
                </div>

                {/* Additional Info */}
                <div className="bg-black/20 rounded-lg p-4 space-y-3 mt-6">
                  <h4 className="font-semibold text-white text-lg">What your support enables:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>New Warcraft scenarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
                      <span>Enhanced AI interactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-chart-3 rounded-full"></span>
                      <span>More character options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-chart-4 rounded-full"></span>
                      <span>UI/UX improvements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-chart-5 rounded-full"></span>
                      <span>Server hosting costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>More coffee for late-night coding</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Card */}
          <Card className="glass border-chart-2/30 shadow-xl fade-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-chart-2">Thank You!</h3>
                <p className="text-white/80 leading-relaxed">
                  Whether you donate or not, thank you for playing Azeroth Chronicles! 
                  Your feedback and enthusiasm for the game is what makes development worthwhile.
                </p>
                <p className="text-white/70 text-sm">
                  May your adventures be legendary! ⚔️
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="glass border-white/10 shadow-lg fade-in" style={{animationDelay: '0.4s'}}>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <h4 className="text-lg font-semibold text-white">Questions or Suggestions?</h4>
                <p className="text-white/70 text-sm">
                  Feel free to reach out if you have ideas for improvements or encounter any issues.
                </p>
                <p className="text-white/60 text-xs">
                  This project is a labor of love for the Warcraft community.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}