/**
 * ModuleCard Component
 * Color-coded section wrapper for synth modules
 * Provides subtle color accents to distinguish different module types
 */

import { useState, type ReactNode } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TRANSITIONS } from '../theme/index.ts';

interface ModuleCardProps {
  title: string;
  color: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Module color presets (references theme where applicable)
export const MODULE_COLORS = {
  oscillator: COLORS.synth.oscillator,    // Blue
  filter: COLORS.synth.filter,            // Cyan
  ampEnvelope: COLORS.synth.amp,          // Green
  filterEnvelope: COLORS.warning,         // Yellow
  lfo: COLORS.synth.lfo,                  // Amber
  effects: COLORS.synth.effects,          // Purple
  output: COLORS.synth.output,            // Emerald
  modulation: COLORS.synth.lfo,           // Amber (for FM)
  harmonics: COLORS.synth.filter,         // Cyan (for Additive)
  spectrum: COLORS.synth.output,          // Emerald
  keyboard: '#6366f1',                    // Indigo
  sequencer: '#ec4899',                   // Pink
  xypad: '#14b8a6',                       // Teal
  mixer: COLORS.synth.mixer,              // Emerald
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
        background: COLORS.bg.secondary,
        borderRadius: RADIUS.lg,
        border: `1px solid ${borderColor}40`, // 40% opacity border
        overflow: 'hidden',
        transition: `border-color ${TRANSITIONS.normal}`,
      }}
    >
      {/* Header with color accent */}
      <div
        onClick={onToggle ? handleToggle : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.sm,
          padding: `${SPACING.md}px ${SPACING.lg}px`,
          background: headerBg,
          borderBottom: isCollapsed ? 'none' : `1px solid ${borderColor}20`,
          cursor: onToggle ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            width: 3,
            height: SPACING.lg,
            background: color,
            borderRadius: RADIUS.sm,
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
            fontSize: TYPOGRAPHY.size.base,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: TYPOGRAPHY.letterSpacing.wider,
            flex: 1,
          }}
        >
          {title}
        </h3>

        {/* Collapse indicator */}
        {onToggle && (
          <div
            style={{
              color: COLORS.text.muted,
              fontSize: TYPOGRAPHY.size.sm,
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: `transform ${TRANSITIONS.normal}`,
            }}
          >
            ▼
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ padding: SPACING.lg }}>
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
        background: COLORS.bg.secondary,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        border: `1px solid ${COLORS.border.default}`,
      }}
    >
      <h3
        style={{
          margin: `0 0 ${SPACING.md}px 0`,
          fontSize: TYPOGRAPHY.size.base,
          fontWeight: TYPOGRAPHY.weight.semibold,
          color: COLORS.text.muted,
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.wider,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
