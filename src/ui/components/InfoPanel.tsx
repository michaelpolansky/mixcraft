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
      style={{
        background: '#0d0d0d',
        borderTop: `1px solid ${accentColor}33`,
        padding: '12px 16px',
        minHeight: '72px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* Parameter name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            color: accentColor,
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {hoveredParam ? 'i' : '?'}
        </span>
        <span
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {info.name}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          color: '#999',
          fontSize: '12px',
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {info.description}
      </p>

      {/* Tips */}
      {info.tips && (
        <p
          style={{
            color: '#666',
            fontSize: '11px',
            lineHeight: 1.4,
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          {info.tips}
        </p>
      )}
    </div>
  );
}
