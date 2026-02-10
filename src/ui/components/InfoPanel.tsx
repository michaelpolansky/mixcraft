/**
 * Info Panel
 * Ableton-style context-sensitive help panel
 * Shows information about the currently hovered control
 */

import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { getParamInfo, DEFAULT_INFO } from '../data/param-info.ts';

interface InfoPanelProps {
  /** Accent color for the panel (matches synth type) */
  accentColor?: string;
}

export function InfoPanel({ accentColor = '#4ade80' }: InfoPanelProps) {
  const { hoveredParam } = useInfoPanel();

  const info = hoveredParam ? getParamInfo(hoveredParam) : DEFAULT_INFO;

  return (
    <div
      className="bg-[#0d0d0d] p-3 px-4 min-h-[72px] flex flex-col gap-1"
      style={{ '--accent': accentColor, borderTop: `1px solid ${accentColor}33` } as React.CSSProperties}
    >
      {/* Parameter name */}
      <div className="flex items-center gap-2">
        <span className="text-(--accent) text-sm font-semibold uppercase tracking-wider">
          {hoveredParam ? 'i' : '?'}
        </span>
        <span className="text-text-primary text-lg font-semibold">
          {info.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#999] text-md leading-snug m-0">
        {info.description}
      </p>

      {/* Tips */}
      {info.tips && (
        <p className="text-text-muted text-base leading-snug m-0 italic">
          {info.tips}
        </p>
      )}
    </div>
  );
}
