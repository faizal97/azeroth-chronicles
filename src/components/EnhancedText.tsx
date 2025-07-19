'use client';

import React, { useState, useEffect } from 'react';

interface EnhancedTextProps {
  text: string;
  scenario?: string;
  className?: string;
  enableEnhancement?: boolean;
}

export function EnhancedText({ 
  text, 
  scenario, 
  className = '', 
  enableEnhancement = true 
}: EnhancedTextProps) {
  // Always return plain text without any processing
  return <span className={className}>{text}</span>;
}


// Specific components for different content types - simplified approach
export function EnhancedParagraph({ children, scenario, enableEnhancement = true, ...props }: React.HTMLProps<HTMLParagraphElement> & {
  scenario?: string;
  enableEnhancement?: boolean;
}) {
  return <p {...props}>{children}</p>;
}

export function EnhancedDiv({ children, scenario, enableEnhancement = true, ...props }: React.HTMLProps<HTMLDivElement> & {
  scenario?: string;
  enableEnhancement?: boolean;
}) {
  return <div {...props}>{children}</div>;
}

export function EnhancedSpan({ children, scenario, enableEnhancement = true, ...props }: React.HTMLProps<HTMLSpanElement> & {
  scenario?: string;
  enableEnhancement?: boolean;
}) {
  return <span {...props}>{children}</span>;
}

// Component for highlighting dialogue with speaker detection
interface EnhancedDialogueProps {
  content: string;
  speaker?: string;
  speakerTitle?: string;
  scenario?: string;
  className?: string;
  enableEnhancement?: boolean;
}

export function EnhancedDialogue({
  content,
  speaker,
  speakerTitle,
  scenario,
  className = '',
  enableEnhancement = true
}: EnhancedDialogueProps) {
  return (
    <div className={className}>
      {speaker && (
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-chart-2">{speaker}</span>
          {speakerTitle && (
            <span className="text-xs bg-chart-2/20 text-chart-2 px-2 py-0.5 rounded">
              {speakerTitle}
            </span>
          )}
        </div>
      )}
      <div className="text-card-foreground/90 italic">
        &quot;{content}&quot;
      </div>
    </div>
  );
}

// Component for highlighting narrative text with enhanced formatting
interface EnhancedNarrativeProps {
  content: string;
  scenario?: string;
  className?: string;
  enableEnhancement?: boolean;
}

export function EnhancedNarrative({
  content,
  scenario,
  className = '',
  enableEnhancement = true
}: EnhancedNarrativeProps) {
  // Simple paragraph formatting without any enhancement
  const formatWithParagraphs = (text: string) => {
    if (text.includes('\n\n')) {
      return text.split('\n\n').map((paragraph, index) => (
        <p key={index} className="text-base leading-7 mb-4 last:mb-0">
          {paragraph.trim()}
        </p>
      ));
    }
    
    return (
      <p className="text-base leading-7">
        {text}
      </p>
    );
  };

  return (
    <div className={className}>
      {formatWithParagraphs(content)}
    </div>
  );
}

// Utility hook for managing highlighting preferences
export function useEnhancementPreferences() {
  const [enableEnhancement, setEnableEnhancement] = useState(true);
  const [enhancementIntensity, setEnhancementIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('enhancement-preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setEnableEnhancement(prefs.enabled ?? true);
        setEnhancementIntensity(prefs.intensity ?? 'medium');
      } catch (error) {
        console.warn('Failed to load enhancement preferences:', error);
      }
    }
  }, []);

  const savePreferences = (enabled: boolean, intensity: 'low' | 'medium' | 'high') => {
    setEnableEnhancement(enabled);
    setEnhancementIntensity(intensity);
    localStorage.setItem('enhancement-preferences', JSON.stringify({
      enabled,
      intensity
    }));
  };

  return {
    enableEnhancement,
    enhancementIntensity,
    setEnableEnhancement: (enabled: boolean) => savePreferences(enabled, enhancementIntensity),
    setEnhancementIntensity: (intensity: 'low' | 'medium' | 'high') => savePreferences(enableEnhancement, intensity),
    savePreferences
  };
}