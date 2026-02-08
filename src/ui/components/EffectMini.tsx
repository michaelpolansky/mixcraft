/**
 * EffectMini - Compact effect control with label and knobs
 */

import { Knob } from './Knob.tsx';

export interface EffectKnobConfig {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  paramId?: string;
}

export interface EffectMiniProps {
  name: string;
  color: string;
  knobs: EffectKnobConfig[];
}

export function EffectMini({ name, color, knobs }: EffectMiniProps) {
  return (
    <div className="overflow-hidden">
      <div
        className="text-[9px] font-semibold mb-1"
        style={{ color }}
      >
        {name}
      </div>
      <div className="flex flex-col gap-1">
        {knobs.map((k) => (
          <Knob
            key={k.label}
            label={k.label}
            value={k.value}
            min={0}
            max={k.max}
            step={0.01}
            onChange={k.onChange}
            formatValue={(v) => `${Math.round((v / k.max) * 100)}%`}
            size={32}
            paramId={k.paramId ?? `effect.${name.toLowerCase()}.${k.label.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
