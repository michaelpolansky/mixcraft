/**
 * MIXCRAFT Type Definitions
 * Single source of truth for all interfaces
 */

// ============================================
// Oscillator Types
// ============================================

export type OscillatorType = 'sine' | 'sawtooth' | 'square' | 'triangle';

export interface OscillatorParams {
  type: OscillatorType;
  /** Octave offset from base frequency (-2 to +2) */
  octave: number;
  /** Detune in cents (-100 to +100) */
  detune: number;
}

// ============================================
// Filter Types
// ============================================

export type FilterType = 'lowpass' | 'highpass' | 'bandpass';

export interface FilterParams {
  type: FilterType;
  /** Cutoff frequency in Hz (20 to 20000) */
  cutoff: number;
  /** Resonance / Q factor (0.1 to 20) */
  resonance: number;
}

// ============================================
// Envelope Types
// ============================================

export interface ADSREnvelope {
  /** Attack time in seconds (0.001 to 2) */
  attack: number;
  /** Decay time in seconds (0.001 to 2) */
  decay: number;
  /** Sustain level (0 to 1) */
  sustain: number;
  /** Release time in seconds (0.001 to 5) */
  release: number;
}

export interface FilterEnvelopeParams extends ADSREnvelope {
  /** How much the envelope affects the filter cutoff in octaves (-4 to +4) */
  amount: number;
}

// ============================================
// LFO Types
// ============================================

export type LFOWaveform = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface LFOParams {
  /** LFO rate in Hz (0.1 to 20) */
  rate: number;
  /** LFO depth/amount (0 to 1) */
  depth: number;
  /** LFO waveform shape */
  waveform: LFOWaveform;
}

// ============================================
// Effects Types
// ============================================

export interface DistortionParams {
  /** Distortion amount (0 to 1) */
  amount: number;
  /** Dry/wet mix (0 to 1) */
  mix: number;
}

export interface DelayParams {
  /** Delay time in seconds (0.01 to 1) */
  time: number;
  /** Feedback amount (0 to 0.9) */
  feedback: number;
  /** Dry/wet mix (0 to 1) */
  mix: number;
}

export interface ReverbParams {
  /** Decay time in seconds (0.1 to 10) */
  decay: number;
  /** Dry/wet mix (0 to 1) */
  mix: number;
}

export interface ChorusParams {
  /** Modulation rate in Hz (0.1 to 10) */
  rate: number;
  /** Modulation depth (0 to 1) */
  depth: number;
  /** Dry/wet mix (0 to 1) */
  mix: number;
}

export interface EffectsParams {
  distortion: DistortionParams;
  delay: DelayParams;
  reverb: ReverbParams;
  chorus: ChorusParams;
}

// ============================================
// Complete Synth State
// ============================================

export interface SynthParams {
  oscillator: OscillatorParams;
  filter: FilterParams;
  filterEnvelope: FilterEnvelopeParams;
  amplitudeEnvelope: ADSREnvelope;
  /** LFO modulating filter cutoff */
  lfo: LFOParams;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_OSCILLATOR: OscillatorParams = {
  type: 'sawtooth',
  octave: 0,
  detune: 0,
};

export const DEFAULT_FILTER: FilterParams = {
  type: 'lowpass',
  cutoff: 2000,
  resonance: 1,
};

export const DEFAULT_AMPLITUDE_ENVELOPE: ADSREnvelope = {
  attack: 0.01,
  decay: 0.2,
  sustain: 0.5,
  release: 0.3,
};

export const DEFAULT_FILTER_ENVELOPE: FilterEnvelopeParams = {
  attack: 0.01,
  decay: 0.3,
  sustain: 0.3,
  release: 0.5,
  amount: 2,
};

export const DEFAULT_LFO: LFOParams = {
  rate: 1,
  depth: 0,
  waveform: 'sine',
};

export const DEFAULT_DISTORTION: DistortionParams = {
  amount: 0,
  mix: 0,
};

export const DEFAULT_DELAY: DelayParams = {
  time: 0.25,
  feedback: 0.3,
  mix: 0,
};

export const DEFAULT_REVERB: ReverbParams = {
  decay: 1.5,
  mix: 0,
};

export const DEFAULT_CHORUS: ChorusParams = {
  rate: 1.5,
  depth: 0.5,
  mix: 0,
};

export const DEFAULT_EFFECTS: EffectsParams = {
  distortion: DEFAULT_DISTORTION,
  delay: DEFAULT_DELAY,
  reverb: DEFAULT_REVERB,
  chorus: DEFAULT_CHORUS,
};

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  oscillator: DEFAULT_OSCILLATOR,
  filter: DEFAULT_FILTER,
  filterEnvelope: DEFAULT_FILTER_ENVELOPE,
  amplitudeEnvelope: DEFAULT_AMPLITUDE_ENVELOPE,
  lfo: DEFAULT_LFO,
  effects: DEFAULT_EFFECTS,
  volume: -12,
};

// ============================================
// Parameter Ranges (for UI validation)
// ============================================

export const PARAM_RANGES = {
  octave: { min: -2, max: 2, step: 1 },
  detune: { min: -100, max: 100, step: 1 },
  cutoff: { min: 20, max: 20000, step: 1 },
  resonance: { min: 0.1, max: 20, step: 0.1 },
  attack: { min: 0.001, max: 2, step: 0.001 },
  decay: { min: 0.001, max: 2, step: 0.001 },
  sustain: { min: 0, max: 1, step: 0.01 },
  release: { min: 0.001, max: 5, step: 0.001 },
  filterEnvAmount: { min: -4, max: 4, step: 0.1 },
  lfoRate: { min: 0.1, max: 20, step: 0.1 },
  lfoDepth: { min: 0, max: 1, step: 0.01 },
  volume: { min: -60, max: 0, step: 0.5 },
  // Effects
  distortionAmount: { min: 0, max: 1, step: 0.01 },
  distortionMix: { min: 0, max: 1, step: 0.01 },
  delayTime: { min: 0.01, max: 1, step: 0.01 },
  delayFeedback: { min: 0, max: 0.9, step: 0.01 },
  delayMix: { min: 0, max: 1, step: 0.01 },
  reverbDecay: { min: 0.1, max: 10, step: 0.1 },
  reverbMix: { min: 0, max: 1, step: 0.01 },
  chorusRate: { min: 0.1, max: 10, step: 0.1 },
  chorusDepth: { min: 0, max: 1, step: 0.01 },
  chorusMix: { min: 0, max: 1, step: 0.01 },
} as const;

// ============================================
// Audio Analysis Types
// ============================================

export interface SpectrumData {
  /** Frequency bin values (0-255 for each bin) */
  frequencies: Uint8Array;
  /** Number of frequency bins (FFT size / 2) */
  binCount: number;
  /** Sample rate of the audio context */
  sampleRate: number;
}

export interface AnalyserConfig {
  /** FFT size (must be power of 2, 32-32768) */
  fftSize: number;
  /** Smoothing time constant (0-1) */
  smoothingTimeConstant: number;
  /** Min decibels for range */
  minDecibels: number;
  /** Max decibels for range */
  maxDecibels: number;
}

export const DEFAULT_ANALYSER_CONFIG: AnalyserConfig = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
};

// ============================================
// Challenge Types
// ============================================

export interface Challenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to create */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Target synth parameters to match */
  targetParams: SynthParams;
  /** Progressive hints (revealed one at a time) */
  hints: string[];
  /** Curriculum module (e.g., "SD1") */
  module: string;
  /** Note to play for comparison (e.g., "C4") */
  testNote: string;
}

export interface ChallengeProgress {
  /** Challenge ID */
  challengeId: string;
  /** Best score achieved (0-100) */
  bestScore: number;
  /** Stars earned (0-3, 0 = not passed) */
  stars: 0 | 1 | 2 | 3;
  /** Number of attempts */
  attempts: number;
  /** Whether challenge is completed (passed at least once) */
  completed: boolean;
}

// ============================================
// Mixing Challenge Types
// ============================================

// Re-export mixing effect types
export type {
  EQParams,
  CompressorSimpleParams,
  CompressorFullParams,
} from './mixing-effects.ts';

export type { AudioSourceConfig, AudioSource } from './audio-source.ts';

/** Audio source type for mixing challenges */
export type MixingSourceType = 'tone' | 'noise' | 'drum' | 'bass' | 'pad';

/** Target settings for EQ matching challenges (F1-F3) */
export interface EQTarget {
  type: 'eq';
  low: number;
  mid: number;
  high: number;
}

/** Target settings for compression matching challenges (F4-F5) */
export interface CompressorTarget {
  type: 'compressor';
  threshold: number;
  amount: number;
  attack?: number;   // Only for F5
  release?: number;  // Only for F5
}

/** Problem detection for F6-F8 (identify and fix issues) */
export interface MixingProblem {
  type: 'problem';
  /** Description of the audio problem */
  description: string;
  /** Acceptable solution ranges */
  solution: {
    eq?: Partial<{ low: [number, number]; mid: [number, number]; high: [number, number] }>;
    compressor?: Partial<{ threshold: [number, number]; amount: [number, number] }>;
  };
}

/** Union type for mixing challenge targets */
export type MixingTarget = EQTarget | CompressorTarget | MixingProblem;

/** Mixing challenge definition */
export interface MixingChallenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to achieve */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Audio source configuration */
  sourceConfig: {
    type: MixingSourceType;
    frequency?: number;
  };
  /** Target to match or problem to solve */
  target: MixingTarget;
  /** Progressive hints */
  hints: string[];
  /** Curriculum module (e.g., "F1", "F2") */
  module: string;
  /** Available controls for this challenge */
  controls: {
    eq: boolean;
    compressor: boolean | 'simple' | 'full';
  };
}

/** Union type for all challenge types */
export type AnyChallenge = Challenge | MixingChallenge;

/** Type guard for mixing challenges */
export function isMixingChallenge(challenge: AnyChallenge): challenge is MixingChallenge {
  return 'sourceConfig' in challenge && 'controls' in challenge;
}
