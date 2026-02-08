/**
 * Centralized color palette for MIXCRAFT
 *
 * Usage:
 *   import { COLORS } from '../theme';
 *   style={{ background: COLORS.bg.primary, color: COLORS.text.primary }}
 */

export const COLORS = {
  // Background levels (darkest to lightest)
  bg: {
    primary: '#0a0a0a',     // Main app background
    secondary: '#111111',   // Cards, panels
    tertiary: '#1a1a1a',    // Elevated elements, buttons
    quaternary: '#222222',  // Hover states, borders
  },

  // Border colors
  border: {
    subtle: '#1a1a1a',      // Barely visible separators
    default: '#2a2a2a',     // Standard borders
    medium: '#333333',      // More visible borders
    bright: '#444444',      // High contrast borders
  },

  // Text colors (WCAG AA compliant on dark backgrounds)
  text: {
    primary: '#ffffff',     // Main text
    secondary: '#b0b0b0',   // Secondary text (passes AA on #0a0a0a)
    tertiary: '#888888',    // Tertiary/labels
    disabled: '#555555',    // Disabled state
    muted: '#666666',       // Very subtle text
  },

  // Semantic colors
  success: '#22c55e',       // Green - positive actions, pass states
  successLight: '#4ade80',  // Lighter green for gradients
  warning: '#eab308',       // Yellow - caution states
  danger: '#ef4444',        // Red - errors, destructive actions
  info: '#3b82f6',          // Blue - informational

  // Accent colors
  accent: {
    primary: '#4ade80',     // Primary accent (green)
    secondary: '#22d3ee',   // Secondary accent (cyan) - modulation indicator
    tertiary: '#a855f7',    // Tertiary accent (purple)
  },

  // Synth module stage colors (signal flow)
  synth: {
    oscillator: '#3b82f6',  // Blue - sound source
    filter: '#06b6d4',      // Cyan - frequency shaping
    amp: '#22c55e',         // Green - amplitude/envelope
    lfo: '#f59e0b',         // Amber - modulation
    effects: '#a855f7',     // Purple - effects chain
    output: '#10b981',      // Emerald - final output
    mixer: '#10b981',       // Emerald - mixing stage
  },

  // Track/module type colors (for menu/navigation)
  tracks: {
    soundDesign: '#3b82f6', // Blue
    production: '#22c55e',  // Green
    mixing: '#f59e0b',      // Amber
    sampling: '#a855f7',    // Purple
    drums: '#ef4444',       // Red
  },

  // Interactive states
  interactive: {
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
    focus: '#4ade80',       // Focus ring color
  },

  // Gradients (as CSS strings)
  gradients: {
    success: 'linear-gradient(to right, #22c55e, #4ade80)',
    successVertical: 'linear-gradient(to top, #22c55e, #4ade80)',
    surface: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
  },
} as const;

// Type for synth stage names
export type SynthStage = keyof typeof COLORS.synth;

// Type for track names
export type TrackType = keyof typeof COLORS.tracks;
