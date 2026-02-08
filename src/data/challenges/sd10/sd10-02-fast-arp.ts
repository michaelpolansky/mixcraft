import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD10-02: Fast Arp
 * Quick 1/16 note arpeggio for energetic patterns
 */
export const challenge: Challenge = {
  id: 'sd10-02-fast-arp',
  title: 'Fast Arp',
  description: 'Create a rapid arpeggiated sequence. Use 1/16 notes for an energetic, driving pattern with short staccato notes.',
  difficulty: 1,
  module: 'SD10',
  testNote: 'C4',
  hints: [
    '1/16 notes (16n) create a fast, driving rhythm.',
    'Lower gate values create shorter, more staccato notes.',
    'A gate of 0.3 gives punchy, separated notes.',
  ],
  targetParams: {
    oscillator: {
      type: 'square',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 3,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.4,
      release: 0.1,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.6,
      release: 0.1,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0,
      filterAmount: 0,
    },
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
    noise: {
      type: 'white',
      level: 0,
    },
    glide: {
      enabled: false,
      time: 0.1,
    },
    arpeggiator: {
      enabled: true,
      pattern: 'up',
      division: '16n',
      octaves: 1,
      gate: 0.3,
    },
    pitchEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
      amount: 0,
    },
    modEnvelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.5,
      release: 0.5,
      amount: 0,
    },
    pwmEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.3,
      amount: 0,
    },
    subOsc: {
      enabled: false,
      type: 'sine',
      octave: -1,
      level: 0.5,
    },
    oscillator2: {
      enabled: false,
      type: 'sawtooth',
      octave: 0,
      detune: 7,
      pulseWidth: 0.5,
      level: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
