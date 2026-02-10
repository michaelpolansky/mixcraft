/**
 * Preset dropdown selector component
 * Allows users to quickly load pre-configured parameter sets
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn.ts';

interface PresetDropdownProps<T> {
  presets: Array<{ name: string; params: T }>;
  currentPreset: string;
  onSelect: (presetName: string) => void;
  accentColor?: string;
}

export function PresetDropdown<T>({
  presets,
  currentPreset,
  onSelect,
  accentColor = '#4ade80',
}: PresetDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (presetName: string) => {
    onSelect(presetName);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block"
      style={{ '--dd-accent': accentColor } as React.CSSProperties}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-2 px-3 bg-bg-secondary border border-border-medium rounded-md text-text-primary cursor-pointer text-md min-w-[140px] justify-between transition-[border-color] duration-150 hover:border-(--dd-accent)"
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {currentPreset || 'Select Preset'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0 transition-transform duration-150"
          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 min-w-full bg-[#141414] border border-border-subtle rounded-md shadow-xl z-[var(--z-dropdown)] overflow-hidden">
          {presets.map(({ name }) => {
            const isActive = currentPreset === name;
            return (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className={cn(
                  'w-full py-2.5 px-3 border-none border-l-2 cursor-pointer text-md text-left transition-all duration-100',
                  isActive
                    ? 'bg-(--dd-accent)/10 border-l-(--dd-accent) text-(--dd-accent)'
                    : 'bg-transparent border-l-transparent text-[#ccc] hover:bg-bg-secondary hover:text-text-primary'
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
