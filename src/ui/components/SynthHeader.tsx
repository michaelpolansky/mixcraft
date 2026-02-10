/**
 * SynthHeader - Header bar with title, preset dropdown, and action buttons
 */

import type { ReactNode } from 'react';
import { PresetDropdown } from './PresetDropdown.tsx';
import { Tooltip } from './Tooltip.tsx';

export interface SynthHeaderProps {
  title: string;
  subtitle: string;
  accentColor: string;
  presets: Array<{ name: string; params: unknown }>;
  currentPreset: string | null;
  onPresetSelect: (name: string) => void;
  onRandomize?: () => void;
  onReset: () => void;
  helpButton?: ReactNode;
}

export function SynthHeader({
  title,
  subtitle,
  accentColor,
  presets,
  currentPreset,
  onPresetSelect,
  onRandomize,
  onReset,
  helpButton,
}: SynthHeaderProps) {
  return (
    <>
      <div
        className="flex justify-between items-center px-6 py-4 pl-[120px] border-b border-border-subtle"
        style={{ '--header-accent': accentColor } as React.CSSProperties}
      >
        <div>
          <h1 className="text-xl font-light m-0 text-(--header-accent)">
            {title}
          </h1>
          <span className="text-base text-text-muted">{subtitle}</span>
        </div>
        <div className="flex gap-3 items-center">
          <PresetDropdown
            presets={presets}
            currentPreset={currentPreset ?? ''}
            onSelect={onPresetSelect}
            accentColor={accentColor}
          />
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="px-3 py-1.5 bg-gradient-to-br from-violet-500 to-violet-600 border-none rounded text-white cursor-pointer text-base font-semibold hover:from-violet-400 hover:to-violet-500 transition-all"
            >
              Randomize
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-bg-secondary border border-border-medium rounded text-text-muted cursor-pointer text-base hover:bg-bg-tertiary transition-all"
          >
            Reset
          </button>
          {helpButton}
        </div>
      </div>
      <Tooltip accentColor={accentColor} />
    </>
  );
}
