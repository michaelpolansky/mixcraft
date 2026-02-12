/**
 * Mod Matrix Grid Component
 *
 * Visual matrix UI for modulation routing.
 * Rows = sources (LFO1, LFO2, Amp, Filt, Mod)
 * Columns = destinations (Pitch, Pan, Amp, Cutoff, OSC2, LFO1, LFO2)
 */

import { useCallback, useRef } from 'react';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';
import {
  MOD_SOURCES,
  MOD_DESTINATIONS,
  MOD_SOURCE_LABELS,
  MOD_DEST_LABELS,
  type ModSource,
  type ModDestination,
  type ModMatrixGrid as ModMatrixGridType,
} from '../../core/types.ts';
import { COLORS } from '../theme/index.ts';

interface ModMatrixGridProps {
  grid: ModMatrixGridType;
  onChange: (source: ModSource, destination: ModDestination, amount: number) => void;
  accentColor?: string;
}

export function ModMatrixGrid({
  grid,
  onChange,
  accentColor = COLORS.synth.lfo,
}: ModMatrixGridProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Header row with destination labels */}
      <div className="flex gap-0.5 ml-[42px]">
        {MOD_DESTINATIONS.map((dest) => (
          <div
            key={dest}
            className="w-7 h-6 flex items-center justify-center text-[8px] font-semibold text-text-muted uppercase tracking-tight"
          >
            {MOD_DEST_LABELS[dest]}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {MOD_SOURCES.map((source) => (
        <div key={source} className="flex gap-0.5 items-center">
          {/* Row label */}
          <div className="w-10 h-7 flex items-center justify-end pr-1 text-[9px] font-semibold text-text-muted uppercase">
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

  const { onPointerDown } = usePointerDrag({
    onStart: useCallback((_clientX: number, clientY: number) => {
      startY.current = clientY;
      startAmount.current = amount;
    }, [amount]),
    onMove: useCallback((_clientX: number, clientY: number) => {
      const deltaY = startY.current - clientY;
      const deltaAmount = deltaY / 100; // 100px = full range
      const newAmount = Math.max(-1, Math.min(1, startAmount.current + deltaAmount));

      // Snap to 0 when close
      const snapped = Math.abs(newAmount) < 0.05 ? 0 : newAmount;
      onChange(source, destination, Math.round(snapped * 100) / 100);
    }, [source, destination, onChange]),
  });

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
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onDoubleClick={handleDoubleClick}
      title={`${MOD_SOURCE_LABELS[source]} → ${MOD_DEST_LABELS[destination]}: ${Math.round(amount * 100)}%`}
      className="w-7 h-7 flex items-center justify-center cursor-ns-resize select-none rounded text-[8px] font-semibold font-mono transition-[background,border-color] duration-100"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: isActive ? COLORS.text.primary : 'transparent',
      }}
    >
      {displayValue}
    </div>
  );
}
