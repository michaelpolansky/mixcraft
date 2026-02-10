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

  // Synth module stage colors (signal flow) — used by Canvas components
  synth: {
    oscillator: '#3b82f6',  // Blue - sound source
    subOsc: '#1e40af',      // Dark blue - sub oscillator
    osc2: '#60a5fa',        // Light blue - oscillator 2
    noise: '#64748b',       // Slate - noise generator
    filter: '#06b6d4',      // Cyan - frequency shaping
    amp: '#22c55e',         // Green - amplitude/envelope
    filterEnv: '#eab308',   // Yellow - filter envelope
    lfo: '#ef4444',         // Red - LFO
    lfo2: '#dc2626',        // Dark red - LFO 2
    velocity: '#fb923c',    // Orange - velocity
    pitchEnv: '#f472b6',    // Pink - pitch envelope
    modEnv: '#a855f7',      // Purple - mod envelope
    pwmEnv: '#14b8a6',      // Teal - PWM envelope
    effects: '#8b5cf6',     // Violet - effects chain
    output: '#f97316',      // Orange - final output
    modMatrix: '#a855f7',   // Purple - mod matrix
    arp: '#f59e0b',         // Amber - arpeggiator
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
