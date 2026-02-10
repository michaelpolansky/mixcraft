/**
 * ModuleCard Component
 * Color-coded section wrapper for synth modules
 * Provides subtle color accents to distinguish different module types
 */

import { useState, type ReactNode } from 'react';
import { COLORS } from '../theme/index.ts';
import { cn } from '../utils/cn.ts';

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

  return (
    <div
      className="bg-bg-secondary rounded-lg border overflow-hidden transition-[border-color] duration-200"
      style={{
        '--module-color': color,
        borderColor: `${color}40`,
      } as React.CSSProperties}
    >
      {/* Header with color accent */}
      <div
        onClick={onToggle ? handleToggle : undefined}
        className={cn(
          'flex items-center gap-2 py-3 px-4 select-none',
          onToggle && 'cursor-pointer',
          !isCollapsed && 'border-b'
        )}
        style={{
          background: `${color}15`,
          borderBottomColor: isCollapsed ? 'transparent' : `${color}20`,
        }}
      >
        {/* Color accent bar */}
        <div
          className="w-[3px] h-4 rounded-sm shrink-0"
          style={{ background: color }}
        />

        {/* Icon */}
        {icon && (
          <div className="flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3
          className="m-0 text-base font-semibold uppercase tracking-wider flex-1 text-(--module-color)"
        >
          {title}
        </h3>

        {/* Collapse indicator */}
        {onToggle && (
          <div
            className="text-text-muted text-sm transition-transform duration-200"
            style={{ transform: isCollapsed ? 'rotate(-90deg)' : undefined }}
          >
            ▼
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
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
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
      <h3 className="m-0 mb-3 text-base font-semibold text-text-muted uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}
