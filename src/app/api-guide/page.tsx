'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApiKeyManual } from '@/components/ApiKeyManual';

export default function ApiGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4 glass border-primary/50 text-primary hover:bg-primary/10">
              ← Back to Game
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            API Key Setup Guide
          </h1>
          <p className="text-slate-400 text-lg">
            Complete instructions for setting up your AI provider
          </p>
        </div>

        {/* Main Content */}
        <ApiKeyManual />

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-bold px-8 py-3">
              Ready to Play? Start Your Adventure
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}