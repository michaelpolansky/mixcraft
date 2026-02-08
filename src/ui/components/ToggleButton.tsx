/**
 * ToggleButton - On/off toggle with label (GLIDE, UNISON, SYNC, etc.)
 */

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
  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[9px]'
    : 'px-2 py-1 text-[10px]';

  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`${sizeClasses} rounded font-semibold cursor-pointer transition-all duration-150 border`}
      style={{
        background: enabled ? color : '#222',
        borderColor: enabled ? color : '#444',
        color: enabled ? '#fff' : '#888',
      }}
    >
      {label}
    </button>
  );
}
