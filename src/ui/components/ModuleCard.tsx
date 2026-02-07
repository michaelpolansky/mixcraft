/**
 * ModuleCard Component
 * Color-coded section wrapper for synth modules
 * Provides subtle color accents to distinguish different module types
 */

import { useState, type ReactNode } from 'react';

interface ModuleCardProps {
  title: string;
  color: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Module color presets
export const MODULE_COLORS = {
  oscillator: '#3b82f6', // Blue
  filter: '#06b6d4', // Cyan
  ampEnvelope: '#22c55e', // Green
  filterEnvelope: '#eab308', // Yellow
  lfo: '#ef4444', // Red
  effects: '#8b5cf6', // Purple
  output: '#f97316', // Orange
  modulation: '#f97316', // Orange (for FM)
  harmonics: '#06b6d4', // Cyan (for Additive)
  spectrum: '#10b981', // Emerald
  keyboard: '#6366f1', // Indigo
  sequencer: '#ec4899', // Pink
  xypad: '#14b8a6', // Teal
} as const;

export function ModuleCard({
  title,
  color,
  icon,
  children,
  collapsed: controlledCollapsed,
  onToggle,
}: ModuleCardProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Create a subtle color with reduced opacity for the border
  const borderColor = color;
  const headerBg = `${color}15`; // 15% opacity for header background tint

  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        border: `1px solid ${borderColor}40`, // 40% opacity border
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Header with color accent */}
      <div
        onClick={onToggle ? handleToggle : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: headerBg,
          borderBottom: isCollapsed ? 'none' : `1px solid ${borderColor}20`,
          cursor: onToggle ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            width: '3px',
            height: '16px',
            background: color,
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />

        {/* Icon */}
        {icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            flex: 1,
          }}
        >
          {title}
        </h3>

        {/* Collapse indicator */}
        {onToggle && (
          <div
            style={{
              color: '#666',
              fontSize: '10px',
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            ▼
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Simple Section component for backwards compatibility
 * Can be used as a drop-in replacement without color styling
 */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
