/**
 * Floating Tooltip Component
 * Shows educational tooltips near hovered controls when Help Mode is enabled
 */

import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { getParamInfo } from '../data/param-info.ts';

interface TooltipProps {
  /** Accent color for the tooltip border */
  accentColor?: string;
}

export function Tooltip({ accentColor = '#4ade80' }: TooltipProps) {
  const { hoveredParam, hoverPosition, helpMode } = useInfoPanel();

  if (!helpMode || !hoveredParam || !hoverPosition) {
    return null;
  }

  const info = getParamInfo(hoveredParam);

  return (
    <div
      className="max-w-[280px] bg-[rgba(10,10,15,0.95)] rounded-md py-2.5 px-3.5 pointer-events-none shadow-xl"
      style={{
        '--accent': accentColor,
        position: 'fixed',
        left: hoverPosition.x + 16,
        top: hoverPosition.y - 8,
        zIndex: 10000,
        border: `1px solid ${accentColor}66`,
        animation: 'tooltipFadeIn 0.15s ease-out',
      } as React.CSSProperties}
    >
      {/* Parameter name */}
      <div className="text-(--accent) text-base font-semibold mb-1 uppercase tracking-wide">
        {info.name}
      </div>

      {/* Description */}
      <div className="text-[#ccc] text-md leading-snug">
        {info.description}
      </div>

      {/* Tips (if available) */}
      {info.tips && (
        <div className="text-text-tertiary text-base leading-snug mt-1.5 italic border-t border-border-medium pt-1.5">
          {info.tips}
        </div>
      )}
    </div>
  );
}
