import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-05: Arp Sequence
 * Complete arpeggiated sequence with full sound design
 */
export const challenge: Challenge = {
  id: 'sd17-05-arp-sequence',
  title: 'Arp Sequence',
  description: 'Create a complete arpeggiated sequence. Combine arpeggiator with supersaw, filter movement, and effects for trance-ready patterns.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C4',
  hints: [
    'Arpeggiator creates the pattern.',
    'Unison supersaw for that big sound.',
    'Filter envelope on each note.',
    'Delay extends the pattern rhythmically.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 4,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.3,
      release: 0.15,
      amount: 2.5,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.7,
      release: 0.15,
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
    unison: { enabled: true, voices: 8, detune: 30, spread: 0.7 },
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
      octaves: 2,
      gate: 0.5,
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
      delay: { time: 0.375, feedback: 0.4, mix: 0.3 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
