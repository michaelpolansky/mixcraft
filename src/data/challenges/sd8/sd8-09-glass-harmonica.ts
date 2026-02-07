import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-09-glass-harmonica',
  title: 'Glass Harmonica',
  description: 'Create an ethereal glass-like tone reminiscent of singing wine glasses. The pure, crystalline quality comes from careful FM tuning.',
  difficulty: 3,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'E5',
  hints: [
    'Glass resonates with very pure, nearly sinusoidal vibrations.',
    'Non-integer harmonicity (like 2.5) adds subtle inharmonicity.',
    'Low modulation index keeps the tone pure and glass-like.',
    'Slow attack mimics the gradual excitation of a rubbed glass rim.',
  ],
  targetParams: {
    harmonicity: 2.5,
    modulationIndex: 1.2,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.4,
      decay: 0.2,
      sustain: 0.8,
      release: 2.0,
    },
    modulationEnvelopeAmount: 0.2,
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
