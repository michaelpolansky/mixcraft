/**
 * Envelope Visualizer
 * Educational display showing amplitude and filter envelopes side by side
 * With labeled phases and timing information
 */

import type { ADSREnvelope, FilterEnvelopeParams } from '../../core/types.ts';

interface EnvelopeVisualizerProps {
  /** Amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** Filter envelope (optional) */
  filterEnvelope?: FilterEnvelopeParams;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color for amplitude envelope */
  ampColor?: string;
  /** Accent color for filter envelope */
  filterColor?: string;
}

// Phase descriptions for educational display
const PHASE_INFO = {
  attack: 'Attack: Time to reach peak',
  decay: 'Decay: Time to fall to sustain',
  sustain: 'Sustain: Level while held',
  release: 'Release: Time to fade out',
};

export function EnvelopeVisualizer({
  amplitudeEnvelope,
  filterEnvelope,
  width = 450,
  height = 150,
  ampColor = '#4ade80',
  filterColor = '#3b82f6',
}: EnvelopeVisualizerProps) {
  const padding = 16;
  const labelHeight = 24;
  const graphHeight = height - labelHeight - padding * 2;
  const graphWidth = width - padding * 2;

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds >= 1) return `${seconds.toFixed(1)}s`;
    return `${Math.round(seconds * 1000)}ms`;
  };

  // Calculate envelope path
  const buildEnvelopePath = (
    envelope: ADSREnvelope,
    startX: number,
    baseY: number,
    maxWidth: number,
    maxHeight: number
  ): { path: string; points: { x: number; label: string }[] } => {
    const { attack, decay, sustain, release } = envelope;

    // Normalize times (max 2s per segment for display)
    const maxTime = 2;
    const segmentWidth = maxWidth / 4;

    const attackWidth = (Math.min(attack, maxTime) / maxTime) * segmentWidth;
    const decayWidth = (Math.min(decay, maxTime) / maxTime) * segmentWidth;
    const sustainWidth = segmentWidth;
    const releaseWidth = (Math.min(release, maxTime) / maxTime) * segmentWidth;

    const sustainY = baseY - sustain * maxHeight;
    const peakY = baseY - maxHeight;

    const p1 = { x: startX, y: baseY };
    const p2 = { x: startX + attackWidth, y: peakY };
    const p3 = { x: startX + attackWidth + decayWidth, y: sustainY };
    const p4 = { x: startX + attackWidth + decayWidth + sustainWidth, y: sustainY };
    const p5 = { x: startX + attackWidth + decayWidth + sustainWidth + releaseWidth, y: baseY };

    const path = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} L ${p5.x} ${p5.y}`;

    return {
      path,
      points: [
        { x: p1.x, label: 'Start' },
        { x: p2.x, label: formatTime(attack) },
        { x: p3.x, label: formatTime(decay) },
        { x: p4.x, label: '' },
        { x: p5.x, label: formatTime(release) },
      ],
    };
  };

  const baseY = padding + graphHeight;
  const ampEnv = buildEnvelopePath(amplitudeEnvelope, padding, baseY, graphWidth, graphHeight);

  // Filter envelope uses same ADSR structure
  const filterEnv = filterEnvelope
    ? buildEnvelopePath(
        {
          attack: filterEnvelope.attack,
          decay: filterEnvelope.decay,
          sustain: filterEnvelope.sustain,
          release: filterEnvelope.release,
        },
        padding,
        baseY,
        graphWidth,
        graphHeight
      )
    : null;

  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <svg width={width} height={height}>
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="#141414" />

        {/* Phase background regions */}
        <rect x={padding} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(74, 222, 128, 0.05)" />
        <rect x={padding + graphWidth / 4} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(251, 191, 36, 0.05)" />
        <rect x={padding + (graphWidth / 4) * 2} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(96, 165, 250, 0.05)" />
        <rect x={padding + (graphWidth / 4) * 3} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(244, 114, 182, 0.05)" />

        {/* Grid lines */}
        <line x1={padding} y1={baseY} x2={padding + graphWidth} y2={baseY} stroke="#333" strokeWidth={1} />
        <line x1={padding} y1={padding} x2={padding + graphWidth} y2={padding} stroke="#222" strokeWidth={1} strokeDasharray="4,4" />
        <line x1={padding} y1={baseY - graphHeight / 2} x2={padding + graphWidth} y2={baseY - graphHeight / 2} stroke="#222" strokeWidth={1} strokeDasharray="4,4" />

        {/* Phase separators */}
        {[1, 2, 3].map((i) => (
          <line
            key={i}
            x1={padding + (graphWidth / 4) * i}
            y1={padding}
            x2={padding + (graphWidth / 4) * i}
            y2={baseY}
            stroke="#333"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Filter envelope (behind, if present) */}
        {filterEnv && (
          <>
            <path
              d={`${filterEnv.path} L ${padding + graphWidth} ${baseY} L ${padding} ${baseY} Z`}
              fill={filterColor}
              fillOpacity={0.15}
            />
            <path
              d={filterEnv.path}
              fill="none"
              stroke={filterColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6,3"
            />
          </>
        )}

        {/* Amplitude envelope (front) */}
        <path
          d={`${ampEnv.path} L ${padding + graphWidth} ${baseY} L ${padding} ${baseY} Z`}
          fill={ampColor}
          fillOpacity={0.2}
        />
        <path
          d={ampEnv.path}
          fill="none"
          stroke={ampColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Phase labels */}
        <text x={padding + graphWidth / 8} y={height - 6} fontSize="11" fill="#4ade80" textAnchor="middle" fontWeight="600">
          ATTACK
        </text>
        <text x={padding + (graphWidth / 8) * 3} y={height - 6} fontSize="11" fill="#fbbf24" textAnchor="middle" fontWeight="600">
          DECAY
        </text>
        <text x={padding + (graphWidth / 8) * 5} y={height - 6} fontSize="11" fill="#60a5fa" textAnchor="middle" fontWeight="600">
          SUSTAIN
        </text>
        <text x={padding + (graphWidth / 8) * 7} y={height - 6} fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="600">
          RELEASE
        </text>

        {/* Y-axis labels */}
        <text x={padding - 4} y={padding + 4} fontSize="9" fill="#666" textAnchor="end">
          100%
        </text>
        <text x={padding - 4} y={baseY - graphHeight / 2 + 3} fontSize="9" fill="#666" textAnchor="end">
          50%
        </text>
        <text x={padding - 4} y={baseY + 3} fontSize="9" fill="#666" textAnchor="end">
          0%
        </text>

        {/* Sustain level indicator */}
        <line
          x1={padding + graphWidth / 2}
          y1={baseY - amplitudeEnvelope.sustain * graphHeight}
          x2={padding + (graphWidth / 4) * 3}
          y2={baseY - amplitudeEnvelope.sustain * graphHeight}
          stroke={ampColor}
          strokeWidth={1}
          strokeDasharray="2,2"
        />
        <text
          x={padding + (graphWidth / 4) * 2.5}
          y={baseY - amplitudeEnvelope.sustain * graphHeight - 4}
          fontSize="9"
          fill={ampColor}
          textAnchor="middle"
        >
          {Math.round(amplitudeEnvelope.sustain * 100)}%
        </text>

        {/* Legend */}
        {filterEnvelope && (
          <>
            <rect x={width - 100} y={padding} width={12} height={3} fill={ampColor} rx={1} />
            <text x={width - 84} y={padding + 4} fontSize="9" fill="#888">
              Amplitude
            </text>
            <line x1={width - 100} y1={padding + 12} x2={width - 88} y2={padding + 12} stroke={filterColor} strokeWidth={2} strokeDasharray="4,2" />
            <text x={width - 84} y={padding + 15} fontSize="9" fill="#888">
              Filter
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
