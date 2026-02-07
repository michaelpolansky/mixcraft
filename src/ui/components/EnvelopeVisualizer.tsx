/**
 * EnvelopeVisualizer - Draggable ADSR envelope visualization
 * Ableton Learning Synths-style interactive envelope display with animated playhead
 */

import React, { useRef, useEffect, useCallback, useState, memo } from 'react';

type EnvelopePhase = 'idle' | 'attack' | 'decay' | 'sustain' | 'release';

interface EnvelopeVisualizerProps {
  attack: number;      // 0-2 seconds
  decay: number;       // 0-2 seconds
  sustain: number;     // 0-1 level
  release: number;     // 0-4 seconds
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  accentColor?: string;
  width?: number;
  height?: number;
  activePhase?: 'attack' | 'decay' | 'sustain' | 'release' | null;
  playheadPosition?: number; // 0-1 normalized position through envelope
  label?: string;
  compact?: boolean; // Remove labels and reduce padding for small sizes
  /** When true, animates a playhead dot along the envelope curve */
  isTriggered?: boolean;
}

// Parameter ranges
const ATTACK_MAX = 2;
const DECAY_MAX = 2;
const RELEASE_MAX = 4;

// Envelope segment widths (normalized)
const ATTACK_WIDTH = 0.2;
const DECAY_WIDTH = 0.2;
const SUSTAIN_WIDTH = 0.3;
const RELEASE_WIDTH = 0.3;

const EnvelopeVisualizerComponent: React.FC<EnvelopeVisualizerProps> = ({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  accentColor = '#22c55e',
  width = 500,
  height = 200,
  activePhase = null,
  playheadPosition,
  label,
  compact = false,
  isTriggered = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragTarget, setDragTarget] = useState<'attack' | 'decay' | 'sustain' | 'release' | null>(null);
  const [hoverTarget, setHoverTarget] = useState<'attack' | 'decay' | 'sustain' | 'release' | null>(null);

  // Animation state for playhead
  const [animPhase, setAnimPhase] = useState<EnvelopePhase>('idle');
  const [playheadX, setPlayheadX] = useState(0);
  const [playheadY, setPlayheadY] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const phaseStartTimeRef = useRef<number>(0);
  const wasTriggeredRef = useRef(false);

  // Convert parameters to pixel positions
  const getEnvelopePoints = useCallback((w: number, h: number) => {
    const padding = compact ? 8 : 30;
    const topPadding = compact ? 8 : (label ? 40 : 20);
    const bottomPadding = compact ? 8 : 30;
    const drawWidth = w - padding * 2;
    const drawHeight = h - topPadding - bottomPadding;

    // Calculate x positions based on parameter values and segment allocations
    const attackX = padding + (attack / ATTACK_MAX) * ATTACK_WIDTH * drawWidth;
    const decayEndX = padding + ATTACK_WIDTH * drawWidth + (decay / DECAY_MAX) * DECAY_WIDTH * drawWidth;
    const sustainEndX = padding + (ATTACK_WIDTH + DECAY_WIDTH + SUSTAIN_WIDTH) * drawWidth;
    const releaseEndX = padding + drawWidth;

    // Y positions (inverted - 0 is top)
    const topY = topPadding;
    const sustainY = topPadding + (1 - sustain) * drawHeight;
    const bottomY = topPadding + drawHeight;

    return {
      start: { x: padding, y: bottomY },
      attackPeak: { x: attackX, y: topY },
      decayEnd: { x: decayEndX, y: sustainY },
      sustainEnd: { x: sustainEndX, y: sustainY },
      releaseEnd: { x: releaseEndX, y: bottomY },
      padding,
      topPadding,
      drawWidth,
      drawHeight,
    };
  }, [attack, decay, sustain, release, label, compact]);

  // Check if point is near a control point
  const getControlPointAt = useCallback((x: number, y: number, points: ReturnType<typeof getEnvelopePoints>) => {
    const hitRadius = 15;

    const dist = (px: number, py: number) => Math.sqrt((x - px) ** 2 + (y - py) ** 2);

    if (dist(points.attackPeak.x, points.attackPeak.y) < hitRadius) return 'attack';
    if (dist(points.decayEnd.x, points.decayEnd.y) < hitRadius) return 'decay';
    // Sustain can be dragged anywhere along the sustain line
    if (y > points.sustainEnd.y - hitRadius && y < points.sustainEnd.y + hitRadius &&
        x > points.decayEnd.x && x < points.sustainEnd.x) return 'sustain';
    if (dist(points.releaseEnd.x, points.releaseEnd.y) < hitRadius) return 'release';

    return null;
  }, []);

  // Animation loop for playhead
  useEffect(() => {
    if (animPhase === 'idle') return;

    const points = getEnvelopePoints(width, height);
    const animate = () => {
      const now = performance.now();
      const elapsed = (now - phaseStartTimeRef.current) / 1000;

      let newX = points.start.x;
      let newY = points.start.y;
      let nextPhase: EnvelopePhase = animPhase;

      if (animPhase === 'attack') {
        const progress = Math.min(elapsed / Math.max(attack, 0.001), 1);
        // Interpolate from start to attack peak
        newX = points.start.x + progress * (points.attackPeak.x - points.start.x);
        newY = points.start.y + progress * (points.attackPeak.y - points.start.y);
        if (progress >= 1) {
          nextPhase = 'decay';
          phaseStartTimeRef.current = now;
        }
      } else if (animPhase === 'decay') {
        const progress = Math.min(elapsed / Math.max(decay, 0.001), 1);
        // Interpolate from attack peak to decay end
        newX = points.attackPeak.x + progress * (points.decayEnd.x - points.attackPeak.x);
        newY = points.attackPeak.y + progress * (points.decayEnd.y - points.attackPeak.y);
        if (progress >= 1) {
          nextPhase = 'sustain';
          phaseStartTimeRef.current = now;
        }
      } else if (animPhase === 'sustain') {
        // Move slowly across sustain section (1 second max)
        const sustainDisplayTime = 1;
        const progress = Math.min(elapsed / sustainDisplayTime, 1);
        newX = points.decayEnd.x + progress * (points.sustainEnd.x - points.decayEnd.x);
        newY = points.sustainEnd.y;
        // Stay in sustain until note is released
      } else if (animPhase === 'release') {
        const progress = Math.min(elapsed / Math.max(release, 0.001), 1);
        // Interpolate from sustain end to release end
        newX = points.sustainEnd.x + progress * (points.releaseEnd.x - points.sustainEnd.x);
        newY = points.sustainEnd.y + progress * (points.releaseEnd.y - points.sustainEnd.y);
        if (progress >= 1) {
          nextPhase = 'idle';
        }
      }

      setPlayheadX(newX);
      setPlayheadY(newY);

      if (nextPhase !== animPhase) {
        setAnimPhase(nextPhase);
      }

      if (nextPhase !== 'idle') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animPhase, attack, decay, release, width, height, getEnvelopePoints]);

  // Handle trigger state changes
  useEffect(() => {
    const points = getEnvelopePoints(width, height);

    if (isTriggered && !wasTriggeredRef.current) {
      // Note pressed - start attack phase
      setAnimPhase('attack');
      phaseStartTimeRef.current = performance.now();
      setPlayheadX(points.start.x);
      setPlayheadY(points.start.y);
    } else if (!isTriggered && wasTriggeredRef.current && animPhase !== 'idle' && animPhase !== 'release') {
      // Note released - start release phase
      setAnimPhase('release');
      phaseStartTimeRef.current = performance.now();
      // Reset playhead to sustain end for release phase
      setPlayheadX(points.sustainEnd.x);
      setPlayheadY(points.sustainEnd.y);
    }
    wasTriggeredRef.current = isTriggered;
  }, [isTriggered, animPhase, width, height, getEnvelopePoints]);

  const isAnimating = animPhase !== 'idle';

  // Draw the envelope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const points = getEnvelopePoints(width, height);

    // Draw label if provided (and not in compact mode)
    if (label && !compact) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, points.padding, 24);
    }

    // Draw grid (only in non-compact mode)
    if (!compact) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      // Horizontal lines (amplitude levels)
      for (let i = 0; i <= 4; i++) {
        const y = points.topPadding + (points.drawHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(points.padding, y);
        ctx.lineTo(points.padding + points.drawWidth, y);
        ctx.stroke();
      }

      // Draw segment labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';

      const segmentCenters = [
        { x: points.padding + ATTACK_WIDTH * points.drawWidth * 0.5, label: 'A' },
        { x: points.padding + (ATTACK_WIDTH + DECAY_WIDTH * 0.5) * points.drawWidth, label: 'D' },
        { x: points.padding + (ATTACK_WIDTH + DECAY_WIDTH + SUSTAIN_WIDTH * 0.5) * points.drawWidth, label: 'S' },
        { x: points.padding + (ATTACK_WIDTH + DECAY_WIDTH + SUSTAIN_WIDTH + RELEASE_WIDTH * 0.5) * points.drawWidth, label: 'R' },
      ];

      segmentCenters.forEach(({ x, label: segLabel }) => {
        ctx.fillText(segLabel, x, height - 8);
      });
    }

    // Draw envelope curve with glow
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points.start.x, points.start.y);
    ctx.lineTo(points.attackPeak.x, points.attackPeak.y);
    ctx.lineTo(points.decayEnd.x, points.decayEnd.y);
    ctx.lineTo(points.sustainEnd.x, points.sustainEnd.y);
    ctx.lineTo(points.releaseEnd.x, points.releaseEnd.y);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Fill under curve
    ctx.fillStyle = `${accentColor}20`;
    ctx.beginPath();
    ctx.moveTo(points.start.x, points.start.y);
    ctx.lineTo(points.attackPeak.x, points.attackPeak.y);
    ctx.lineTo(points.decayEnd.x, points.decayEnd.y);
    ctx.lineTo(points.sustainEnd.x, points.sustainEnd.y);
    ctx.lineTo(points.releaseEnd.x, points.releaseEnd.y);
    ctx.lineTo(points.releaseEnd.x, points.start.y);
    ctx.closePath();
    ctx.fill();

    // Draw control points
    const drawControlPoint = (x: number, y: number, target: 'attack' | 'decay' | 'sustain' | 'release') => {
      const isHovered = hoverTarget === target;
      const isDragging = dragTarget === target;
      const isActive = activePhase === target;
      const radius = isDragging ? 10 : isHovered ? 8 : 6;

      // Outer glow for active phase
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${accentColor}40`;
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isDragging || isHovered ? '#ffffff' : accentColor;
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawControlPoint(points.attackPeak.x, points.attackPeak.y, 'attack');
    drawControlPoint(points.decayEnd.x, points.decayEnd.y, 'decay');
    // Sustain control point in the middle of sustain segment
    const sustainControlX = (points.decayEnd.x + points.sustainEnd.x) / 2;
    drawControlPoint(sustainControlX, points.sustainEnd.y, 'sustain');
    drawControlPoint(points.releaseEnd.x, points.releaseEnd.y, 'release');

    // Draw value labels near control points (only in non-compact mode)
    if (!compact) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';

      // Attack time
      ctx.fillText(`${(attack * 1000).toFixed(0)}ms`, points.attackPeak.x, points.attackPeak.y - 12);
      // Decay time
      ctx.fillText(`${(decay * 1000).toFixed(0)}ms`, points.decayEnd.x, points.decayEnd.y - 12);
      // Sustain level
      ctx.fillText(`${Math.round(sustain * 100)}%`, sustainControlX, points.sustainEnd.y - 12);
      // Release time
      ctx.fillText(`${(release * 1000).toFixed(0)}ms`, points.releaseEnd.x, points.releaseEnd.y - 12);
    }

    // Draw playhead line if position provided externally
    if (playheadPosition !== undefined && playheadPosition >= 0 && playheadPosition <= 1) {
      const phX = points.padding + playheadPosition * points.drawWidth;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(phX, points.topPadding);
      ctx.lineTo(phX, points.topPadding + points.drawHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw animated playhead dot when triggered
    if (isAnimating) {
      // Glow
      ctx.beginPath();
      ctx.arc(playheadX, playheadY, 10, 0, Math.PI * 2);
      ctx.fillStyle = `${accentColor}40`;
      ctx.fill();

      // Main dot
      ctx.beginPath();
      ctx.arc(playheadX, playheadY, 6, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();

      // White center
      ctx.beginPath();
      ctx.arc(playheadX, playheadY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

  }, [width, height, attack, decay, sustain, release, accentColor, dragTarget, hoverTarget, activePhase, playheadPosition, getEnvelopePoints, label, compact, isAnimating, playheadX, playheadY]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = getEnvelopePoints(width, height);
    const target = getControlPointAt(x, y, points);

    if (target) {
      setDragTarget(target);
    }
  }, [width, height, getEnvelopePoints, getControlPointAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = getEnvelopePoints(width, height);

    if (dragTarget) {
      // Update parameter based on drag
      switch (dragTarget) {
        case 'attack': {
          // X position controls attack time
          const attackNorm = Math.max(0, Math.min(1, (x - points.padding) / (ATTACK_WIDTH * points.drawWidth)));
          onAttackChange(attackNorm * ATTACK_MAX);
          break;
        }
        case 'decay': {
          // X position controls decay time
          const decayStartX = points.padding + ATTACK_WIDTH * points.drawWidth;
          const decayNorm = Math.max(0, Math.min(1, (x - decayStartX) / (DECAY_WIDTH * points.drawWidth)));
          onDecayChange(decayNorm * DECAY_MAX);
          // Y position also affects sustain level
          const sustainNorm = Math.max(0, Math.min(1, 1 - (y - points.topPadding) / points.drawHeight));
          onSustainChange(sustainNorm);
          break;
        }
        case 'sustain': {
          // Y position controls sustain level
          const sustainNorm = Math.max(0, Math.min(1, 1 - (y - points.topPadding) / points.drawHeight));
          onSustainChange(sustainNorm);
          break;
        }
        case 'release': {
          // For release, use the overall horizontal position relative to sustain end
          const sustainEndX = points.padding + (ATTACK_WIDTH + DECAY_WIDTH + SUSTAIN_WIDTH) * points.drawWidth;
          const releaseNorm = Math.max(0.01, Math.min(1, (x - sustainEndX) / (RELEASE_WIDTH * points.drawWidth)));
          onReleaseChange(releaseNorm * RELEASE_MAX);
          break;
        }
      }
    } else {
      // Update hover state
      const target = getControlPointAt(x, y, points);
      setHoverTarget(target);
    }
  }, [dragTarget, width, height, getEnvelopePoints, getControlPointAt, onAttackChange, onDecayChange, onSustainChange, onReleaseChange]);

  const handleMouseUp = useCallback(() => {
    setDragTarget(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragTarget(null);
    setHoverTarget(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        maxWidth: '100%',
        cursor: dragTarget ? 'grabbing' : hoverTarget ? 'grab' : 'default',
        borderRadius: 8,
        border: `1px solid ${isAnimating ? accentColor : `${accentColor}40`}`,
        transition: 'border-color 0.15s',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export const EnvelopeVisualizer = memo(EnvelopeVisualizerComponent);

// Legacy export for backwards compatibility with existing usage
export function EnvelopeVisualizerReadOnly({
  amplitudeEnvelope,
  filterEnvelope,
  width = 450,
  height = 150,
  ampColor = '#4ade80',
  filterColor = '#3b82f6',
}: {
  amplitudeEnvelope: { attack: number; decay: number; sustain: number; release: number };
  filterEnvelope?: { attack: number; decay: number; sustain: number; release: number; amount?: number };
  width?: number;
  height?: number;
  ampColor?: string;
  filterColor?: string;
}) {
  const padding = 16;
  const labelHeight = 24;
  const graphHeight = height - labelHeight - padding * 2;
  const graphWidth = width - padding * 2;

  const formatTime = (seconds: number): string => {
    if (seconds >= 1) return `${seconds.toFixed(1)}s`;
    return `${Math.round(seconds * 1000)}ms`;
  };

  const buildEnvelopePath = (
    envelope: { attack: number; decay: number; sustain: number; release: number },
    startX: number,
    baseY: number,
    maxWidth: number,
    maxHeight: number
  ): string => {
    const { attack, decay, sustain, release } = envelope;
    const maxTime = 2;
    const segmentWidth = maxWidth / 4;

    const attackWidth = (Math.min(attack, maxTime) / maxTime) * segmentWidth;
    const decayWidth = (Math.min(decay, maxTime) / maxTime) * segmentWidth;
    const sustainWidth = segmentWidth;
    const releaseWidth = (Math.min(release, maxTime) / maxTime) * segmentWidth;

    const sustainY = baseY - sustain * maxHeight;
    const peakY = baseY - maxHeight;

    return `M ${startX} ${baseY} L ${startX + attackWidth} ${peakY} L ${startX + attackWidth + decayWidth} ${sustainY} L ${startX + attackWidth + decayWidth + sustainWidth} ${sustainY} L ${startX + attackWidth + decayWidth + sustainWidth + releaseWidth} ${baseY}`;
  };

  const baseY = padding + graphHeight;
  const ampPath = buildEnvelopePath(amplitudeEnvelope, padding, baseY, graphWidth, graphHeight);
  const filterPath = filterEnvelope ? buildEnvelopePath(filterEnvelope, padding, baseY, graphWidth, graphHeight) : null;

  return (
    <div style={{ background: '#141414', borderRadius: 8, overflow: 'hidden' }}>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#141414" />

        {/* Phase backgrounds */}
        <rect x={padding} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(74, 222, 128, 0.05)" />
        <rect x={padding + graphWidth / 4} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(251, 191, 36, 0.05)" />
        <rect x={padding + (graphWidth / 4) * 2} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(96, 165, 250, 0.05)" />
        <rect x={padding + (graphWidth / 4) * 3} y={padding} width={graphWidth / 4} height={graphHeight} fill="rgba(244, 114, 182, 0.05)" />

        {/* Grid */}
        <line x1={padding} y1={baseY} x2={padding + graphWidth} y2={baseY} stroke="#333" strokeWidth={1} />

        {/* Filter envelope */}
        {filterPath && (
          <>
            <path d={`${filterPath} L ${padding + graphWidth} ${baseY} L ${padding} ${baseY} Z`} fill={filterColor} fillOpacity={0.15} />
            <path d={filterPath} fill="none" stroke={filterColor} strokeWidth={2} strokeDasharray="6,3" />
          </>
        )}

        {/* Amplitude envelope */}
        <path d={`${ampPath} L ${padding + graphWidth} ${baseY} L ${padding} ${baseY} Z`} fill={ampColor} fillOpacity={0.2} />
        <path d={ampPath} fill="none" stroke={ampColor} strokeWidth={2.5} />

        {/* Labels */}
        <text x={padding + graphWidth / 8} y={height - 6} fontSize="11" fill="#4ade80" textAnchor="middle" fontWeight="600">A</text>
        <text x={padding + (graphWidth / 8) * 3} y={height - 6} fontSize="11" fill="#fbbf24" textAnchor="middle" fontWeight="600">D</text>
        <text x={padding + (graphWidth / 8) * 5} y={height - 6} fontSize="11" fill="#60a5fa" textAnchor="middle" fontWeight="600">S</text>
        <text x={padding + (graphWidth / 8) * 7} y={height - 6} fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="600">R</text>
      </svg>
    </div>
  );
}
