/**
 * NOISE generator stage
 */

import { NoiseVisualizer, StageCard } from '../index.ts';
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

const SIZES = {
  visualizer: { width: 200, height: 100 },
  gap: { xs: 4 },
  margin: { section: 12 },
};

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
        width={SIZES.visualizer.width}
        height={SIZES.visualizer.height}
        accentColor={color}
        compact
      />
      <div style={{ display: 'flex', gap: SIZES.gap.xs, marginTop: SIZES.margin.section }}>
        {NOISE_TYPES.map((nt) => (
          <button
            key={nt.value}
            onClick={() => onTypeChange(nt.value)}
            style={{
              padding: '6px 10px',
              background: type === nt.value ? color : '#1a1a1a',
              border: `1px solid ${type === nt.value ? color : '#333'}`,
              borderRadius: '4px',
              color: type === nt.value ? '#fff' : '#888',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {nt.label}
          </button>
        ))}
      </div>
    </StageCard>
  );
}
