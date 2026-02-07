/**
 * Preset dropdown selector component
 * Allows users to quickly load pre-configured parameter sets
 */

import { useState, useRef, useEffect } from 'react';

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
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '6px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          minWidth: '140px',
          justifyContent: 'space-between',
          transition: 'border-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#333';
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentPreset || 'Select Preset'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
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
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {presets.map(({ name }) => (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: currentPreset === name ? `${accentColor}20` : 'transparent',
                border: 'none',
                borderLeft: currentPreset === name ? `2px solid ${accentColor}` : '2px solid transparent',
                color: currentPreset === name ? accentColor : '#ccc',
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (currentPreset !== name) {
                  e.currentTarget.style.background = '#1a1a1a';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPreset !== name) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#ccc';
                }
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
