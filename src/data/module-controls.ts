/**
 * Module Controls Map
 * Maps sound design modules to which synth sections are visible.
 * This implements progressive tool complexity — early modules show
 * only the controls being taught, while later modules unlock everything.
 */

import type { Challenge, SynthAvailableControls, ChallengeVisualization, OscillatorControls, FilterControls, AmpEnvelopeControls, FilterEnvelopeControls, LFOControls, EffectsControls } from '../core/types.ts';

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
