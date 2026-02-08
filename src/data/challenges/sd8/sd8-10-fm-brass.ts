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
  id: 'sd8-10-fm-brass',
  title: 'FM Brass Stab',
  description: 'Create a punchy FM brass stab. This classic synth brass uses high modulation that decays quickly for a bright attack.',
  difficulty: 3,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C4',
  hints: [
    'Brass sounds have bright attacks that mellow over time.',
    'Harmonicity of 1 keeps the sound harmonically coherent.',
    'High modulation index (6+) creates the bright, brassy overtones.',
    'The modulation envelope is key - high attack brightness that fades.',
  ],
  targetParams: {
    harmonicity: 1,
    modulationIndex: 6,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.6,
      release: 0.3,
    },
    modulationEnvelopeAmount: 0.8,
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
