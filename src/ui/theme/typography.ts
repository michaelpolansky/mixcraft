/**
 * Typography system for MIXCRAFT
 *
 * Usage:
 *   import { TYPOGRAPHY } from '../theme';
 *   style={{ fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.family.mono }}
 */

export const TYPOGRAPHY = {
  // Font families
  family: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
  },

  // Font sizes (modular scale)
  size: {
    xs: '9px',      // Very small labels
    sm: '10px',     // Labels, captions
    base: '11px',   // Default body text
    md: '12px',     // Slightly larger body
    lg: '13px',     // Subheadings
    xl: '14px',     // Small headings
    '2xl': '16px',  // Medium headings
    '3xl': '18px',  // Large headings
    '4xl': '24px',  // Page titles
    '5xl': '36px',  // Hero text
  },

  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,     // Headings
    normal: 1.4,    // Body text
    relaxed: 1.6,   // Long-form content
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px',
    wider: '1px',
  },
} as const;

// Common text style presets
export const TEXT_STYLES = {
  // Labels (uppercase, small)
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.normal,
    color: '#888888', // Use COLORS.text.tertiary when imported
    textTransform: 'uppercase' as const,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Module/card titles
  moduleTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase' as const,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },

  // Value displays (monospace numbers)
  value: {
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.family.mono,
    fontWeight: TYPOGRAPHY.weight.normal,
  },

  // Body text
  body: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },

  // Headings
  heading: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },

  // Page titles
  title: {
    fontSize: TYPOGRAPHY.size['4xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
} as const;
