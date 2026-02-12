/**
 * OUTPUT stage — oscilloscope, volume, pan, recording
 */

import { memo } from 'react';
import { Knob, Oscilloscope, RecordingControl, StageCard } from '../index.ts';
import { formatDb, formatPan } from '../../utils/formatters.ts';

interface OutputStageProps {
  volume: number;
  pan: number;
  onVolumeChange: (v: number) => void;
  onPanChange: (v: number) => void;
  getAnalyser: () => AnalyserNode | null;
  sourceNode: AudioNode | null;
  modulatedAmplitude?: number;
  modulatedPan?: number;
  color: string;
}

export const OutputStage = memo(function OutputStage({
  volume,
  pan,
  onVolumeChange,
  onPanChange,
  getAnalyser,
  sourceNode,
  modulatedAmplitude,
  modulatedPan,
  color,
}: OutputStageProps) {
  return (
    <StageCard title="OUTPUT" color={color}>
      <div className="flex flex-col gap-3">
        <Oscilloscope
          getAnalyser={getAnalyser}
          width={200}
          height={60}
          accentColor={color}
        />
        <div className="flex flex-col gap-2">
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
            formatValue={formatPan}
            paramId="pan"
            modulatedValue={modulatedPan}
          />
        </div>
        <RecordingControl
          sourceNode={sourceNode}
          accentColor={color}
          compact
        />
      </div>
    </StageCard>
  );
});
