import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD15-05: Glide Bass
 * Bass sound with portamento for smooth transitions
 */
export const challenge: Challenge = {
  id: 'sd15-05-glide-bass',
  title: 'Glide Bass',
  description: 'Create a bass with glide for smooth note transitions. Gliding bass lines add groove and fluidity to your low end.',
  difficulty: 2,
  module: 'SD15',
  testNote: 'C2',
  hints: [
    'Glide on bass creates smooth, flowing lines.',
    'Sub oscillator adds weight to the gliding notes.',
    'Medium glide time works well for bass.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.8,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1500,
      resonance: 3,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.4,
      release: 0.2,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.8,
      release: 0.2,
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
      enabled: true,
      time: 0.12,
    },
    arpeggiator: {
      enabled: false,
      pattern: 'up',
      division: '8n',
      octaves: 1,
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
      enabled: true,
      type: 'sine',
      octave: -1,
      level: 0.6,
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
      distortion: { amount: 0.1, mix: 0.1 },
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
