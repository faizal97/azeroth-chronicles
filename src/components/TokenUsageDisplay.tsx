'use client';

import React from 'react';
import { estimateTokenUsage, formatTokenCount, getCostColor, getCostDescription, TokenEstimate, EstimationParams } from '@/lib/tokenEstimator';

interface TokenUsageDisplayProps {
  estimationParams: EstimationParams;
  className?: string;
  showDetails?: boolean;
}

export function TokenUsageDisplay({ estimationParams, className = '', showDetails = false }: TokenUsageDisplayProps) {
  const estimate = estimateTokenUsage(estimationParams);
  const costColor = getCostColor(estimate.costTier);
  const costDesc = getCostDescription(estimate.costTier);

  if (showDetails) {
    return (
      <div className={`text-xs space-y-1 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Estimated Token Usage:</span>
          <span className={`font-semibold ${costColor}`}>
            {formatTokenCount(estimate.total)} tokens
          </span>
        </div>
        <div className="text-slate-500 space-y-0.5">
          <div className="flex justify-between">
            <span>Input (context):</span>
            <span>{formatTokenCount(estimate.input)}</span>
          </div>
          <div className="flex justify-between">
            <span>Output (response):</span>
            <span>{formatTokenCount(estimate.output)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Cost tier:</span>
            <span className={costColor}>{costDesc}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <span className="text-slate-400">Est. tokens:</span>
      <span className={`font-semibold ${costColor}`}>
        {formatTokenCount(estimate.total)}
      </span>
      <span className={`text-xs ${costColor}`}>
        ({costDesc})
      </span>
    </div>
  );
}

export function useTokenEstimate(estimationParams: EstimationParams): TokenEstimate {
  return estimateTokenUsage(estimationParams);
}