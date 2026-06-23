/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface MetricDialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  animate?: boolean;
}

export default function MetricDial({
  score,
  size = 180,
  strokeWidth = 14,
  title,
  animate = true
}: MetricDialProps) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const progress = Math.min(Math.max(score, 0), 100);
    const progressOffset = circumference - (progress / 100) * circumference;
    
    if (animate) {
      const timer = setTimeout(() => {
        setOffset(progressOffset);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setOffset(progressOffset);
    }
  }, [score, circumference, animate]);

  // Determine color theme based on score tier
  const getColors = (s: number) => {
    if (s >= 85) return { 
      stroke: '#4ADE80', 
      text: 'text-brand-success', 
      bgGlow: 'bg-brand-success/10',
      label: 'OUTSTANDING'
    };
    if (s >= 70) return { 
      stroke: '#E8C77C', 
      text: 'text-brand-primary', 
      bgGlow: 'bg-brand-primary/10',
      label: 'EXCELLENT'
    };
    if (s >= 50) return { 
      stroke: '#9C824F', 
      text: 'text-brand-secondary', 
      bgGlow: 'bg-brand-secondary/10',
      label: 'UNDERPERFORMING'
    };
    return { 
      stroke: '#E07856', 
      text: 'text-brand-danger', 
      bgGlow: 'bg-brand-danger/10',
      label: 'CRITICAL DESIGN'
    };
  };

  const theme = getColors(score);

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center select-none" id={`dial-${title || 'score'}`}>
      <div className={`relative flex items-center justify-center rounded-full p-6 ${theme.bgGlow} transition duration-500`}>
        {/* SVG Circle Graph */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1A2438"
            strokeWidth={strokeWidth - 2}
          />

          {/* Animated Value Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Outer Circular Glow Overlay */}
        <div 
          className="absolute inset-0 rounded-full border border-brand-border/60 pointer-events-none" 
          style={{ margin: '14px' }}
        />

        {/* Center Text Readout */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-black tracking-tighter text-[#F4F1EA] sm:text-6xl">
            {score}
          </span>
          <span className="font-mono text-[9px] font-bold tracking-widest text-[#7B8FA8] mt-1 uppercase">
            Score
          </span>
        </div>
      </div>

      {title && (
        <div className="mt-4">
          <p className="font-display text-sm font-bold text-slate-200 uppercase tracking-wide">{title}</p>
          <span className={`font-mono text-[10px] font-extrabold tracking-widest ${theme.text}`}>
            {theme.label}
          </span>
        </div>
      )}
    </div>
  );
}
