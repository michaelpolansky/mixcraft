/**
 * ToggleButton - On/off toggle with label (GLIDE, UNISON, SYNC, etc.)
 */

import { cn } from '../utils/cn.ts';

export interface ToggleButtonProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  color: string;
  size?: 'sm' | 'md';
}

export function ToggleButton({
  label,
  enabled,
  onChange,
  color,
  size = 'md',
}: ToggleButtonProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'rounded font-semibold cursor-pointer transition-all duration-150 border',
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-sm',
        enabled ? 'text-text-primary' : 'bg-bg-quaternary border-border-bright text-text-tertiary'
      )}
      style={enabled ? { background: color, borderColor: color } : undefined}
    >
      {label}
    </button>
  );
}
