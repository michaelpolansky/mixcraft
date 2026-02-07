/**
 * Visual ADSR envelope display with animated playhead
 * Shows the shape of an envelope and animates when notes are triggered
 */

import { useEffect, useRef, useState } from 'react';
import type { ADSREnvelope } from '../../core/types.ts';

interface EnvelopeDisplayProps {
  envelope: ADSREnvelope;
  width?: number;
  height?: number;
  color?: string;
  /** When true, animates the playhead through attack, decay, sustain phases */
  isTriggered?: boolean;
}

type EnvelopePhase = 'idle' | 'attack' | 'decay' | 'sustain' | 'release';

export function EnvelopeDisplay({
  envelope,
  width = 120,
  height = 60,
  color = '#4ade80',
  isTriggered = false,
}: EnvelopeDisplayProps) {
  const { attack, decay, sustain, release } = envelope;
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [playheadX, setPlayheadX] = useState(0);
  const [playheadY, setPlayheadY] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const phaseStartTimeRef = useRef<number>(0);
  const wasTriggeredRef = useRef(false);

  // Normalize times for display (max 2s each segment)
  const maxTime = 2;
  const totalWidth = width - 8; // Padding
  const attackWidth = (Math.min(attack, maxTime) / maxTime) * (totalWidth / 4);
  const decayWidth = (Math.min(decay, maxTime) / maxTime) * (totalWidth / 4);
  const sustainWidth = totalWidth / 4;
  const releaseWidth = (Math.min(release, maxTime) / maxTime) * (totalWidth / 4);

  // Calculate Y positions
  const padding = 4;
  const maxY = height - padding * 2;
  const sustainY = maxY * (1 - sustain);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      const elapsed = (now - phaseStartTimeRef.current) / 1000; // Convert to seconds

      let newX = padding;
      let newY = maxY + padding;

      if (phase === 'attack') {
        const attackTime = Math.min(attack, maxTime);
        const progress = Math.min(elapsed / attackTime, 1);
        newX = padding + progress * attackWidth;
        newY = padding + maxY * (1 - progress);

        if (progress >= 1) {
          setPhase('decay');
          phaseStartTimeRef.current = now;
        }
      } else if (phase === 'decay') {
        const decayTime = Math.min(decay, maxTime);
        const progress = Math.min(elapsed / decayTime, 1);
        newX = padding + attackWidth + progress * decayWidth;
        // Interpolate from peak (0) to sustain level
        newY = padding + progress * sustainY;

        if (progress >= 1) {
          setPhase('sustain');
          phaseStartTimeRef.current = now;
        }
      } else if (phase === 'sustain') {
        // Move slowly across sustain section
        const sustainTime = Math.min(maxTime, 1); // 1 second sustain display
        const progress = Math.min(elapsed / sustainTime, 1);
        newX = padding + attackWidth + decayWidth + progress * sustainWidth;
        newY = sustainY + padding;
        // Stay in sustain until note is released (handled by isTriggered change)
      } else if (phase === 'release') {
        const releaseTime = Math.min(release, maxTime);
        const progress = Math.min(elapsed / releaseTime, 1);
        newX = padding + attackWidth + decayWidth + sustainWidth + progress * releaseWidth;
        // Interpolate from sustain level to bottom
        newY = sustainY + padding + progress * (maxY - sustainY);

        if (progress >= 1) {
          setPhase('idle');
        }
      }

      if (phase !== 'idle') {
        setPlayheadX(newX);
        setPlayheadY(newY);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (phase !== 'idle') {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, attack, decay, sustain, release, attackWidth, decayWidth, sustainWidth, releaseWidth, sustainY, maxY, padding, maxTime]);

  // Handle trigger state changes
  useEffect(() => {
    if (isTriggered && !wasTriggeredRef.current) {
      // Note pressed - start attack phase
      setPhase('attack');
      phaseStartTimeRef.current = performance.now();
      setPlayheadX(padding);
      setPlayheadY(maxY + padding);
    } else if (!isTriggered && wasTriggeredRef.current && phase !== 'idle' && phase !== 'release') {
      // Note released - start release phase
      setPhase('release');
      phaseStartTimeRef.current = performance.now();
    }
    wasTriggeredRef.current = isTriggered;
  }, [isTriggered, phase, padding, maxY]);

  // Build the path
  const points = [
    `M ${padding} ${maxY + padding}`, // Start at bottom left
    `L ${padding + attackWidth} ${padding}`, // Attack to peak
    `L ${padding + attackWidth + decayWidth} ${sustainY + padding}`, // Decay to sustain
    `L ${padding + attackWidth + decayWidth + sustainWidth} ${sustainY + padding}`, // Sustain hold
    `L ${padding + attackWidth + decayWidth + sustainWidth + releaseWidth} ${maxY + padding}`, // Release to zero
  ].join(' ');

  const isAnimating = phase !== 'idle';

  return (
    <div
      style={{
        background: '#1a1a1a',
        borderRadius: '4px',
        padding: '4px',
        border: `1px solid ${isAnimating ? color : '#333'}`,
        transition: 'border-color 0.15s',
      }}
    >
      <svg width={width} height={height}>
        {/* Grid */}
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#222"
          strokeWidth="1"
        />

        {/* Envelope path */}
        <path
          d={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Filled area */}
        <path
          d={`${points} L ${padding + attackWidth + decayWidth + sustainWidth + releaseWidth} ${maxY + padding} L ${padding} ${maxY + padding} Z`}
          fill={color}
          fillOpacity={isAnimating ? "0.2" : "0.1"}
        />

        {/* Playhead dot when animating */}
        {isAnimating && (
          <>
            {/* Glow */}
            <circle
              cx={playheadX}
              cy={playheadY}
              r={8}
              fill={color}
              opacity={0.3}
            />
            {/* Main dot */}
            <circle
              cx={playheadX}
              cy={playheadY}
              r={5}
              fill={color}
            />
            {/* White center */}
            <circle
              cx={playheadX}
              cy={playheadY}
              r={2}
              fill="#fff"
            />
          </>
        )}

        {/* Phase labels */}
        <text x={padding + attackWidth / 2} y={height - 2} fontSize="8" fill={phase === 'attack' ? color : '#666'} textAnchor="middle">
          A
        </text>
        <text x={padding + attackWidth + decayWidth / 2} y={height - 2} fontSize="8" fill={phase === 'decay' ? color : '#666'} textAnchor="middle">
          D
        </text>
        <text x={padding + attackWidth + decayWidth + sustainWidth / 2} y={height - 2} fontSize="8" fill={phase === 'sustain' ? color : '#666'} textAnchor="middle">
          S
        </text>
        <text x={padding + attackWidth + decayWidth + sustainWidth + releaseWidth / 2} y={height - 2} fontSize="8" fill={phase === 'release' ? color : '#666'} textAnchor="middle">
          R
        </text>
      </svg>
    </div>
  );
}
