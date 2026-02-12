/**
 * SUB OSC stage
 */

import { memo } from 'react';
import { WaveformSelector, OscillatorVisualizer, StageCard } from '../index.ts';
import { cn } from '../../utils/cn.ts';
type SubOscWaveform = 'sine' | 'square';

interface SubOscStageProps {
  type: SubOscWaveform;
  octave: -1 | -2;
  onTypeChange: (t: 'sine' | 'square') => void;
  onOctaveChange: (v: -1 | -2) => void;
  color: string;
}

export const SubOscStage = memo(function SubOscStage({
  type,
  octave,
  onTypeChange,
  onOctaveChange,
  color,
}: SubOscStageProps) {
  return (
    <StageCard title="SUB OSC" color={color}>
      <OscillatorVisualizer
        waveform={type}
        octave={octave}
        detune={0}
        width={200}
        height={100}
        accentColor={color}
        compact
      />
      <div className="mt-3">
        <WaveformSelector
          value={type}
          onChange={onTypeChange}
          accentColor={color}
          size="compact"
          waveforms={['sine', 'square']}
        />
      </div>
      <div className="flex gap-1 mt-2">
        {([-1, -2] as const).map((oct) => (
          <button
            key={oct}
            onClick={() => onOctaveChange(oct)}
            className={cn(
              'py-1.5 px-3 rounded-sm text-sm cursor-pointer font-medium border',
              octave === oct
                ? 'text-text-primary'
                : 'bg-bg-tertiary border-border-medium text-text-tertiary'
            )}
            style={octave === oct ? { background: color, borderColor: color } : undefined}
          >
            {oct} Oct
          </button>
        ))}
      </div>
    </StageCard>
  );
});
