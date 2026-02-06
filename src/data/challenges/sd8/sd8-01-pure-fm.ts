import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-01-pure-fm',
  title: 'Pure FM',
  description: 'Create a simple FM tone. With harmonicity at 1, the modulator matches the carrier frequency, adding subtle brightness.',
  difficulty: 1,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C4',
  hints: [
    'FM synthesis uses one oscillator (modulator) to change the frequency of another (carrier).',
    'Harmonicity of 1 means the modulator is at the same frequency as the carrier.',
    'Low modulation index (around 1-2) creates subtle harmonic content.',
  ],
  targetParams: {
    harmonicity: 1,
    modulationIndex: 1.5,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
    modulationEnvelopeAmount: 0,
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
