/**
 * OUTPUT stage — oscilloscope, volume, pan, recording
 */

import { Knob, Oscilloscope, RecordingControl, StageCard } from '../index.ts';
import { formatDb } from '../../utils/formatters.ts';
import type { SynthEngine } from '../../../core/synth-engine.ts';

interface OutputStageProps {
  volume: number;
  pan: number;
  onVolumeChange: (v: number) => void;
  onPanChange: (v: number) => void;
  engine: SynthEngine | null;
  modulatedAmplitude?: number;
  modulatedPan?: number;
  color: string;
}

const SIZES = {
  visualizer: { width: 200, compactHeight: 60 },
  gap: { sm: 8, md: 12 },
};

export function OutputStage({
  volume,
  pan,
  onVolumeChange,
  onPanChange,
  engine,
  modulatedAmplitude,
  modulatedPan,
  color,
}: OutputStageProps) {
  return (
    <StageCard title="OUTPUT" color={color}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.md }}>
        <Oscilloscope
          getAnalyser={() => engine?.getAnalyser() ?? null}
          width={SIZES.visualizer.width}
          height={SIZES.visualizer.compactHeight}
          accentColor={color}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm }}>
          <Knob
            label="Volume"
            value={volume}
            min={-40}
            max={0}
            step={0.5}
            onChange={onVolumeChange}
            formatValue={formatDb}
            paramId="volume"
            modulatedValue={modulatedAmplitude !== undefined
              ? 20 * Math.log10(Math.max(0.0001, modulatedAmplitude))
              : undefined}
          />
          <Knob
            label="Pan"
            value={pan}
            min={-1}
            max={1}
            step={0.01}
            onChange={onPanChange}
            formatValue={(v) => {
              if (Math.abs(v) < 0.05) return 'Center';
              if (v < 0) return `${Math.round(Math.abs(v) * 100)}% L`;
              return `${Math.round(v * 100)}% R`;
            }}
            paramId="pan"
            modulatedValue={modulatedPan}
          />
        </div>
        <RecordingControl
          sourceNode={engine?.getOutputNode() ?? null}
          accentColor={color}
          compact
        />
      </div>
    </StageCard>
  );
}
