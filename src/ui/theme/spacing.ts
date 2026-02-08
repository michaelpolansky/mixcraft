/**
 * Spacing system for MIXCRAFT
 *
 * Based on 4px base unit for consistent rhythm.
 *
 * Usage:
 *   import { SPACING } from '../theme';
 *   style={{ padding: SPACING.md, gap: SPACING.sm }}
 */

export const SPACING = {
  // Core spacing scale (in pixels)
  none: 0,
  xs: 4,      // 4px - tight spacing
  sm: 8,      // 8px - small gaps
  md: 12,     // 12px - medium spacing
  lg: 16,     // 16px - standard padding
  xl: 24,     // 24px - section spacing
  '2xl': 32,  // 32px - large sections
  '3xl': 48,  // 48px - page padding
  '4xl': 64,  // 64px - major sections
} as const;

// Border radius scale
export const RADIUS = {
  none: 0,
  sm: 4,      // Subtle rounding
  md: 8,      // Standard rounding
  lg: 12,     // Larger rounding
  xl: 16,     // Very rounded
  full: 9999, // Fully rounded (circles, pills)
} as const;

// Common layout values
export const LAYOUT = {
  // Max content widths
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    full: '100%',
  },

  // Component sizes
  controlHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },

  // Touch target minimum (for accessibility)
  minTouchTarget: 44,

  // Standard module card width
  moduleWidth: {
    compact: 180,
    standard: 224,
    wide: 320,
  },

  // Header heights
  headerHeight: 56,

  // Sidebar widths
  sidebarWidth: 280,
} as const;

// Z-index scale for layering
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 100,
} as const;

// Transitions
export const TRANSITIONS = {
  fast: '0.1s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
  spring: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 2px 4px rgba(0, 0, 0, 0.3)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.3)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.4)',
  glow: (color: string) => `0 0 12px ${color}`,
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  neumorphic: '4px 4px 8px #0a0a0a, -2px -2px 6px #3a3a3a',
} as const;
