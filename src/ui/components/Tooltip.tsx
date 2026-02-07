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

  // Only show when help mode is on and something is hovered
  if (!helpMode || !hoveredParam || !hoverPosition) {
    return null;
  }

  const info = getParamInfo(hoveredParam);

  // Calculate tooltip position (offset from cursor)
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: hoverPosition.x + 16,
    top: hoverPosition.y - 8,
    maxWidth: '280px',
    background: 'rgba(10, 10, 15, 0.95)',
    border: `1px solid ${accentColor}66`,
    borderRadius: '8px',
    padding: '10px 14px',
    zIndex: 10000,
    pointerEvents: 'none',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    animation: 'tooltipFadeIn 0.15s ease-out',
  };

  return (
    <>
      {/* Keyframes for animation */}
      <style>
        {`
          @keyframes tooltipFadeIn {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={tooltipStyle}>
        {/* Parameter name */}
        <div
          style={{
            color: accentColor,
            fontSize: '11px',
            fontWeight: 600,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {info.name}
        </div>

        {/* Description */}
        <div
          style={{
            color: '#ccc',
            fontSize: '12px',
            lineHeight: 1.4,
          }}
        >
          {info.description}
        </div>

        {/* Tips (if available) */}
        {info.tips && (
          <div
            style={{
              color: '#888',
              fontSize: '11px',
              lineHeight: 1.4,
              marginTop: '6px',
              fontStyle: 'italic',
              borderTop: '1px solid #333',
              paddingTop: '6px',
            }}
          >
            {info.tips}
          </div>
        )}
      </div>
    </>
  );
}
