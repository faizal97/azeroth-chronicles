import * as React from "react"
import { cn } from "@/lib/utils"

interface ArcaneSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}

export function ArcaneSpinner({ size = 'md', className, ...props }: ArcaneSpinnerProps) {
  return (
    <div className={cn("relative", sizeClasses[size], className)} {...props}>
      {/* Outer rotating ring */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '3s' }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#arcaneGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="70 200"
        />
        <defs>
          <linearGradient id="arcaneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.16 70)" />
            <stop offset="50%" stopColor="oklch(0.55 0.18 280)" />
            <stop offset="100%" stopColor="oklch(0.72 0.16 70)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner counter-rotating ring */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="oklch(0.55 0.18 280 / 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="40 150"
        />
      </svg>

      {/* Runic symbols */}
      <svg
        className="absolute inset-0 animate-pulse"
        style={{ animationDuration: '2s' }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Runic symbol 1 - top */}
        <text
          x="50"
          y="20"
          textAnchor="middle"
          fill="oklch(0.72 0.16 70)"
          fontSize="12"
          fontFamily="serif"
        >
          &#x16A0;
        </text>
        {/* Runic symbol 2 - right */}
        <text
          x="85"
          y="55"
          textAnchor="middle"
          fill="oklch(0.55 0.18 280)"
          fontSize="12"
          fontFamily="serif"
        >
          &#x16A2;
        </text>
        {/* Runic symbol 3 - bottom */}
        <text
          x="50"
          y="90"
          textAnchor="middle"
          fill="oklch(0.72 0.16 70)"
          fontSize="12"
          fontFamily="serif"
        >
          &#x16B1;
        </text>
        {/* Runic symbol 4 - left */}
        <text
          x="15"
          y="55"
          textAnchor="middle"
          fill="oklch(0.55 0.18 280)"
          fontSize="12"
          fontFamily="serif"
        >
          &#x16C7;
        </text>
      </svg>

      {/* Center glow */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-3 h-3 rounded-full bg-[oklch(0.60_0.20_280)] animate-pulse"
          style={{
            boxShadow: '0 0 15px oklch(0.60 0.20 280 / 0.6), 0 0 30px oklch(0.55 0.18 280 / 0.4)',
            animationDuration: '1.5s'
          }}
        />
      </div>
    </div>
  )
}
