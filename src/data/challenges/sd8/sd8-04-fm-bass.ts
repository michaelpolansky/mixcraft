import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-04-fm-bass',
  title: 'FM Bass',
  description: 'Create a gritty FM bass. High modulation index produces rich harmonics that cut through a mix.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'E2',
  hints: [
    'Bass sounds need low harmonicity (1 or 2) to keep the fundamental strong.',
    'High modulation index (6-8) adds the grit and harmonics.',
    'Fast attack and short decay give punch.',
    'Use the modulation envelope to add brightness on the attack.',
  ],
  targetParams: {
    harmonicity: 1,
    modulationIndex: 7,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.2,
    },
    modulationEnvelopeAmount: 0.4,
    effects: DEFAULT_EFFECTS,
    volume: -10,
  },
};
