/**
 * GlideControls - Glide/Portamento toggle with time knob
 */

import { ToggleButton } from './ToggleButton.tsx';
import { Knob } from './Knob.tsx';

export interface GlideControlsProps {
  enabled: boolean;
  time: number;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: number) => void;
  color: string;
}

export function GlideControls({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
  color,
}: GlideControlsProps) {
  return (
    <div className="mt-3 pt-3 border-t border-[#222]">
      <div className="flex items-center gap-2">
        <ToggleButton
          label="GLIDE"
          enabled={enabled}
          onChange={onEnabledChange}
          color={color}
        />
        {enabled && (
          <Knob
            label="Time"
            value={time}
            min={0.01}
            max={1}
            step={0.01}
            onChange={onTimeChange}
            formatValue={(v) => `${Math.round(v * 1000)}ms`}
            size={32}
            paramId="glide.time"
          />
        )}
      </div>
    </div>
  );
}
