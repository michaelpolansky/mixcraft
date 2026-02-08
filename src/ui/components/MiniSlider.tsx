/**
 * MiniSlider - Compact horizontal slider for ADSR and other controls
 */

import { useCallback } from 'react';

export interface MiniSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
}

export function MiniSlider({
  label,
  value,
  min,
  max,
  onChange,
  color = '#22c55e',
}: MiniSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    onChange(min + x * (max - min));
  }, [min, max, onChange]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-[#666] w-3">{label}</span>
      <div
        className="flex-1 h-1 bg-[#222] rounded-sm cursor-pointer relative"
        onClick={handleClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}
