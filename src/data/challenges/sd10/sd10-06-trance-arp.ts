import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD10-06: Trance Arp
 * Classic trance-style arpeggio with delay
 */
export const challenge: Challenge = {
  id: 'sd10-06-trance-arp',
  title: 'Trance Arp',
  description: 'Create a classic trance arpeggio. Fast 1/16 notes spanning 3 octaves with delay for that hypnotic, rolling effect.',
  difficulty: 3,
  module: 'SD10',
  testNote: 'C4',
  hints: [
    'Trance arps typically use 1/16 notes for energy.',
    '3 octaves creates the dramatic rising pattern.',
    'Delay with feedback extends the pattern creating rhythmic echoes.',
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
      cutoff: 3500,
      resonance: 3,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.5,
      release: 0.15,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.6,
      release: 0.12,
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
      octaves: 3,
      gate: 0.4,
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
      reverb: { decay: 1.5, mix: 0.15 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
