import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-05-metallic-hit',
  title: 'Metallic Hit',
  description: 'Create a metallic percussion sound. High harmonicity ratios produce the complex inharmonic spectra of struck metal.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'G4',
  hints: [
    'Metal sounds have many inharmonic partials from complex vibration modes.',
    'High harmonicity (7+) creates dense, clangorous sidebands.',
    'Moderate modulation index keeps it from becoming noise.',
    'Very fast attack and decay give the percussive "hit" quality.',
  ],
  targetParams: {
    harmonicity: 7,
    modulationIndex: 4,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.05,
      release: 0.6,
    },
    modulationEnvelopeAmount: 0.5,
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
