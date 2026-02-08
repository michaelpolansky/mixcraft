import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD10-04: Legato Arp
 * Smooth, connected notes with high gate value
 */
export const challenge: Challenge = {
  id: 'sd10-04-legato-arp',
  title: 'Legato Arp',
  description: 'Create a smooth, flowing arpeggio with connected notes. Use a high gate value so each note blends into the next.',
  difficulty: 2,
  module: 'SD10',
  testNote: 'C4',
  hints: [
    'Gate controls how long each note plays relative to the step.',
    'A gate of 0.9 or higher creates smooth, connected notes.',
    'Slower divisions like 1/4 notes work well with legato style.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 3500,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.8,
      release: 0.4,
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
      division: '4n',
      octaves: 1,
      gate: 0.9,
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
      delay: { time: 0.25, feedback: 0.3, mix: 0.2 },
      reverb: { decay: 2, mix: 0.25 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
