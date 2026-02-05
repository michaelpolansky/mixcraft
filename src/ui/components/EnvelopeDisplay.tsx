/**
 * Visual ADSR envelope display
 * Shows the shape of an envelope based on its parameters
 */

import type { ADSREnvelope } from '../../core/types.ts';

interface EnvelopeDisplayProps {
  envelope: ADSREnvelope;
  width?: number;
  height?: number;
  color?: string;
}

export function EnvelopeDisplay({
  envelope,
  width = 120,
  height = 60,
  color = '#4ade80',
}: EnvelopeDisplayProps) {
  const { attack, decay, sustain, release } = envelope;

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

  // Build the path
  const points = [
    `M ${padding} ${maxY + padding}`, // Start at bottom left
    `L ${padding + attackWidth} ${padding}`, // Attack to peak
    `L ${padding + attackWidth + decayWidth} ${sustainY + padding}`, // Decay to sustain
    `L ${padding + attackWidth + decayWidth + sustainWidth} ${sustainY + padding}`, // Sustain hold
    `L ${padding + attackWidth + decayWidth + sustainWidth + releaseWidth} ${maxY + padding}`, // Release to zero
  ].join(' ');

  return (
    <div
      style={{
        background: '#1a1a1a',
        borderRadius: '4px',
        padding: '4px',
        border: '1px solid #333',
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
          fillOpacity="0.1"
        />

        {/* Phase labels */}
        <text x={padding + attackWidth / 2} y={height - 2} fontSize="8" fill="#666" textAnchor="middle">
          A
        </text>
        <text x={padding + attackWidth + decayWidth / 2} y={height - 2} fontSize="8" fill="#666" textAnchor="middle">
          D
        </text>
        <text x={padding + attackWidth + decayWidth + sustainWidth / 2} y={height - 2} fontSize="8" fill="#666" textAnchor="middle">
          S
        </text>
        <text x={padding + attackWidth + decayWidth + sustainWidth + releaseWidth / 2} y={height - 2} fontSize="8" fill="#666" textAnchor="middle">
          R
        </text>
      </svg>
    </div>
  );
}
