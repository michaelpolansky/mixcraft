/**
 * Bottom control strip — XY pad / Piano keyboard tabs
 */

import { PianoKeyboard, XYPad } from '../index.ts';
import { formatHz } from '../../utils/formatters.ts';
import { PARAM_RANGES } from '../../../core/types.ts';

interface BottomControlStripProps {
  mode: 'keys' | 'xy';
  expanded: boolean;
  onModeChange: (mode: 'keys' | 'xy') => void;
  onExpandedChange: (expanded: boolean) => void;
  // Keyboard props
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  // XY pad props
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

export function BottomControlStrip({
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
    <div style={{
      borderTop: '1px solid #1a1a1a',
      background: '#0d0d12',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
        <button
          onClick={() => onModeChange('xy')}
          style={{
            padding: '8px 16px',
            background: mode === 'xy' ? '#1a1a1a' : 'transparent',
            border: 'none',
            borderBottom: mode === 'xy' ? `2px solid ${filterColor}` : '2px solid transparent',
            color: mode === 'xy' ? '#fff' : '#666',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          XY
        </button>
        <button
          onClick={() => onModeChange('keys')}
          style={{
            padding: '8px 16px',
            background: mode === 'keys' ? '#1a1a1a' : 'transparent',
            border: 'none',
            borderBottom: mode === 'keys' ? `2px solid #4ade80` : '2px solid transparent',
            color: mode === 'keys' ? '#fff' : '#666',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          KEYS
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onExpandedChange(!expanded)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          {expanded ? '\u25BC' : '\u25B2'}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          height: expanded ? '140px' : '50px',
          transition: 'height 0.2s ease',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 24px',
        }}
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
}
