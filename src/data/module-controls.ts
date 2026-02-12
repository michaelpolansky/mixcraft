/**
 * Module Controls Map
 * Maps sound design modules to which synth sections are visible.
 * This implements progressive tool complexity — early modules show
 * only the controls being taught, while later modules unlock everything.
 */

import type { Challenge, SynthAvailableControls, ChallengeVisualization, VizMode, OscillatorControls, FilterControls, AmpEnvelopeControls, FilterEnvelopeControls, LFOControls, EffectsControls } from '../core/types.ts';

/** Union of all per-section control config types */
type SectionConfig = boolean | OscillatorControls | FilterControls | AmpEnvelopeControls | FilterEnvelopeControls | LFOControls | EffectsControls | undefined;

/** All controls visible (default for advanced modules) */
const ALL_CONTROLS: SynthAvailableControls = {
  oscillator: true,
  filter: true,
  amplitudeEnvelope: true,
  filterEnvelope: true,
  lfo: true,
  effects: true,
  output: true,
};

/**
 * Module-to-controls map for subtractive sound design challenges.
 * Each module progressively reveals more synth sections as concepts build:
 *
 * SD1  — Oscillator basics: just waveform + output
 * SD2  — Filter basics: adds filter controls
 * SD3  — Envelopes: adds amp + filter envelopes
 * SD4  — Modulation: adds LFO
 * SD5+ — Full synth: adds effects (all sections visible)
 */
const MODULE_CONTROLS: Record<string, SynthAvailableControls> = {
  SD1: { oscillator: true, output: true },
  SD2: { oscillator: true, filter: true, output: true },
  SD3: { oscillator: true, filter: true, amplitudeEnvelope: true, filterEnvelope: true, output: true },
  SD4: { oscillator: true, filter: true, amplitudeEnvelope: true, filterEnvelope: true, lfo: true, output: true },
  // SD5+ uses ALL_CONTROLS (fallthrough to default)
};

/**
 * Get the available synth controls for a challenge.
 *
 * Priority:
 * 1. Per-challenge override (`challenge.availableControls`)
 * 2. Module-level default (`MODULE_CONTROLS[module]`)
 * 3. All controls visible (fallback)
 */
export function getAvailableControls(challenge: Challenge): SynthAvailableControls {
  // Per-challenge override takes highest priority
  if (challenge.availableControls) {
    return challenge.availableControls;
  }

  // Module-level default
  const moduleControls = MODULE_CONTROLS[challenge.module];
  if (moduleControls) {
    return moduleControls;
  }

  // Fallback: all controls visible
  return ALL_CONTROLS;
}

/**
 * Is a specific control within a section visible?
 *
 * Handles the three states of section visibility:
 * - `undefined`/`false`: section hidden → all controls hidden
 * - `true`: show-all mode → every control visible
 * - Object: only explicitly-true controls are visible
 */
export function isControlVisible(
  section: SectionConfig,
  control: string,
): boolean {
  if (!section) return false;
  if (section === true) return true;
  return (section as Record<string, boolean | undefined>)[control] === true;
}

/**
 * Is a section visible at all? (true if `true`, or if any control in object is true)
 */
export function isSectionVisible(
  section: SectionConfig,
): boolean {
  if (!section) return false;
  if (section === true) return true;
  return Object.values(section).some(v => v === true);
}

/** Default visualization by module */
const MODULE_VIZ: Record<string, ChallengeVisualization> = {
  SD1: 'oscilloscope',
  SD2: 'filter',
  SD3: 'envelope',
  SD4: 'lfo',
  SD5: 'effects',
};

/**
 * Get the visualization panels to show for a challenge.
 *
 * Priority:
 * 1. Per-challenge `visualizations` array (from availableControls)
 * 2. Module-level default (spectrum + module-specific viz)
 * 3. Fallback: spectrum + oscilloscope
 */
export function getVisualizations(challenge: Challenge): ChallengeVisualization[] {
  const controls = getAvailableControls(challenge);
  if (controls.visualizations) return controls.visualizations;
  const moduleViz = MODULE_VIZ[challenge.module];
  return moduleViz ? ['spectrum', moduleViz] : ['spectrum', 'oscilloscope'];
}

// ── Visualization Layout Modes ──────────────────────────────────────

/** Standard dimensions for each visualization panel (width x height) */
export const STANDARD_DIMS: Record<ChallengeVisualization, { width: number; height: number }> = {
  spectrum: { width: 450, height: 200 },
  oscilloscope: { width: 450, height: 120 },
  filter: { width: 450, height: 150 },
  envelope: { width: 450, height: 150 },
  lfo: { width: 450, height: 150 },
  effects: { width: 450, height: 150 },
};

/** Layout result: which panels to show and any dimension overrides */
export interface VizLayout {
  panels: ChallengeVisualization[];
  dimensions: Partial<Record<ChallengeVisualization, { width?: number; height?: number }>>;
}

/**
 * Compute the visualization layout for a given mode.
 *
 * Operates on the output of `getVisualizations()` — respects progressive
 * visibility by only filtering panels that are already in the list.
 */
export function getVizLayout(vizList: ChallengeVisualization[], mode: VizMode): VizLayout {
  switch (mode) {
    case 'spectrum': {
      const panels = vizList.filter(v => v === 'spectrum' || v === 'oscilloscope');
      return {
        panels,
        dimensions: { spectrum: { height: 320 }, oscilloscope: { height: 60 } },
      };
    }
    case 'waveform': {
      // Oscilloscope first (expanded), spectrum second (compact)
      const filtered = vizList.filter(v => v === 'oscilloscope' || v === 'spectrum');
      const panels: ChallengeVisualization[] = [];
      if (filtered.includes('oscilloscope')) panels.push('oscilloscope');
      if (filtered.includes('spectrum')) panels.push('spectrum');
      return {
        panels,
        dimensions: { oscilloscope: { height: 300 }, spectrum: { height: 70 } },
      };
    }
    case 'compare':
      return {
        panels: vizList.filter(v => v === 'spectrum'),
        dimensions: { spectrum: { width: 215, height: 200 } },
      };
    case 'minimal':
      return {
        panels: [...vizList],
        dimensions: {
          spectrum: { height: 80 },
          oscilloscope: { height: 60 },
          filter: { height: 60 },
          envelope: { height: 60 },
          lfo: { height: 60 },
          effects: { height: 60 },
        },
      };
    default:
      return { panels: [...vizList], dimensions: {} };
  }
}

/**
 * Get the resolved dimensions for a visualization panel.
 * Layout overrides take priority; falls back to STANDARD_DIMS.
 */
export function getVizDims(
  viz: ChallengeVisualization,
  layout: VizLayout,
): { width: number; height: number } {
  const standard = STANDARD_DIMS[viz];
  const override = layout.dimensions[viz];
  if (!override) return standard;
  return {
    width: override.width ?? standard.width,
    height: override.height ?? standard.height,
  };
}
