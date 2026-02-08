import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  DEFAULT_FM_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_FM_MOD_MATRIX,
} from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-08-marimba',
  title: 'Marimba',
  description: 'Recreate the warm, woody tone of a marimba. This mallet percussion sound uses specific FM ratios to emulate wooden bar resonance.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'G4',
  hints: [
    'Marimba bars vibrate at specific ratios that FM can approximate.',
    'Harmonicity around 4 creates the characteristic woody overtones.',
    'Low modulation index keeps the sound warm rather than harsh.',
    'Fast attack with medium decay captures the mallet strike and resonance.',
  ],
  targetParams: {
    harmonicity: 4,
    modulationIndex: 1.8,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.002,
      decay: 0.6,
      sustain: 0.15,
      release: 0.5,
    },
    modulationEnvelopeAmount: 0.7,
    effects: DEFAULT_EFFECTS,
    volume: -12,
    lfo: DEFAULT_FM_LFO,
    noise: DEFAULT_NOISE,
    glide: DEFAULT_GLIDE,
    velocity: { ampAmount: 0, modIndexAmount: 0 },
    arpeggiator: DEFAULT_ARPEGGIATOR,
    modMatrix: DEFAULT_FM_MOD_MATRIX,
    pan: 0,
  },
};
