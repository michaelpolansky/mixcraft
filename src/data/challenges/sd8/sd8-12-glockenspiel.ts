import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-12-glockenspiel',
  title: 'Glockenspiel',
  description: 'Create the bright, sparkling tone of a glockenspiel. This high-pitched metallic percussion uses specific FM ratios for its characteristic ring.',
  difficulty: 3,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C6',
  hints: [
    'Glockenspiel bars have complex overtone patterns from their metal construction.',
    'Harmonicity around 5.5 creates the characteristic metallic overtones.',
    'Higher modulation index adds the bright, shimmering quality.',
    'Very fast attack with longer decay/release gives the struck bell character.',
  ],
  targetParams: {
    harmonicity: 5.5,
    modulationIndex: 4.5,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0.08,
      release: 1.8,
    },
    modulationEnvelopeAmount: 0.4,
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
