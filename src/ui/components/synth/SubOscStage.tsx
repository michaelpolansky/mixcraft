/**
 * SUB OSC stage
 */

import { WaveformSelector, OscillatorVisualizer, StageCard } from '../index.ts';
type SubOscWaveform = 'sine' | 'square';

interface SubOscStageProps {
  type: SubOscWaveform;
  octave: -1 | -2;
  onTypeChange: (t: 'sine' | 'square') => void;
  onOctaveChange: (v: -1 | -2) => void;
  color: string;
}

const SIZES = {
  visualizer: { width: 200, height: 100 },
  gap: { xs: 4, sm: 8 },
  margin: { section: 12 },
};

export function SubOscStage({
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
        width={SIZES.visualizer.width}
        height={SIZES.visualizer.height}
        accentColor={color}
        compact
      />
      <div style={{ marginTop: SIZES.margin.section }}>
        <WaveformSelector
          value={type}
          onChange={onTypeChange}
          accentColor={color}
          size="compact"
          waveforms={['sine', 'square']}
        />
      </div>
      <div style={{ display: 'flex', gap: SIZES.gap.xs, marginTop: SIZES.gap.sm }}>
        {([-1, -2] as const).map((oct) => (
          <button
            key={oct}
            onClick={() => onOctaveChange(oct)}
            style={{
              padding: '6px 12px',
              background: octave === oct ? color : '#1a1a1a',
              border: `1px solid ${octave === oct ? color : '#333'}`,
              borderRadius: '4px',
              color: octave === oct ? '#fff' : '#888',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {oct} Oct
          </button>
        ))}
      </div>
    </StageCard>
  );
}
