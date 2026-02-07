import type { Challenge } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-06-pluck-lead',
  title: 'Pluck Lead',
  description: 'Create a bright, plucky lead sound. The modulation envelope shapes how FM brightness evolves over the note.',
  difficulty: 3,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'A4',
  hints: [
    'Plucky sounds have a bright attack that quickly mellows.',
    'High modulation envelope amount (0.7+) makes the attack much brighter than the sustain.',
    'Harmonicity of 4 gives a bright, harmonic character.',
    'The modulation index sets the base brightness; the envelope adds the pluck.',
  ],
  targetParams: {
    harmonicity: 4,
    modulationIndex: 6,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.4,
      release: 0.4,
    },
    modulationEnvelopeAmount: 0.8,
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
      mix: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.3, feedback: 0.25, mix: 0.2 },
      reverb: { decay: 1.5, mix: 0.15 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
