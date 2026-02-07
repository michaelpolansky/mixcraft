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
  /** Pulse width for square wave (0.1 to 0.9, 0.5 = 50% duty cycle) */
  pulseWidth: number;
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
  /** Key tracking amount (0 to 1) - how much filter follows pitch */
  keyTracking: number;
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

export interface PitchEnvelopeParams extends ADSREnvelope {
  /** How much the envelope affects pitch in semitones (-24 to +24) */
  amount: number;
}

export interface ModEnvelopeParams extends ADSREnvelope {
  /** How much the envelope affects LFO depth (0 to 1) */
  amount: number;
}

export interface PWMEnvelopeParams extends ADSREnvelope {
  /** How much the envelope affects pulse width (0 to 1, only for square wave) */
  amount: number;
}

// ============================================
// LFO Types
// ============================================

export type LFOWaveform = 'sine' | 'square' | 'triangle' | 'sawtooth';

/** LFO sync divisions for tempo-synced modulation */
export type LFOSyncDivision = '1n' | '2n' | '4n' | '8n' | '16n' | '32n';

export interface LFOParams {
  /** LFO rate in Hz (0.1 to 20) - used when sync is off */
  rate: number;
  /** LFO depth/amount (0 to 1) */
  depth: number;
  /** LFO waveform shape */
  waveform: LFOWaveform;
  /** Whether LFO is synced to tempo */
  sync: boolean;
  /** Sync division when sync is enabled */
  syncDivision: LFOSyncDivision;
}

// ============================================
// Noise Types
// ============================================

export type NoiseType = 'white' | 'pink' | 'brown';

export interface NoiseParams {
  /** Type of noise */
  type: NoiseType;
  /** Noise level/mix (0 to 1) */
  level: number;
}

// ============================================
// Glide/Portamento Types
// ============================================

export interface GlideParams {
  /** Whether glide is enabled */
  enabled: boolean;
  /** Glide time in seconds (0.01 to 2) */
  time: number;
}

// ============================================
// Velocity Sensitivity
// ============================================

export interface VelocityParams {
  /** How much velocity affects amplitude (0 to 1) */
  ampAmount: number;
  /** How much velocity affects filter envelope (0 to 1) */
  filterAmount: number;
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
  /** Noise generator mixed with oscillator */
  noise: NoiseParams;
  /** Portamento/glide between notes */
  glide: GlideParams;
  filter: FilterParams;
  filterEnvelope: FilterEnvelopeParams;
  amplitudeEnvelope: ADSREnvelope;
  /** Pitch envelope for oscillator frequency modulation */
  pitchEnvelope: PitchEnvelopeParams;
  /** Mod envelope for LFO depth modulation */
  modEnvelope: ModEnvelopeParams;
  /** PWM envelope for pulse width modulation (square wave only) */
  pwmEnvelope: PWMEnvelopeParams;
  /** LFO modulating filter cutoff */
  lfo: LFOParams;
  /** Velocity sensitivity settings */
  velocity: VelocityParams;
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
  pulseWidth: 0.5,
};

export const DEFAULT_FILTER: FilterParams = {
  type: 'lowpass',
  cutoff: 2000,
  resonance: 1,
  keyTracking: 0,
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

export const DEFAULT_PITCH_ENVELOPE: PitchEnvelopeParams = {
  attack: 0.001,
  decay: 0.1,
  sustain: 0,
  release: 0.1,
  amount: 0,
};

export const DEFAULT_MOD_ENVELOPE: ModEnvelopeParams = {
  attack: 0.5,
  decay: 0.5,
  sustain: 0.5,
  release: 0.5,
  amount: 0,
};

export const DEFAULT_PWM_ENVELOPE: PWMEnvelopeParams = {
  attack: 0.01,
  decay: 0.3,
  sustain: 0.5,
  release: 0.3,
  amount: 0,
};

export const DEFAULT_LFO: LFOParams = {
  rate: 1,
  depth: 0,
  waveform: 'sine',
  sync: false,
  syncDivision: '4n',
};

export const DEFAULT_NOISE: NoiseParams = {
  type: 'white',
  level: 0,
};

export const DEFAULT_GLIDE: GlideParams = {
  enabled: false,
  time: 0.1,
};

export const DEFAULT_VELOCITY: VelocityParams = {
  ampAmount: 0,
  filterAmount: 0,
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
  noise: DEFAULT_NOISE,
  glide: DEFAULT_GLIDE,
  filter: DEFAULT_FILTER,
  filterEnvelope: DEFAULT_FILTER_ENVELOPE,
  amplitudeEnvelope: DEFAULT_AMPLITUDE_ENVELOPE,
  pitchEnvelope: DEFAULT_PITCH_ENVELOPE,
  modEnvelope: DEFAULT_MOD_ENVELOPE,
  pwmEnvelope: DEFAULT_PWM_ENVELOPE,
  lfo: DEFAULT_LFO,
  velocity: DEFAULT_VELOCITY,
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
// FM Synth Types
// ============================================

export interface FMSynthParams {
  /** Ratio between modulator and carrier frequency (0.5 to 12) */
  harmonicity: number;
  /** Depth of frequency modulation (0 to 10) */
  modulationIndex: number;
  /** Carrier oscillator waveform */
  carrierType: OscillatorType;
  /** Modulator oscillator waveform */
  modulatorType: OscillatorType;
  /** Amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** How much the modulation envelope affects modIndex (0 to 1) */
  modulationEnvelopeAmount: number;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
}

export const DEFAULT_FM_SYNTH_PARAMS: FMSynthParams = {
  harmonicity: 1,
  modulationIndex: 2,
  carrierType: 'sine',
  modulatorType: 'sine',
  amplitudeEnvelope: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.5,
  },
  modulationEnvelopeAmount: 0.5,
  effects: DEFAULT_EFFECTS,
  volume: -12,
};

export const FM_PARAM_RANGES = {
  harmonicity: { min: 0.5, max: 12, step: 0.1 },
  modulationIndex: { min: 0, max: 10, step: 0.1 },
  modulationEnvelopeAmount: { min: 0, max: 1, step: 0.01 },
} as const;

/** Common harmonicity presets for quick selection */
export const HARMONICITY_PRESETS = [1, 2, 3, 4, 5, 6] as const;

// ============================================
// Additive Synth Types
// ============================================

export interface AdditiveSynthParams {
  /** Amplitude of each harmonic partial (16 values, each 0-1) */
  harmonics: number[];
  /** Amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
}

export const DEFAULT_ADDITIVE_SYNTH_PARAMS: AdditiveSynthParams = {
  harmonics: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  amplitudeEnvelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
  },
  effects: DEFAULT_EFFECTS,
  volume: -12,
};

/** Harmonic presets for common waveforms and timbres */
export const ADDITIVE_PRESETS = {
  /** Sawtooth wave: all harmonics with 1/n amplitude */
  saw: Array.from({ length: 16 }, (_, i) => 1 / (i + 1)),
  /** Square wave: odd harmonics only with 1/n amplitude */
  square: Array.from({ length: 16 }, (_, i) => (i + 1) % 2 === 1 ? 1 / (i + 1) : 0),
  /** Triangle wave: odd harmonics only with 1/n² amplitude */
  triangle: Array.from({ length: 16 }, (_, i) => (i + 1) % 2 === 1 ? 1 / Math.pow(i + 1, 2) : 0),
  /** Organ-like timbre: selected harmonics */
  organ: [1, 0.8, 0, 0.6, 0, 0.4, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0],
} as const;

export type AdditivePreset = keyof typeof ADDITIVE_PRESETS;

// ============================================
// Sampler Types
// ============================================

export interface SampleSlice {
  /** Unique identifier for this slice */
  id: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Pitch shift in semitones (-24 to +24) */
  pitch: number;
  /** Velocity/volume (0 to 1) */
  velocity: number;
}

export interface SamplerParams {
  /** URL of the loaded sample (null if no sample loaded) */
  sampleUrl: string | null;
  /** Display name of the sample */
  sampleName: string;
  /** Duration of the sample in seconds */
  duration: number;
  /** Pitch shift in semitones (-24 to +24) */
  pitch: number;
  /** Time stretch factor (0.5 to 2.0) */
  timeStretch: number;
  /** Start point as normalized position (0 to 1) */
  startPoint: number;
  /** End point as normalized position (0 to 1) */
  endPoint: number;
  /** Whether to loop playback */
  loop: boolean;
  /** Whether to play in reverse */
  reverse: boolean;
  /** Sample slices for chopping */
  slices: SampleSlice[];
  /** Currently selected slice index (-1 for full sample) */
  selectedSlice: number;
  /** Amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
  /** Fade in time in seconds */
  fadeIn: number;
  /** Fade out time in seconds */
  fadeOut: number;
}

export const DEFAULT_SAMPLER_PARAMS: SamplerParams = {
  sampleUrl: null,
  sampleName: '',
  duration: 0,
  pitch: 0,
  timeStretch: 1.0,
  startPoint: 0,
  endPoint: 1,
  loop: false,
  reverse: false,
  slices: [],
  selectedSlice: -1,
  amplitudeEnvelope: DEFAULT_AMPLITUDE_ENVELOPE,
  effects: DEFAULT_EFFECTS,
  volume: -12,
  fadeIn: 0,
  fadeOut: 0,
};

export const SAMPLER_PARAM_RANGES = {
  pitch: { min: -24, max: 24, step: 1 },
  timeStretch: { min: 0.5, max: 2.0, step: 0.01 },
  volume: { min: -60, max: 0, step: 0.5 },
  fadeIn: { min: 0, max: 5, step: 0.01 },
  fadeOut: { min: 0, max: 5, step: 0.01 },
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
  /** Synthesis type for this challenge */
  synthesisType?: 'subtractive' | 'fm' | 'additive';
  /** Target synth parameters to match (type depends on synthesisType) */
  targetParams: SynthParams | FMSynthParams | AdditiveSynthParams;
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
export type MixingSourceType = 'tone' | 'noise' | 'drum' | 'bass' | 'pad' | 'vocal' | 'keys' | 'guitar' | 'snare' | 'hihat';

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

// ============================================
// Multi-Track Mixing Types (Intermediate+)
// ============================================

/** Track configuration for multi-track mixing */
export interface MixingTrack {
  /** Unique identifier for this track */
  id: string;
  /** Display name (e.g., "Kick", "Bass") */
  name: string;
  /** Audio source configuration */
  sourceConfig: {
    type: MixingSourceType;
    frequency?: number;
  };
  /** Initial volume in dB (default 0) */
  initialVolume?: number;
  /** Initial pan position (-1 to 1, default 0 center) */
  initialPan?: number;
  /** Color for UI display */
  color?: string;
}

/** Target EQ settings per track for multi-track challenges */
export interface MultiTrackEQTarget {
  type: 'multitrack-eq';
  /** Target EQ settings for each track by ID */
  tracks: Record<string, { low: number; mid: number; high: number }>;
  /** Optional bus compressor target */
  busCompressor?: {
    threshold: number;
    amount: number;
  };
}

/** Goal-based target for multi-track (relative relationships) */
export interface MultiTrackGoalTarget {
  type: 'multitrack-goal';
  /** Description of the goal */
  description: string;
  /** Conditions to check */
  conditions: MultiTrackCondition[];
}

/** Conditions for multi-track goal evaluation */
export type MultiTrackCondition =
  | { type: 'frequency_separation'; track1: string; track2: string; band: 'low' | 'mid' | 'high' }
  | { type: 'relative_level'; louder: string; quieter: string; band: 'low' | 'mid' | 'high' }
  | { type: 'eq_cut'; track: string; band: 'low' | 'mid' | 'high'; minCut: number }
  | { type: 'eq_boost'; track: string; band: 'low' | 'mid' | 'high'; minBoost: number }
  | { type: 'balance'; description: string }
  | { type: 'pan_position'; track: string; position: 'left' | 'center' | 'right' }
  | { type: 'pan_spread'; track1: string; track2: string; minSpread: number }
  | { type: 'pan_opposite'; track1: string; track2: string }
  | { type: 'reverb_amount'; track: string; minMix: number; maxMix?: number }
  | { type: 'reverb_contrast'; dryTrack: string; wetTrack: string; minDifference: number }
  | { type: 'depth_placement'; track: string; depth: 'front' | 'middle' | 'back' }
  | { type: 'volume_louder'; track1: string; track2: string }
  | { type: 'volume_range'; track: string; minDb: number; maxDb: number }
  | { type: 'volume_balanced'; track1: string; track2: string; tolerance: number }
  // Bus-level conditions
  | { type: 'bus_compression'; minAmount: number; maxAmount?: number }
  | { type: 'bus_eq_boost'; band: 'low' | 'mid' | 'high'; minBoost: number }
  | { type: 'bus_eq_cut'; band: 'low' | 'mid' | 'high'; minCut: number };

/** Union type for mixing challenge targets */
export type MixingTarget = EQTarget | CompressorTarget | MixingProblem | MultiTrackEQTarget | MultiTrackGoalTarget;

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
  /** Audio source configuration (for single-track challenges) */
  sourceConfig?: {
    type: MixingSourceType;
    frequency?: number;
  };
  /** Multiple tracks (for Intermediate+ multi-track challenges) */
  tracks?: MixingTrack[];
  /** Target to match or problem to solve */
  target: MixingTarget;
  /** Progressive hints */
  hints: string[];
  /** Curriculum module (e.g., "F1", "F2", "I1") */
  module: string;
  /** Available controls for this challenge */
  controls: {
    eq: boolean;
    compressor: boolean | 'simple' | 'full';
    /** Per-track volume faders (for multi-track) */
    volume?: boolean;
    /** Per-track pan controls (for stereo imaging) */
    pan?: boolean;
    /** Per-track reverb controls (for depth and space) */
    reverb?: boolean;
    /** Bus compressor (master bus processing) */
    busCompressor?: boolean;
    /** Bus EQ (master bus processing) */
    busEQ?: boolean;
  };
}

// ============================================
// Production Challenge Types
// ============================================

/** Configuration for a single layer in a production challenge */
export interface ProductionLayer {
  /** Unique identifier for this layer */
  id: string;
  /** Display name (e.g., "Kick", "Bass") */
  name: string;
  /** Audio source configuration */
  sourceConfig: {
    type: MixingSourceType;
    frequency?: number;
  };
  /** Initial volume in dB */
  initialVolume: number;
  /** Initial pan position (-1 to 1) */
  initialPan?: number;
  /** Initial mute state */
  initialMuted?: boolean;
}

/** Reference target - match exact values (P1-P2) */
export interface ProductionReferenceTarget {
  type: 'reference';
  layers: {
    volume: number;
    muted: boolean;
    pan?: number;
    eqLow?: number;
    eqHigh?: number;
  }[];
}

/** Condition types for goal-based evaluation */
export type ProductionCondition =
  | { type: 'level_order'; louder: string; quieter: string }
  | { type: 'pan_spread'; minWidth: number }
  | { type: 'layer_active'; layerId: string; active: boolean }
  | { type: 'layer_muted'; layerId: string; muted: boolean }
  | { type: 'relative_level'; layer1: string; layer2: string; difference: [number, number] }
  | { type: 'pan_position'; layerId: string; position: [number, number] };

/** Goal target - meet conditions (P3-P5) */
export interface ProductionGoalTarget {
  type: 'goal';
  description: string;
  conditions: ProductionCondition[];
}

/** Union type for production targets */
export type ProductionTarget = ProductionReferenceTarget | ProductionGoalTarget;

/** Production challenge definition */
export interface ProductionChallenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to achieve */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Curriculum module (e.g., "P1", "P2") */
  module: string;
  /** Audio layers for this challenge */
  layers: ProductionLayer[];
  /** Target to match or goal to achieve */
  target: ProductionTarget;
  /** Available controls */
  availableControls: {
    volume: boolean;
    mute: boolean;
    pan: boolean;
    eq: boolean;
  };
  /** Progressive hints */
  hints: string[];
}

/** Type guard for production challenges */
export function isProductionChallenge(challenge: AnyChallenge | ProductionChallenge): challenge is ProductionChallenge {
  return 'layers' in challenge && 'availableControls' in challenge;
}

/** Union type for all challenge types */
export type AnyChallenge = Challenge | MixingChallenge | ProductionChallenge | SamplingChallenge | DrumSequencingChallenge;

/** Type guard for mixing challenges */
export function isMixingChallenge(challenge: AnyChallenge): challenge is MixingChallenge {
  return 'sourceConfig' in challenge && 'controls' in challenge;
}

// ============================================
// Sampling Challenge Types
// ============================================

export interface SamplingChallenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to create */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Curriculum module (e.g., "SM1") */
  module: string;
  /** Challenge type */
  challengeType: 'recreate-kit' | 'tune-to-track' | 'chop-challenge' | 'flip-this' | 'clean-sample';
  /** Source sample URL */
  sourceSampleUrl: string;
  /** Target/reference sample URL (for comparison) */
  targetSampleUrl?: string;
  /** Target sampler params (for recreate challenges) */
  targetParams?: Partial<SamplerParams>;
  /** Expected slice count (for chop challenges) */
  expectedSlices?: number;
  /** Target key (for tune challenges) */
  targetKey?: string;
  /** Target BPM (for tune challenges) */
  targetBpm?: number;
  /** Progressive hints */
  hints: string[];
}

/** Type guard for sampling challenges */
export function isSamplingChallenge(challenge: AnyChallenge | SamplingChallenge): challenge is SamplingChallenge {
  return 'challengeType' in challenge && 'sourceSampleUrl' in challenge;
}

// ============================================
// Drum Sequencer Types
// ============================================

export interface DrumStep {
  /** Step is active */
  active: boolean;
  /** Velocity 0-1 */
  velocity: number;
}

export interface DrumTrack {
  /** Track ID (kick, snare, hihat-closed, etc.) */
  id: string;
  /** Display name */
  name: string;
  /** Sample URL */
  sampleUrl: string;
  /** 16 steps (one bar at 16th notes) */
  steps: DrumStep[];
}

export interface DrumPattern {
  /** Pattern name */
  name: string;
  /** Tempo in BPM */
  tempo: number;
  /** Swing amount (0-1, 0.5 = 50% swing) */
  swing: number;
  /** Number of steps (16 or 32) */
  stepCount: 16 | 32;
  /** Tracks in the pattern */
  tracks: DrumTrack[];
}

export interface DrumSequencerParams {
  /** Current pattern */
  pattern: DrumPattern;
  /** Current step (for playhead) */
  currentStep: number;
  /** Is playing */
  isPlaying: boolean;
  /** Selected track index */
  selectedTrack: number;
  /** Master volume in dB */
  volume: number;
}

/** Create empty steps array */
function createEmptySteps(count: number): DrumStep[] {
  return Array(count).fill(null).map(() => ({ active: false, velocity: 0.8 }));
}

export const DEFAULT_DRUM_PATTERN: DrumPattern = {
  name: 'New Pattern',
  tempo: 120,
  swing: 0,
  stepCount: 16,
  tracks: [
    { id: 'kick', name: 'Kick', sampleUrl: '/samples/drums/kick.wav', steps: createEmptySteps(16) },
    { id: 'snare', name: 'Snare', sampleUrl: '/samples/drums/snare.wav', steps: createEmptySteps(16) },
    { id: 'clap', name: 'Clap', sampleUrl: '/samples/drums/clap.wav', steps: createEmptySteps(16) },
    { id: 'hihat-closed', name: 'HH Closed', sampleUrl: '/samples/drums/hihat-closed.wav', steps: createEmptySteps(16) },
    { id: 'hihat-open', name: 'HH Open', sampleUrl: '/samples/drums/hihat-open.wav', steps: createEmptySteps(16) },
    { id: 'rim', name: 'Rim', sampleUrl: '/samples/drums/rim.wav', steps: createEmptySteps(16) },
    { id: 'tom-high', name: 'Tom Hi', sampleUrl: '/samples/drums/tom-high.wav', steps: createEmptySteps(16) },
    { id: 'tom-low', name: 'Tom Lo', sampleUrl: '/samples/drums/tom-low.wav', steps: createEmptySteps(16) },
  ],
};

export const DEFAULT_DRUM_SEQUENCER_PARAMS: DrumSequencerParams = {
  pattern: DEFAULT_DRUM_PATTERN,
  currentStep: 0,
  isPlaying: false,
  selectedTrack: 0,
  volume: -6,
};

export const DRUM_SEQUENCER_RANGES = {
  tempo: { min: 60, max: 200, step: 1 },
  swing: { min: 0, max: 1, step: 0.01 },
  volume: { min: -60, max: 0, step: 0.5 },
} as const;

// Drum Sequencing Challenge
export interface DrumSequencingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  module: string;
  challengeType: 'match-beat' | 'fix-groove' | 'add-dynamics' | 'genre-challenge' | 'complete-loop';
  /** Starting pattern (may be empty or partial) */
  startingPattern: DrumPattern;
  /** Target pattern to match */
  targetPattern: DrumPattern;
  /** Which aspects to evaluate */
  evaluationFocus: ('pattern' | 'velocity' | 'swing' | 'tempo')[];
  hints: string[];
}

/** Type guard for DrumSequencingChallenge */
export function isDrumSequencingChallenge(challenge: AnyChallenge): challenge is DrumSequencingChallenge {
  return 'challengeType' in challenge &&
    ['match-beat', 'fix-groove', 'add-dynamics', 'genre-challenge', 'complete-loop'].includes(
      (challenge as DrumSequencingChallenge).challengeType
    );
}

// ============================================
// Synth Sequencer Types
// ============================================

/**
 * A single note in a sequence
 */
export interface SequenceNote {
  time: string;       // Tone.js time notation (e.g., '0:0:0', '0:1:0')
  note: string;       // Note name (e.g., 'C4', 'E3')
  duration: string;   // Tone.js duration (e.g., '8n', '4n', '2n')
  velocity?: number;  // Optional velocity (0-1), defaults to 0.8
}

/**
 * A complete note sequence with metadata
 */
export interface NoteSequence {
  id: string;
  name: string;
  tempo: number;
  notes: SequenceNote[];
  withDrums: boolean;
  drumPattern?: DrumPatternStep[];
  loopLength: string; // e.g., '1m', '2m' for 1 or 2 measures
}

/**
 * A single step in a sequencer drum pattern
 */
export interface DrumPatternStep {
  time: string;       // Tone.js time notation
  sample: string;     // Sample name (e.g., 'kick', 'snare', 'hihat-closed')
  velocity?: number;  // Optional velocity (0-1)
}

/**
 * Interface for any synth engine that can play notes
 */
export interface SynthEngineInterface {
  triggerAttackRelease(note: string | number, duration: number | string, velocity?: number): void;
}
