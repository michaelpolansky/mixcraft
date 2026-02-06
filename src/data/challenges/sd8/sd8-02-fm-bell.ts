import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-02-fm-bell',
  title: 'FM Bell',
  description: 'Create a bell-like tone. Non-integer harmonicity ratios produce inharmonic partials that give bells their distinctive shimmer.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C5',
  hints: [
    'Bells have inharmonic overtones - frequencies that aren\'t simple multiples of the fundamental.',
    'Non-integer harmonicity (like 3.5) creates these inharmonic partials.',
    'Higher modulation index adds more sidebands, making the bell richer.',
    'A quick decay with longer release gives the bell its characteristic ring.',
  ],
  targetParams: {
    harmonicity: 3.5,
    modulationIndex: 5,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0.1,
      release: 1.5,
    },
    modulationEnvelopeAmount: 0.3,
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
