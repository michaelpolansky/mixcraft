/**
 * NoiseControls - Noise type selector with level knob
 */

import { Knob } from './Knob.tsx';
import type { NoiseType } from '../../core/types.ts';

const NOISE_TYPES: Array<{ value: NoiseType; label: string }> = [
  { value: 'white', label: 'White' },
  { value: 'pink', label: 'Pink' },
  { value: 'brown', label: 'Brown' },
];

export interface NoiseControlsProps {
  type: NoiseType;
  level: number;
  onTypeChange: (type: NoiseType) => void;
  onLevelChange: (level: number) => void;
  color: string;
}

export function NoiseControls({
  type,
  level,
  onTypeChange,
  onLevelChange,
  color,
}: NoiseControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Type selector */}
      <div className="flex gap-1">
        {NOISE_TYPES.map((nt) => (
          <button
            key={nt.value}
            onClick={() => onTypeChange(nt.value)}
            className="flex-1 py-1 text-[9px] font-semibold rounded cursor-pointer transition-all duration-150 border-none text-white"
            style={{
              background: type === nt.value ? color : '#333',
            }}
          >
            {nt.label}
          </button>
        ))}
      </div>
      {/* Level knob */}
      <Knob
        label="Level"
        value={level}
        min={0}
        max={1}
        step={0.01}
        onChange={onLevelChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="noise.level"
      />
    </div>
  );
}
