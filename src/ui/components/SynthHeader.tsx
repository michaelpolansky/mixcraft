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
      <div className="flex justify-between items-center px-6 py-4 pl-[120px] border-b border-[#1a1a1a]">
        <div>
          <h1
            className="text-xl font-light m-0"
            style={{ color: accentColor }}
          >
            {title}
          </h1>
          <span className="text-[11px] text-[#666]">{subtitle}</span>
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
              className="px-3 py-1.5 bg-gradient-to-br from-violet-500 to-violet-600 border-none rounded text-white cursor-pointer text-[11px] font-semibold hover:from-violet-400 hover:to-violet-500 transition-all"
            >
              Randomize
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-[#888] cursor-pointer text-[11px] hover:bg-[#222] transition-all"
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
