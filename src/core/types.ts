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
  /** Amplitude level (0 to 1) */
  level: number;
}

/** Sub oscillator - simple sine/square one octave below */
export interface SubOscillatorParams {
  /** Whether sub oscillator is enabled */
  enabled: boolean;
  /** Sub oscillator waveform (sine or square only) */
  type: 'sine' | 'square';
  /** Octave offset from main oscillator (-1 or -2) */
  octave: -1 | -2;
  /** Level/mix of sub oscillator (0 to 1) */
  level: number;
}

/** Second oscillator with full controls */
export interface Oscillator2Params {
  /** Whether oscillator 2 is enabled */
  enabled: boolean;
  /** Waveform type */
  type: OscillatorType;
  /** Octave offset from base frequency (-2 to +2) */
  octave: number;
  /** Detune in cents (-100 to +100) */
  detune: number;
  /** Pulse width for square wave */
  pulseWidth: number;
  /** Amplitude level (0 to 1) */
  level: number;
}

/** Unison - stack multiple detuned oscillator voices */
export interface UnisonParams {
  /** Whether unison is enabled */
  enabled: boolean;
  /** Number of stacked voices */
  voices: 2 | 4 | 8;
  /** Detune spread in cents (0-100) */
  detune: number;
  /** Stereo spread (0-1) */
  spread: number;
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

/** LFO2 - Independent secondary LFO for modulation matrix */
export interface LFO2Params {
  /** LFO2 rate in Hz (0.1 to 20) */
  rate: number;
  /** LFO2 depth/amount (0 to 1) */
  depth: number;
  /** LFO2 waveform shape */
  type: LFOWaveform;
  /** Whether LFO2 is enabled */
  enabled: boolean;
}

// ============================================
// Modulation Matrix Types
// ============================================

/** Available modulation sources */
export type ModSource = 'lfo1' | 'lfo2' | 'ampEnv' | 'filterEnv' | 'modEnv';

/** Available modulation destinations */
export type ModDestination = 'pitch' | 'pan' | 'amplitude' | 'filterCutoff' | 'osc2Mix' | 'lfo1Rate' | 'lfo2Rate';

/** All mod sources for iteration */
export const MOD_SOURCES: ModSource[] = ['lfo1', 'lfo2', 'ampEnv', 'filterEnv', 'modEnv'];

/** All mod destinations for iteration */
export const MOD_DESTINATIONS: ModDestination[] = ['pitch', 'pan', 'amplitude', 'filterCutoff', 'osc2Mix', 'lfo1Rate', 'lfo2Rate'];

/** Display labels for sources */
export const MOD_SOURCE_LABELS: Record<ModSource, string> = {
  lfo1: 'LFO 1',
  lfo2: 'LFO 2',
  ampEnv: 'Amp',
  filterEnv: 'Filt',
  modEnv: 'Mod',
};

/** Display labels for destinations */
export const MOD_DEST_LABELS: Record<ModDestination, string> = {
  pitch: 'Pitch',
  pan: 'Pan',
  amplitude: 'Amp',
  filterCutoff: 'Cutoff',
  osc2Mix: 'OSC2',
  lfo1Rate: 'LFO1',
  lfo2Rate: 'LFO2',
};

/** A single modulation routing (legacy, kept for compatibility) */
export interface ModRoute {
  /** Source of modulation */
  source: ModSource;
  /** Destination to modulate */
  destination: ModDestination;
  /** Amount of modulation (-1 to +1, bipolar) */
  amount: number;
  /** Whether this route is active */
  enabled: boolean;
}

/** 2D modulation matrix - each source can modulate each destination */
export type ModMatrixGrid = Record<ModSource, Record<ModDestination, number>>;

/** Modulation matrix parameters */
export interface ModMatrixParams {
  /** 2D matrix of modulation amounts */
  grid: ModMatrixGrid;
  /** Legacy routes (kept for compatibility) */
  routes: [ModRoute, ModRoute, ModRoute, ModRoute];
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
// Arpeggiator Types
// ============================================

/** Arpeggiator pattern types */
export type ArpPattern = 'up' | 'down' | 'upDown' | 'random';

/** Arpeggiator tempo divisions for sync */
export type ArpDivision = '1n' | '2n' | '4n' | '8n' | '16n' | '32n';

export interface ArpeggiatorParams {
  /** Whether arpeggiator is enabled */
  enabled: boolean;
  /** Note order pattern */
  pattern: ArpPattern;
  /** Tempo sync division */
  division: ArpDivision;
  /** Number of octaves to span */
  octaves: 1 | 2 | 3 | 4;
  /** Note length as percentage of step (0.25 to 1) */
  gate: number;
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
  /** Sub oscillator for bass reinforcement */
  subOsc: SubOscillatorParams;
  /** Second oscillator for richer sounds */
  oscillator2: Oscillator2Params;
  /** Unison for thick stacked sounds */
  unison: UnisonParams;
  /** Noise generator mixed with oscillator */
  noise: NoiseParams;
  /** Portamento/glide between notes */
  glide: GlideParams;
  /** Arpeggiator for automatic note patterns */
  arpeggiator: ArpeggiatorParams;
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
  /** Secondary LFO for modulation matrix */
  lfo2: LFO2Params;
  /** Modulation matrix for flexible routing */
  modMatrix: ModMatrixParams;
  /** Velocity sensitivity settings */
  velocity: VelocityParams;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
  /** Master pan position (-1 to +1, 0 = center) */
  pan: number;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_OSCILLATOR: OscillatorParams = {
  type: 'sawtooth',
  octave: 0,
  detune: 0,
  pulseWidth: 0.5,
  level: 1,
};

export const DEFAULT_SUB_OSCILLATOR: SubOscillatorParams = {
  enabled: true,
  type: 'sine',
  octave: -1,
  level: 0,
};

export const DEFAULT_OSCILLATOR_2: Oscillator2Params = {
  enabled: true,
  type: 'sawtooth',
  octave: 0,
  detune: 7,
  pulseWidth: 0.5,
  level: 0,
};

export const DEFAULT_UNISON: UnisonParams = {
  enabled: false,
  voices: 4,
  detune: 20,
  spread: 0.5,
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

export const DEFAULT_LFO2: LFO2Params = {
  rate: 2,
  depth: 0.5,
  type: 'sine',
  enabled: false,
};

export const DEFAULT_MOD_ROUTE: ModRoute = {
  source: 'lfo1',
  destination: 'pitch',
  amount: 0,
  enabled: false,
};

/** Create empty mod matrix grid (all zeros) */
export function createEmptyModGrid(): ModMatrixGrid {
  const grid = {} as ModMatrixGrid;
  for (const source of MOD_SOURCES) {
    grid[source] = {} as Record<ModDestination, number>;
    for (const dest of MOD_DESTINATIONS) {
      grid[source][dest] = 0;
    }
  }
  return grid;
}

export const DEFAULT_MOD_MATRIX: ModMatrixParams = {
  grid: createEmptyModGrid(),
  routes: [
    { ...DEFAULT_MOD_ROUTE },
    { ...DEFAULT_MOD_ROUTE },
    { ...DEFAULT_MOD_ROUTE },
    { ...DEFAULT_MOD_ROUTE },
  ],
};

export const DEFAULT_NOISE: NoiseParams = {
  type: 'white',
  level: 0,
};

export const DEFAULT_GLIDE: GlideParams = {
  enabled: false,
  time: 0.1,
};

export const DEFAULT_ARPEGGIATOR: ArpeggiatorParams = {
  enabled: false,
  pattern: 'up',
  division: '8n',
  octaves: 1,
  gate: 0.5,
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
  subOsc: DEFAULT_SUB_OSCILLATOR,
  oscillator2: DEFAULT_OSCILLATOR_2,
  unison: DEFAULT_UNISON,
  noise: DEFAULT_NOISE,
  glide: DEFAULT_GLIDE,
  arpeggiator: DEFAULT_ARPEGGIATOR,
  filter: DEFAULT_FILTER,
  filterEnvelope: DEFAULT_FILTER_ENVELOPE,
  amplitudeEnvelope: DEFAULT_AMPLITUDE_ENVELOPE,
  pitchEnvelope: DEFAULT_PITCH_ENVELOPE,
  modEnvelope: DEFAULT_MOD_ENVELOPE,
  pwmEnvelope: DEFAULT_PWM_ENVELOPE,
  lfo: DEFAULT_LFO,
  lfo2: DEFAULT_LFO2,
  modMatrix: DEFAULT_MOD_MATRIX,
  velocity: DEFAULT_VELOCITY,
  effects: DEFAULT_EFFECTS,
  volume: -12,
  pan: 0,
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
  // Pan and Mod Matrix
  pan: { min: -1, max: 1, step: 0.01 },
  modAmount: { min: -1, max: 1, step: 0.01 },
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
  /** LFO for FM-specific modulation */
  lfo: FMLFOParams;
  /** Noise generator mixed with FM output */
  noise: NoiseParams;
  /** Portamento/glide between notes */
  glide: GlideParams;
  /** Velocity sensitivity settings */
  velocity: FMVelocityParams;
  /** Arpeggiator for automatic note patterns */
  arpeggiator: ArpeggiatorParams;
  /** Modulation matrix for flexible routing */
  modMatrix: FMModMatrix;
  /** Master pan position (-1 to +1, 0 = center) */
  pan: number;
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
  lfo: {
    rate: 1,
    depth: 0,
    waveform: 'sine',
    destination: 'modulationIndex',
  },
  noise: { type: 'white', level: 0 },
  glide: { enabled: false, time: 0.1 },
  velocity: { ampAmount: 0, modIndexAmount: 0 },
  arpeggiator: {
    enabled: false,
    pattern: 'up',
    division: '8n',
    octaves: 1,
    gate: 0.5,
  },
  modMatrix: {
    routes: [
      { source: 'lfo', destination: 'modulationIndex', amount: 0, enabled: false },
      { source: 'lfo', destination: 'pitch', amount: 0, enabled: false },
      { source: 'modEnvelope', destination: 'modulationIndex', amount: 0, enabled: false },
      { source: 'velocity', destination: 'amplitude', amount: 0, enabled: false },
    ],
  },
  pan: 0,
};

export const FM_PARAM_RANGES = {
  harmonicity: { min: 0.5, max: 12, step: 0.1 },
  modulationIndex: { min: 0, max: 10, step: 0.1 },
  modulationEnvelopeAmount: { min: 0, max: 1, step: 0.01 },
} as const;

/** Common harmonicity presets for quick selection */
export const HARMONICITY_PRESETS = [1, 2, 3, 4, 5, 6] as const;

// ============================================
// FM Synth Extended Types (LFO, ModMatrix, Velocity)
// ============================================

/** FM LFO destination options */
export type FMLFODestination = 'modulationIndex' | 'harmonicity' | 'pitch';

/** FM Mod Matrix sources */
export type FMModSource = 'lfo' | 'modEnvelope' | 'velocity';

/** FM Mod Matrix destinations */
export type FMModDestination = 'modulationIndex' | 'harmonicity' | 'pitch' | 'pan' | 'amplitude';

/** FM-specific LFO params */
export interface FMLFOParams {
  /** LFO rate in Hz (0.1 to 20) */
  rate: number;
  /** LFO depth/amount (0 to 1) */
  depth: number;
  /** LFO waveform shape */
  waveform: LFOWaveform;
  /** Modulation destination */
  destination: FMLFODestination;
}

/** FM Mod Matrix route */
export interface FMModRoute {
  /** Source of modulation */
  source: FMModSource;
  /** Destination to modulate */
  destination: FMModDestination;
  /** Amount of modulation (-1 to +1) */
  amount: number;
  /** Whether this route is active */
  enabled: boolean;
}

/** FM Mod Matrix */
export interface FMModMatrix {
  routes: [FMModRoute, FMModRoute, FMModRoute, FMModRoute];
}

/** FM Velocity params */
export interface FMVelocityParams {
  /** How much velocity affects amplitude (0 to 1) */
  ampAmount: number;
  /** How much velocity affects modulation index (0 to 1) */
  modIndexAmount: number;
}

/** All FM mod sources for iteration */
export const FM_MOD_SOURCES: FMModSource[] = ['lfo', 'modEnvelope', 'velocity'];

/** All FM mod destinations for iteration */
export const FM_MOD_DESTINATIONS: FMModDestination[] = ['modulationIndex', 'harmonicity', 'pitch', 'pan', 'amplitude'];

/** Display labels for FM mod sources */
export const FM_MOD_SOURCE_LABELS: Record<FMModSource, string> = {
  lfo: 'LFO',
  modEnvelope: 'Mod Env',
  velocity: 'Velocity',
};

/** Display labels for FM mod destinations */
export const FM_MOD_DEST_LABELS: Record<FMModDestination, string> = {
  modulationIndex: 'Mod Index',
  harmonicity: 'Harmonic',
  pitch: 'Pitch',
  pan: 'Pan',
  amplitude: 'Amp',
};

/** Default FM LFO params */
export const DEFAULT_FM_LFO: FMLFOParams = {
  rate: 1,
  depth: 0,
  waveform: 'sine',
  destination: 'modulationIndex',
};

/** Default FM Mod Route */
export const DEFAULT_FM_MOD_ROUTE: FMModRoute = {
  source: 'lfo',
  destination: 'modulationIndex',
  amount: 0,
  enabled: false,
};

/** Default FM Mod Matrix */
export const DEFAULT_FM_MOD_MATRIX: FMModMatrix = {
  routes: [
    { source: 'lfo', destination: 'modulationIndex', amount: 0, enabled: false },
    { source: 'lfo', destination: 'pitch', amount: 0, enabled: false },
    { source: 'modEnvelope', destination: 'modulationIndex', amount: 0, enabled: false },
    { source: 'velocity', destination: 'amplitude', amount: 0, enabled: false },
  ],
};

/** Default FM Velocity params */
export const DEFAULT_FM_VELOCITY: FMVelocityParams = {
  ampAmount: 0,
  modIndexAmount: 0,
};

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
  /** LFO for additive-specific modulation */
  lfo: AdditiveLFOParams;
  /** Noise generator mixed with additive output */
  noise: NoiseParams;
  /** Portamento/glide between notes */
  glide: GlideParams;
  /** Velocity sensitivity settings */
  velocity: AdditiveVelocityParams;
  /** Arpeggiator for automatic note patterns */
  arpeggiator: ArpeggiatorParams;
  /** Modulation matrix for flexible routing */
  modMatrix: AdditiveModMatrix;
  /** Master pan position (-1 to +1, 0 = center) */
  pan: number;
}

/** Additive LFO destination options */
export type AdditiveLFODestination = 'brightness' | 'pitch';

/** Additive Mod Matrix sources */
export type AdditiveModSource = 'lfo' | 'ampEnvelope' | 'velocity';

/** Additive Mod Matrix destinations */
export type AdditiveModDestination = 'brightness' | 'pitch' | 'pan' | 'amplitude' | 'oddHarmonics' | 'evenHarmonics';

/** Additive-specific LFO params */
export interface AdditiveLFOParams {
  /** LFO rate in Hz (0.1 to 20) */
  rate: number;
  /** LFO depth/amount (0 to 1) */
  depth: number;
  /** LFO waveform shape */
  waveform: LFOWaveform;
  /** Modulation destination */
  destination: AdditiveLFODestination;
}

/** Additive Mod Matrix route */
export interface AdditiveModRoute {
  /** Source of modulation */
  source: AdditiveModSource;
  /** Destination to modulate */
  destination: AdditiveModDestination;
  /** Amount of modulation (-1 to +1) */
  amount: number;
  /** Whether this route is active */
  enabled: boolean;
}

/** Additive Mod Matrix */
export interface AdditiveModMatrix {
  routes: [AdditiveModRoute, AdditiveModRoute, AdditiveModRoute, AdditiveModRoute];
}

/** Additive Velocity params */
export interface AdditiveVelocityParams {
  /** How much velocity affects amplitude (0 to 1) */
  ampAmount: number;
  /** How much velocity affects brightness/harmonic content (0 to 1) */
  brightnessAmount: number;
}

/** All Additive mod sources for iteration */
export const ADDITIVE_MOD_SOURCES: AdditiveModSource[] = ['lfo', 'ampEnvelope', 'velocity'];

/** All Additive mod destinations for iteration */
export const ADDITIVE_MOD_DESTINATIONS: AdditiveModDestination[] = ['brightness', 'pitch', 'pan', 'amplitude', 'oddHarmonics', 'evenHarmonics'];

/** Display labels for Additive mod sources */
export const ADDITIVE_MOD_SOURCE_LABELS: Record<AdditiveModSource, string> = {
  lfo: 'LFO',
  ampEnvelope: 'Amp',
  velocity: 'Vel',
};

/** Display labels for Additive mod destinations */
export const ADDITIVE_MOD_DEST_LABELS: Record<AdditiveModDestination, string> = {
  brightness: 'Bright',
  pitch: 'Pitch',
  pan: 'Pan',
  amplitude: 'Amp',
  oddHarmonics: 'Odd',
  evenHarmonics: 'Even',
};

/** Default Additive LFO params */
export const DEFAULT_ADDITIVE_LFO: AdditiveLFOParams = {
  rate: 1,
  depth: 0,
  waveform: 'sine',
  destination: 'brightness',
};

/** Default Additive Mod Route */
export const DEFAULT_ADDITIVE_MOD_ROUTE: AdditiveModRoute = {
  source: 'lfo',
  destination: 'brightness',
  amount: 0,
  enabled: false,
};

/** Default Additive Mod Matrix */
export const DEFAULT_ADDITIVE_MOD_MATRIX: AdditiveModMatrix = {
  routes: [
    { source: 'lfo', destination: 'brightness', amount: 0, enabled: false },
    { source: 'lfo', destination: 'pitch', amount: 0, enabled: false },
    { source: 'ampEnvelope', destination: 'brightness', amount: 0, enabled: false },
    { source: 'velocity', destination: 'amplitude', amount: 0, enabled: false },
  ],
};

/** Default Additive Velocity params */
export const DEFAULT_ADDITIVE_VELOCITY: AdditiveVelocityParams = {
  ampAmount: 0,
  brightnessAmount: 0,
};

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
  lfo: DEFAULT_ADDITIVE_LFO,
  noise: { type: 'white', level: 0 },
  glide: { enabled: false, time: 0.1 },
  velocity: DEFAULT_ADDITIVE_VELOCITY,
  arpeggiator: {
    enabled: false,
    pattern: 'up',
    division: '8n',
    octaves: 1,
    gate: 0.5,
  },
  modMatrix: DEFAULT_ADDITIVE_MOD_MATRIX,
  pan: 0,
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
// Sound Design Progressive Controls
// ============================================

/** Per-control visibility within the Oscillator section */
export interface OscillatorControls { waveform?: boolean; octave?: boolean; detune?: boolean; }
/** Per-control visibility within the Filter section */
export interface FilterControls { type?: boolean; cutoff?: boolean; resonance?: boolean; }
/** Per-control visibility within the Amplitude Envelope section */
export interface AmpEnvelopeControls { attack?: boolean; decay?: boolean; sustain?: boolean; release?: boolean; }
/** Per-control visibility within the Filter Envelope section */
export interface FilterEnvelopeControls { attack?: boolean; decay?: boolean; sustain?: boolean; release?: boolean; amount?: boolean; }
/** Per-control visibility within the LFO section */
export interface LFOControls { waveform?: boolean; rate?: boolean; depth?: boolean; }
/** Per-control visibility within the Effects section (per effect block, not per knob) */
export interface EffectsControls { distortion?: boolean; delay?: boolean; reverb?: boolean; chorus?: boolean; }

/** Which visualization panels to show for a challenge */
export type ChallengeVisualization = 'spectrum' | 'oscilloscope' | 'filter' | 'envelope' | 'lfo' | 'effects';

/** Visualization layout mode for ChallengeView */
export type VizMode = 'default' | 'spectrum' | 'waveform' | 'compare' | 'minimal';

/**
 * Which synth sections/controls are visible in a challenge view.
 *
 * Each section accepts:
 * - `true`: show all controls in section (backward compat)
 * - Object with per-control booleans: show only specified controls, section auto-shows
 * - `undefined`/absent: section hidden
 */
export interface SynthAvailableControls {
  oscillator?: boolean | OscillatorControls;
  filter?: boolean | FilterControls;
  amplitudeEnvelope?: boolean | AmpEnvelopeControls;
  filterEnvelope?: boolean | FilterEnvelopeControls;
  lfo?: boolean | LFOControls;
  effects?: boolean | EffectsControls;
  output?: boolean;
  /** Override module-default visualization panels */
  visualizations?: ChallengeVisualization[];
}

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
  /** Override module-default control visibility for this challenge */
  availableControls?: SynthAvailableControls;
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
  /** Detailed score breakdown for adaptive curriculum (optional for backward compat) */
  breakdown?: ScoreBreakdownData;
}

/**
 * Normalized score breakdown for adaptive curriculum.
 * Each field is 0-100. Only fields relevant to the track are populated.
 */
export interface ScoreBreakdownData {
  // Sound Design (subtractive)
  brightness?: number;
  attack?: number;
  filter?: number;
  envelope?: number;
  // FM Synthesis
  harmonicity?: number;
  modulationIndex?: number;
  // Mixing
  eqLow?: number;
  eqMid?: number;
  eqHigh?: number;
  compressor?: number;
  conditions?: number;
  // Sampling
  pitch?: number;
  slice?: number;
  timing?: number;
  creativity?: number;
  // Drum Sequencing
  pattern?: number;
  velocity?: number;
  swing?: number;
  tempo?: number;
}

// ============================================
// Concept Library Types
// ============================================

export type ConceptTrack = 'sound-design' | 'mixing' | 'production' | 'sampling' | 'drum-sequencing' | 'general';

export interface Concept {
  /** Slug identifier, e.g. "filter-cutoff" */
  id: string;
  /** Human-readable title, e.g. "Filter Cutoff" */
  title: string;
  /** Which curriculum track this concept belongs to */
  track: ConceptTrack;
  /** One-sentence summary for card display */
  summary: string;
  /** Multi-paragraph explanation (array of paragraphs) */
  explanation: string[];
  /** IDs of related concepts */
  relatedConcepts: string[];
  /** IDs of related challenges */
  relatedChallenges: string[];
  /** Search tags */
  tags: string[];
}

export interface GlossaryEntry {
  /** The term being defined */
  term: string;
  /** Short definition */
  definition: string;
  /** Link to full concept (null if none) */
  relatedConcept: string | null;
}

// ============================================
// Mixing Challenge Types
// ============================================

// Re-export mixing effect types
export type {
  EQParams,
  CompressorSimpleParams,
  CompressorFullParams,
  ParametricBand,
  ParametricEQParams,
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
  // Per-track compression conditions
  | { type: 'track_compression'; track: string; minAmount: number; maxAmount?: number }
  | { type: 'compression_contrast'; moreCompressed: string; lessCompressed: string; minDifference: number }
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
    eq: boolean | 'simple' | 'parametric';
    compressor: boolean | 'simple' | 'full';
    /** Per-track volume faders (for multi-track) */
    volume?: boolean;
    /** Per-track pan controls (for stereo imaging) */
    pan?: boolean;
    /** Per-track reverb controls (for depth and space) */
    reverb?: boolean;
    /** Per-track compressor (threshold + amount) */
    trackCompressor?: boolean;
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
