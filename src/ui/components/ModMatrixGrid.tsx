/**
 * Mod Matrix Grid Component
 *
 * Visual matrix UI for modulation routing.
 * Rows = sources (LFO1, LFO2, Amp, Filt, Mod)
 * Columns = destinations (Pitch, Pan, Amp, Cutoff, OSC2, LFO1, LFO2)
 */

import { useCallback, useRef } from 'react';
import {
  MOD_SOURCES,
  MOD_DESTINATIONS,
  MOD_SOURCE_LABELS,
  MOD_DEST_LABELS,
  type ModSource,
  type ModDestination,
  type ModMatrixGrid as ModMatrixGridType,
} from '../../core/types.ts';
import { COLORS, TYPOGRAPHY, RADIUS, TRANSITIONS } from '../theme/index.ts';

interface ModMatrixGridProps {
  grid: ModMatrixGridType;
  onChange: (source: ModSource, destination: ModDestination, amount: number) => void;
  accentColor?: string;
}

// Cell size constants
const CELL_SIZE = 28;
const LABEL_WIDTH = 40;
const HEADER_HEIGHT = 24;
const GAP = 2;

export function ModMatrixGrid({
  grid,
  onChange,
  accentColor = COLORS.synth.lfo,
}: ModMatrixGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      {/* Header row with destination labels */}
      <div style={{ display: 'flex', gap: GAP, marginLeft: LABEL_WIDTH + GAP }}>
        {MOD_DESTINATIONS.map((dest) => (
          <div
            key={dest}
            style={{
              width: CELL_SIZE,
              height: HEADER_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 600,
              color: COLORS.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {MOD_DEST_LABELS[dest]}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {MOD_SOURCES.map((source) => (
        <div key={source} style={{ display: 'flex', gap: GAP, alignItems: 'center' }}>
          {/* Row label */}
          <div
            style={{
              width: LABEL_WIDTH,
              height: CELL_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 4,
              fontSize: '9px',
              fontWeight: 600,
              color: COLORS.text.muted,
              textTransform: 'uppercase',
            }}
          >
            {MOD_SOURCE_LABELS[source]}
          </div>

          {/* Cells */}
          {MOD_DESTINATIONS.map((dest) => (
            <MatrixCell
              key={`${source}-${dest}`}
              source={source}
              destination={dest}
              amount={grid[source]?.[dest] ?? 0}
              onChange={onChange}
              accentColor={accentColor}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface MatrixCellProps {
  source: ModSource;
  destination: ModDestination;
  amount: number;
  onChange: (source: ModSource, destination: ModDestination, amount: number) => void;
  accentColor: string;
}

function MatrixCell({
  source,
  destination,
  amount,
  onChange,
  accentColor,
}: MatrixCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startAmount = useRef(0);

  // Calculate color based on amount
  const isActive = Math.abs(amount) > 0.01;
  const isPositive = amount > 0;
  const intensity = Math.abs(amount);

  // Background color with intensity
  const bgColor = isActive
    ? `${accentColor}${Math.round(intensity * 60 + 20).toString(16).padStart(2, '0')}`
    : COLORS.bg.tertiary;

  // Border color
  const borderColor = isActive ? accentColor : COLORS.border.subtle;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startAmount.current = amount;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaY = startY.current - moveEvent.clientY;
      const deltaAmount = deltaY / 100; // 100px = full range
      const newAmount = Math.max(-1, Math.min(1, startAmount.current + deltaAmount));

      // Snap to 0 when close
      const snapped = Math.abs(newAmount) < 0.05 ? 0 : newAmount;
      onChange(source, destination, Math.round(snapped * 100) / 100);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [amount, source, destination, onChange]);

  // Double-click to reset to 0
  const handleDoubleClick = useCallback(() => {
    onChange(source, destination, 0);
  }, [source, destination, onChange]);

  // Format display value
  const displayValue = isActive
    ? `${isPositive ? '+' : ''}${Math.round(amount * 100)}`
    : '';

  return (
    <div
      ref={cellRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title={`${MOD_SOURCE_LABELS[source]} → ${MOD_DEST_LABELS[destination]}: ${Math.round(amount * 100)}%`}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: RADIUS.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'ns-resize',
        userSelect: 'none',
        transition: `background ${TRANSITIONS.fast}, border-color ${TRANSITIONS.fast}`,
        fontSize: '8px',
        fontWeight: 600,
        fontFamily: TYPOGRAPHY.family.mono,
        color: isActive ? COLORS.text.primary : 'transparent',
      }}
    >
      {displayValue}
    </div>
  );
}
