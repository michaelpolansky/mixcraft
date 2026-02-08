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
  id: 'sd8-03-electric-piano',
  title: 'Electric Piano',
  description: 'Recreate the classic FM electric piano sound. This iconic 80s tone uses integer harmonicity with moderate modulation.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'E4',
  hints: [
    'The classic DX7 electric piano uses harmonicity of 1 (carrier and modulator at same frequency).',
    'Moderate modulation index (around 2-3) gives warmth without harshness.',
    'Fast attack with medium decay creates the percussive "tine" character.',
    'The modulation envelope adds brightness on the attack that fades.',
  ],
  targetParams: {
    harmonicity: 1,
    modulationIndex: 2.5,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.5,
      sustain: 0.3,
      release: 0.8,
    },
    modulationEnvelopeAmount: 0.6,
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
