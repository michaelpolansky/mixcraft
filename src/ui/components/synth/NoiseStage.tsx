/**
 * NOISE generator stage
 */

import { NoiseVisualizer, StageCard } from '../index.ts';
import { cn } from '../../utils/cn.ts';
import type { NoiseType } from '../../../core/types.ts';

interface NoiseStageProps {
  type: NoiseType;
  level: number;
  onTypeChange: (t: NoiseType) => void;
  color: string;
}

const NOISE_TYPES: { value: NoiseType; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'pink', label: 'Pink' },
  { value: 'brown', label: 'Brown' },
];

export function NoiseStage({
  type,
  level,
  onTypeChange,
  color,
}: NoiseStageProps) {
  return (
    <StageCard title="NOISE" color={color}>
      <NoiseVisualizer
        noiseType={type}
        level={level}
        width={200}
        height={100}
        accentColor={color}
        compact
      />
      <div className="flex gap-1 mt-3">
        {NOISE_TYPES.map((nt) => (
          <button
            key={nt.value}
            onClick={() => onTypeChange(nt.value)}
            className={cn(
              'py-1.5 px-2.5 rounded-sm text-sm cursor-pointer font-medium border',
              type === nt.value
                ? 'text-text-primary'
                : 'bg-bg-tertiary border-border-medium text-text-tertiary'
            )}
            style={type === nt.value ? { background: color, borderColor: color } : undefined}
          >
            {nt.label}
          </button>
        ))}
      </div>
    </StageCard>
  );
}
