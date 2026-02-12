/**
 * Bottom control strip — XY pad / Piano keyboard tabs
 */

import { memo } from 'react';
import { cn } from '../../utils/cn.ts';
import { PianoKeyboard, XYPad } from '../index.ts';
import { formatHz } from '../../utils/formatters.ts';
import { PARAM_RANGES } from '../../../core/types.ts';

interface BottomControlStripProps {
  mode: 'keys' | 'xy';
  expanded: boolean;
  onModeChange: (mode: 'keys' | 'xy') => void;
  onExpandedChange: (expanded: boolean) => void;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  filterCutoff: number;
  filterResonance: number;
  onFilterCutoffChange: (v: number) => void;
  onFilterResonanceChange: (v: number) => void;
  filterColor: string;
}

const xRange: [number, number] = [PARAM_RANGES.cutoff.min, PARAM_RANGES.cutoff.max];
const yRange: [number, number] = [PARAM_RANGES.resonance.min, PARAM_RANGES.resonance.max];

const normalizeValue = (value: number, min: number, max: number) => (value - min) / (max - min);
const denormalizeValue = (normalized: number, min: number, max: number) => min + normalized * (max - min);

export const BottomControlStrip = memo(function BottomControlStrip({
  mode,
  expanded,
  onModeChange,
  onExpandedChange,
  onNoteOn,
  onNoteOff,
  filterCutoff,
  filterResonance,
  onFilterCutoffChange,
  onFilterResonanceChange,
  filterColor,
}: BottomControlStripProps) {
  return (
    <div className="border-t border-border-subtle bg-[#0d0d12]">
      {/* Tabs */}
      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => onModeChange('xy')}
          className={cn(
            'py-2 px-4 border-none text-base font-semibold cursor-pointer border-b-2',
            mode === 'xy'
              ? 'bg-bg-tertiary text-text-primary'
              : 'bg-transparent text-text-muted border-b-transparent'
          )}
          style={mode === 'xy' ? { borderBottomColor: filterColor } : undefined}
        >
          XY
        </button>
        <button
          onClick={() => onModeChange('keys')}
          className={cn(
            'py-2 px-4 border-none text-base font-semibold cursor-pointer border-b-2',
            mode === 'keys'
              ? 'bg-bg-tertiary text-text-primary border-b-success-light'
              : 'bg-transparent text-text-muted border-b-transparent'
          )}
        >
          KEYS
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onExpandedChange(!expanded)}
          className="py-2 px-4 bg-transparent border-none text-text-muted cursor-pointer text-base"
        >
          {expanded ? '\u25BC' : '\u25B2'}
        </button>
      </div>

      {/* Content */}
      <div
        className="flex items-center justify-center overflow-hidden py-2 px-6 transition-[height] duration-200 ease-out"
        style={{ height: expanded ? '140px' : '50px' }}
        onClick={() => !expanded && onExpandedChange(true)}
      >
        {mode === 'keys' ? (
          <PianoKeyboard
            onNoteOn={onNoteOn}
            onNoteOff={onNoteOff}
            octave={4}
            octaves={expanded ? 3 : 1}
          />
        ) : (
          <XYPad
            xValue={normalizeValue(filterCutoff, xRange[0], xRange[1])}
            yValue={normalizeValue(filterResonance, yRange[0], yRange[1])}
            xLabel="Cutoff"
            yLabel="Resonance"
            xRange={xRange}
            yRange={yRange}
            onXChange={(v) => onFilterCutoffChange(denormalizeValue(v, xRange[0], xRange[1]))}
            onYChange={(v) => onFilterResonanceChange(denormalizeValue(v, yRange[0], yRange[1]))}
            size={expanded ? 120 : 40}
            accentColor={filterColor}
            formatXValue={formatHz}
            formatYValue={(v) => v.toFixed(1)}
          />
        )}
      </div>
    </div>
  );
});
