'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DisclaimerPage() {
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
            Legal Disclaimer
          </h1>
          <p className="text-white/90 text-xl font-semibold tracking-wide drop-shadow-lg">
            Important Information About This Project
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
          {/* Intellectual Property Disclaimer */}
          <Card className="glass-strong border-primary/20 shadow-2xl fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-gradient flex items-center gap-3">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-white/90 leading-relaxed">
                <p className="text-lg font-semibold text-white">
                  This project is a fan-made tribute to the Warcraft universe.
                </p>
                
                <div className="space-y-3">
                  <p>
                    <strong>World of Warcraft®</strong>, <strong>Warcraft®</strong>, and all related characters, names, marks, and logos are trademarks and copyrights of <strong>Blizzard Entertainment, Inc.</strong>
                  </p>
                  
                  <p>
                    This project is <strong>not affiliated with, endorsed by, or sponsored by Blizzard Entertainment</strong>. All Warcraft-related content, including but not limited to:
                  </p>
                  
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Character names and lore</li>
                    <li>Location names and descriptions</li>
                    <li>Storylines and scenarios</li>
                    <li>Game mechanics and terminology</li>
                    <li>Artwork and visual themes</li>
                  </ul>
                  
                  <p>
                    are the exclusive property of Blizzard Entertainment, Inc. and are used here under the principles of fair use for educational and entertainment purposes only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Non-Commercial Use */}
          <Card className="glass border-chart-2/30 shadow-xl fade-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-chart-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></span>
                Non-Commercial Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 leading-relaxed">
              <p>
                <strong>This project is completely non-commercial and educational in nature.</strong> I do not:
              </p>
              
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Sell access to this game or any related content</li>
                <li>Charge fees for gameplay or features</li>
                <li>Monetize Blizzard&apos;s intellectual property in any way</li>
                <li>Claim ownership of any Warcraft-related content</li>
                <li>Generate revenue from Blizzard&apos;s trademarks or copyrights</li>
              </ul>
              
              <p className="text-white/90 font-semibold">
                All content is provided free of charge for entertainment purposes only.
              </p>
            </CardContent>
          </Card>

          {/* Donations Disclaimer */}
          <Card className="glass border-yellow-500/30 shadow-xl fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-yellow-500 flex items-center gap-3">
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                About Donations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 leading-relaxed">
              <p>
                Donations are <strong>voluntary contributions</strong> to support:
              </p>
              
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Development time and effort spent on this project</li>
                <li>Server hosting and infrastructure costs</li>
                <li>AI API usage costs (OpenAI, Google Gemini)</li>
                <li>General project maintenance and improvements</li>
              </ul>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-yellow-200 font-semibold">
                  Important: Donations are NOT for purchasing Blizzard content or intellectual property. 
                  They are solely to support the technical development and maintenance of this fan project.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fair Use Statement */}
          <Card className="glass border-white/20 shadow-lg fade-in" style={{animationDelay: '0.6s'}}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                Fair Use Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 leading-relaxed">
              <p>
                This project operates under the principles of <strong>Fair Use</strong> as outlined in copyright law. The use of Warcraft-related content is:
              </p>
              
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Transformative:</strong> Creating new interactive storytelling experiences</li>
                <li><strong>Non-Commercial:</strong> No profit is made from Blizzard&apos;s intellectual property</li>
                <li><strong>Educational:</strong> Demonstrates AI-powered game development techniques</li>
                <li><strong>Limited Use:</strong> Only uses necessary elements to create the fan experience</li>
              </ul>
              
              <p className="text-white/90">
                This project respects Blizzard&apos;s intellectual property rights and would be immediately removed if requested by Blizzard Entertainment.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass border-primary/20 shadow-lg fade-in" style={{animationDelay: '0.8s'}}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-primary flex items-center gap-3">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                Contact & Takedown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 leading-relaxed">
              <p>
                If you are a representative of Blizzard Entertainment and have concerns about this project, please contact me directly. I respect intellectual property rights and will respond promptly to any legitimate requests.
              </p>
              
              <p className="text-white/90 font-semibold">
                This project is created by a fan, for fans, with the utmost respect for the Warcraft universe and its creators.
              </p>
              
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
                <p className="text-primary-foreground">
                  <strong>Remember:</strong> Support the official Warcraft games and Blizzard Entertainment. This fan project should complement, not replace, official Blizzard products.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Game */}
          <div className="text-center fade-in" style={{animationDelay: '1s'}}>
            <Link href="/">
              <Button 
                className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white px-8 py-4 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 glow-hover"
              >
                Continue Your Adventure
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}