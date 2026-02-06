/**
 * Challenge Registry
 * Central index of all available challenges
 */

import type { Challenge } from '../../core/types.ts';

// Sampling Challenges (SM1-SM6)
import {
  samplingChallengesById,
  samplingChallengesByModule,
  allSamplingChallenges,
  samplingModules,
  getSamplingChallenge,
  getSamplingModuleChallenges,
  getNextSamplingChallenge,
} from './sampling/index.ts';

// Drum Sequencing Challenges (DS1-DS6)
import {
  drumSequencingChallengesById,
  drumSequencingChallengesByModule,
  allDrumSequencingChallenges,
  drumSequencingModules,
  getDrumSequencingChallenge,
  getDrumSequencingModuleChallenges,
  getNextDrumSequencingChallenge,
} from './drum-sequencing/index.ts';

// Re-export sampling
export {
  samplingChallengesById,
  samplingChallengesByModule,
  allSamplingChallenges,
  samplingModules,
  getSamplingChallenge,
  getSamplingModuleChallenges,
  getNextSamplingChallenge,
};

// Re-export drum sequencing
export {
  drumSequencingChallengesById,
  drumSequencingChallengesByModule,
  allDrumSequencingChallenges,
  drumSequencingModules,
  getDrumSequencingChallenge,
  getDrumSequencingModuleChallenges,
  getNextDrumSequencingChallenge,
};

// SD1 - Oscillator Fundamentals
import { challenge as sd1_01 } from './sd1/sd1-01-pure-tone.ts';
import { challenge as sd1_02 } from './sd1/sd1-02-buzzy-bass.ts';
import { challenge as sd1_03 } from './sd1/sd1-03-hollow-pad.ts';
import { challenge as sd1_04 } from './sd1/sd1-04-punchy-pluck.ts';

// SD2 - Filter Basics
import { challenge as sd2_01 } from './sd2/sd2-01-muffled-tone.ts';
import { challenge as sd2_02 } from './sd2/sd2-02-thin-lead.ts';
import { challenge as sd2_03 } from './sd2/sd2-03-resonant-sweep.ts';
import { challenge as sd2_04 } from './sd2/sd2-04-telephone.ts';

// SD3 - Envelopes
import { challenge as sd3_01 } from './sd3/sd3-01-slow-swell.ts';
import { challenge as sd3_02 } from './sd3/sd3-02-plucky-string.ts';
import { challenge as sd3_03 } from './sd3/sd3-03-organ-tone.ts';
import { challenge as sd3_04 } from './sd3/sd3-04-fading-echo.ts';

// SD4 - Modulation
import { challenge as sd4_01 } from './sd4/sd4-01-slow-wobble.ts';
import { challenge as sd4_02 } from './sd4/sd4-02-fast-warble.ts';
import { challenge as sd4_03 } from './sd4/sd4-03-rhythmic-pulse.ts';
import { challenge as sd4_04 } from './sd4/sd4-04-growl-bass.ts';

// SD5 - Effects
import { challenge as sd5_01 } from './sd5/sd5-01-crunchy-lead.ts';
import { challenge as sd5_02 } from './sd5/sd5-02-slapback-echo.ts';
import { challenge as sd5_03 } from './sd5/sd5-03-hall-pad.ts';
import { challenge as sd5_04 } from './sd5/sd5-04-lush-strings.ts';

// SD6 - Synthesis Techniques
import { challenge as sd6_01 } from './sd6/sd6-01-acid-bass.ts';
import { challenge as sd6_02 } from './sd6/sd6-02-pad-stack.ts';
import { challenge as sd6_03 } from './sd6/sd6-03-pluck-delay.ts';
import { challenge as sd6_04 } from './sd6/sd6-04-distorted-lead.ts';
import { challenge as sd6_05 } from './sd6/sd6-05-wobble-bass.ts';
import { challenge as sd6_06 } from './sd6/sd6-06-ambient-drone.ts';

// SD7 - Genre Sound Design
import { challenge as sd7_01 } from './sd7/sd7-01-80s-brass.ts';
import { challenge as sd7_02 } from './sd7/sd7-02-reese-bass.ts';
import { challenge as sd7_03 } from './sd7/sd7-03-juno-pad.ts';
import { challenge as sd7_04 } from './sd7/sd7-04-trance-supersaw.ts';
import { challenge as sd7_05 } from './sd7/sd7-05-synthwave-bass.ts';
import { challenge as sd7_06 } from './sd7/sd7-06-cinematic-strings.ts';

// SD8 - FM Synthesis
import { challenge as sd8_01 } from './sd8/sd8-01-pure-fm.ts';
import { challenge as sd8_02 } from './sd8/sd8-02-fm-bell.ts';
import { challenge as sd8_03 } from './sd8/sd8-03-electric-piano.ts';
import { challenge as sd8_04 } from './sd8/sd8-04-fm-bass.ts';
import { challenge as sd8_05 } from './sd8/sd8-05-metallic-hit.ts';
import { challenge as sd8_06 } from './sd8/sd8-06-pluck-lead.ts';

// SD9 - Additive Synthesis
import { challenge as sd9_01 } from './sd9/sd9-01-fundamental.ts';
import { challenge as sd9_02 } from './sd9/sd9-02-octave-stack.ts';
import { challenge as sd9_03 } from './sd9/sd9-03-bright-saw.ts';
import { challenge as sd9_04 } from './sd9/sd9-04-hollow-square.ts';
import { challenge as sd9_05 } from './sd9/sd9-05-soft-triangle.ts';
import { challenge as sd9_06 } from './sd9/sd9-06-organ-tone.ts';

/**
 * All challenges indexed by ID
 */
export const challengesById: Record<string, Challenge> = {
  'sd1-01-pure-tone': sd1_01,
  'sd1-02-buzzy-bass': sd1_02,
  'sd1-03-hollow-pad': sd1_03,
  'sd1-04-punchy-pluck': sd1_04,
  'sd2-01-muffled-tone': sd2_01,
  'sd2-02-thin-lead': sd2_02,
  'sd2-03-resonant-sweep': sd2_03,
  'sd2-04-telephone': sd2_04,
  'sd3-01-slow-swell': sd3_01,
  'sd3-02-plucky-string': sd3_02,
  'sd3-03-organ-tone': sd3_03,
  'sd3-04-fading-echo': sd3_04,
  'sd4-01-slow-wobble': sd4_01,
  'sd4-02-fast-warble': sd4_02,
  'sd4-03-rhythmic-pulse': sd4_03,
  'sd4-04-growl-bass': sd4_04,
  'sd5-01-crunchy-lead': sd5_01,
  'sd5-02-slapback-echo': sd5_02,
  'sd5-03-hall-pad': sd5_03,
  'sd5-04-lush-strings': sd5_04,
  'sd6-01-acid-bass': sd6_01,
  'sd6-02-pad-stack': sd6_02,
  'sd6-03-pluck-delay': sd6_03,
  'sd6-04-distorted-lead': sd6_04,
  'sd6-05-wobble-bass': sd6_05,
  'sd6-06-ambient-drone': sd6_06,
  'sd7-01-80s-brass': sd7_01,
  'sd7-02-reese-bass': sd7_02,
  'sd7-03-juno-pad': sd7_03,
  'sd7-04-trance-supersaw': sd7_04,
  'sd7-05-synthwave-bass': sd7_05,
  'sd7-06-cinematic-strings': sd7_06,
  'sd8-01-pure-fm': sd8_01,
  'sd8-02-fm-bell': sd8_02,
  'sd8-03-electric-piano': sd8_03,
  'sd8-04-fm-bass': sd8_04,
  'sd8-05-metallic-hit': sd8_05,
  'sd8-06-pluck-lead': sd8_06,
  'sd9-01-fundamental': sd9_01,
  'sd9-02-octave-stack': sd9_02,
  'sd9-03-bright-saw': sd9_03,
  'sd9-04-hollow-square': sd9_04,
  'sd9-05-soft-triangle': sd9_05,
  'sd9-06-organ-tone': sd9_06,
};

/**
 * Challenges grouped by module
 */
export const challengesByModule: Record<string, Challenge[]> = {
  SD1: [sd1_01, sd1_02, sd1_03, sd1_04],
  SD2: [sd2_01, sd2_02, sd2_03, sd2_04],
  SD3: [sd3_01, sd3_02, sd3_03, sd3_04],
  SD4: [sd4_01, sd4_02, sd4_03, sd4_04],
  SD5: [sd5_01, sd5_02, sd5_03, sd5_04],
  SD6: [sd6_01, sd6_02, sd6_03, sd6_04, sd6_05, sd6_06],
  SD7: [sd7_01, sd7_02, sd7_03, sd7_04, sd7_05, sd7_06],
  SD8: [sd8_01, sd8_02, sd8_03, sd8_04, sd8_05, sd8_06],
  SD9: [sd9_01, sd9_02, sd9_03, sd9_04, sd9_05, sd9_06],
};

/**
 * Ordered list of all challenges
 */
export const allChallenges: Challenge[] = [
  // SD1 - Oscillator Fundamentals
  sd1_01,
  sd1_02,
  sd1_03,
  sd1_04,
  // SD2 - Filter Basics
  sd2_01,
  sd2_02,
  sd2_03,
  sd2_04,
  // SD3 - Envelopes
  sd3_01,
  sd3_02,
  sd3_03,
  sd3_04,
  // SD4 - Modulation
  sd4_01,
  sd4_02,
  sd4_03,
  sd4_04,
  // SD5 - Effects
  sd5_01,
  sd5_02,
  sd5_03,
  sd5_04,
  // SD6 - Synthesis Techniques
  sd6_01,
  sd6_02,
  sd6_03,
  sd6_04,
  sd6_05,
  sd6_06,
  // SD7 - Genre Sound Design
  sd7_01,
  sd7_02,
  sd7_03,
  sd7_04,
  sd7_05,
  sd7_06,
  // SD8 - FM Synthesis
  sd8_01,
  sd8_02,
  sd8_03,
  sd8_04,
  sd8_05,
  sd8_06,
  // SD9 - Additive Synthesis
  sd9_01,
  sd9_02,
  sd9_03,
  sd9_04,
  sd9_05,
  sd9_06,
];

/**
 * Module metadata
 */
export const modules = {
  SD1: {
    id: 'SD1',
    title: 'Oscillator Fundamentals',
    description: 'Learn the basic waveforms and how they shape the character of a sound.',
    challengeCount: 4,
  },
  SD2: {
    id: 'SD2',
    title: 'Filter Basics',
    description: 'Shape your sound by removing frequencies. Learn lowpass, highpass, and bandpass filters.',
    challengeCount: 4,
  },
  SD3: {
    id: 'SD3',
    title: 'Envelopes',
    description: 'Control how sounds evolve over time with Attack, Decay, Sustain, and Release.',
    challengeCount: 4,
  },
  SD4: {
    id: 'SD4',
    title: 'Modulation',
    description: 'Add movement with LFOs. Create wobbles, warbles, and rhythmic effects.',
    challengeCount: 4,
  },
  SD5: {
    id: 'SD5',
    title: 'Effects',
    description: 'Shape your sound with distortion, delay, reverb, and chorus.',
    challengeCount: 4,
  },
  SD6: {
    id: 'SD6',
    title: 'Synthesis Techniques',
    description: 'Master challenges combining oscillators, filters, envelopes, LFO, and effects.',
    challengeCount: 6,
  },
  SD7: {
    id: 'SD7',
    title: 'Genre Sound Design',
    description: 'Recreate iconic synth sounds from 80s brass to trance supersaws.',
    challengeCount: 6,
  },
  SD8: {
    id: 'SD8',
    title: 'FM Synthesis',
    description: 'Master frequency modulation to create bells, electric pianos, and metallic sounds.',
    challengeCount: 6,
  },
  SD9: {
    id: 'SD9',
    title: 'Additive Synthesis',
    description: 'Build sounds from individual harmonics using Fourier synthesis.',
    challengeCount: 6,
  },
} as const;

/**
 * Get a challenge by ID
 */
export function getChallenge(id: string): Challenge | undefined {
  return challengesById[id];
}

/**
 * Get challenges for a module
 */
export function getModuleChallenges(moduleId: string): Challenge[] {
  return challengesByModule[moduleId] ?? [];
}

/**
 * Get the next challenge after the given one
 */
export function getNextChallenge(currentId: string): Challenge | undefined {
  const index = allChallenges.findIndex(c => c.id === currentId);
  if (index === -1 || index >= allChallenges.length - 1) {
    return undefined;
  }
  return allChallenges[index + 1];
}
