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
  id: 'sd8-07-bright-pad',
  title: 'Bright Pad',
  description: 'Create a shimmering FM pad sound. Using a triangle wave modulator adds extra harmonic content for a brighter, more complex tone.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C4',
  hints: [
    'Non-sine modulators add their own harmonics to the FM spectrum.',
    'Triangle wave modulators create a brighter, buzzier tone than pure sine.',
    'Harmonicity of 2 keeps the sound musical while adding richness.',
    'Slow attack and long release create the pad-like sustain.',
  ],
  targetParams: {
    harmonicity: 2,
    modulationIndex: 3,
    carrierType: 'sine',
    modulatorType: 'triangle',
    amplitudeEnvelope: {
      attack: 0.8,
      decay: 0.3,
      sustain: 0.7,
      release: 1.2,
    },
    modulationEnvelopeAmount: 0.4,
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
