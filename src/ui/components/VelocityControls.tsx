/**
 * VelocityControls - Velocity sensitivity amount controls
 */

import { Knob } from './Knob.tsx';

export interface VelocityControlsProps {
  ampAmount: number;
  secondaryAmount: number;
  secondaryLabel: string;
  onAmpAmountChange: (value: number) => void;
  onSecondaryAmountChange: (value: number) => void;
  color: string;
}

export function VelocityControls({
  ampAmount,
  secondaryAmount,
  secondaryLabel,
  onAmpAmountChange,
  onSecondaryAmountChange,
  color,
}: VelocityControlsProps) {
  return (
    <div className="flex gap-2">
      <Knob
        label="Amp Amt"
        value={ampAmount}
        min={0}
        max={1}
        step={0.01}
        onChange={onAmpAmountChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="velocity.ampAmount"
      />
      <Knob
        label={secondaryLabel}
        value={secondaryAmount}
        min={0}
        max={1}
        step={0.01}
        onChange={onSecondaryAmountChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="velocity.secondaryAmount"
      />
    </div>
  );
}
