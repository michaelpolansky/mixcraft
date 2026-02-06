/**
 * Drum Sequencing Challenges Registry
 * Central index of all drum sequencing challenges (DS1-DS6)
 */

import type { DrumSequencingChallenge } from '../../../core/types.ts';

// DS1 - Grid Basics
import { ds1_01, ds1_02, ds1_03, ds1_04 } from './ds1/index.ts';

// DS2 - Hi-hats & Percussion
import { ds2_01, ds2_02, ds2_03, ds2_04 } from './ds2/index.ts';

// DS3 - Groove & Swing
import { ds3_01, ds3_02, ds3_03, ds3_04 } from './ds3/index.ts';

// DS4 - Velocity & Dynamics
import { ds4_01, ds4_02, ds4_03, ds4_04 } from './ds4/index.ts';

// DS5 - Genre Patterns
import { ds5_01, ds5_02, ds5_03, ds5_04 } from './ds5/index.ts';

// DS6 - Loop Construction
import { ds6_01, ds6_02, ds6_03, ds6_04 } from './ds6/index.ts';

/**
 * All drum sequencing challenges indexed by ID
 */
export const drumSequencingChallengesById: Record<string, DrumSequencingChallenge> = {
  // DS1 - Grid Basics
  'ds1-01-four-on-floor': ds1_01,
  'ds1-02-the-backbeat': ds1_02,
  'ds1-03-basic-rock': ds1_03,
  'ds1-04-first-full-beat': ds1_04,
  // DS2 - Hi-hats & Percussion
  'ds2-01-eighth-note-hihats': ds2_01,
  'ds2-02-sixteenth-notes': ds2_02,
  'ds2-03-open-and-closed': ds2_03,
  'ds2-04-ride-pattern': ds2_04,
  // DS3 - Groove & Swing
  'ds3-01-feel-the-swing': ds3_01,
  'ds3-02-shuffle-groove': ds3_02,
  'ds3-03-straight-vs-swing': ds3_03,
  'ds3-04-pocket-feel': ds3_04,
  // DS4 - Velocity & Dynamics
  'ds4-01-accents': ds4_01,
  'ds4-02-ghost-notes': ds4_02,
  'ds4-03-building-intensity': ds4_03,
  'ds4-04-dynamic-groove': ds4_04,
  // DS5 - Genre Patterns
  'ds5-01-hip-hop': ds5_01,
  'ds5-02-house': ds5_02,
  'ds5-03-trap': ds5_03,
  'ds5-04-breakbeat': ds5_04,
  // DS6 - Loop Construction
  'ds6-01-drum-fill': ds6_01,
  'ds6-02-variation': ds6_02,
  'ds6-03-transition-build': ds6_03,
  'ds6-04-complete-the-loop': ds6_04,
};

/**
 * Drum sequencing challenges grouped by module
 */
export const drumSequencingChallengesByModule: Record<string, DrumSequencingChallenge[]> = {
  DS1: [ds1_01, ds1_02, ds1_03, ds1_04],
  DS2: [ds2_01, ds2_02, ds2_03, ds2_04],
  DS3: [ds3_01, ds3_02, ds3_03, ds3_04],
  DS4: [ds4_01, ds4_02, ds4_03, ds4_04],
  DS5: [ds5_01, ds5_02, ds5_03, ds5_04],
  DS6: [ds6_01, ds6_02, ds6_03, ds6_04],
};

/**
 * Ordered list of all drum sequencing challenges
 */
export const allDrumSequencingChallenges: DrumSequencingChallenge[] = [
  // DS1 - Grid Basics
  ds1_01,
  ds1_02,
  ds1_03,
  ds1_04,
  // DS2 - Hi-hats & Percussion
  ds2_01,
  ds2_02,
  ds2_03,
  ds2_04,
  // DS3 - Groove & Swing
  ds3_01,
  ds3_02,
  ds3_03,
  ds3_04,
  // DS4 - Velocity & Dynamics
  ds4_01,
  ds4_02,
  ds4_03,
  ds4_04,
  // DS5 - Genre Patterns
  ds5_01,
  ds5_02,
  ds5_03,
  ds5_04,
  // DS6 - Loop Construction
  ds6_01,
  ds6_02,
  ds6_03,
  ds6_04,
];

/**
 * Drum sequencing module metadata
 */
export const drumSequencingModules = {
  DS1: {
    id: 'DS1',
    title: 'Grid Basics',
    description: 'Learn the fundamentals of drum programming. Kick, snare, and hi-hat placement.',
    challengeCount: 4,
  },
  DS2: {
    id: 'DS2',
    title: 'Hi-hats & Percussion',
    description: 'Master hi-hat patterns from eighth notes to complex open/closed combinations.',
    challengeCount: 4,
  },
  DS3: {
    id: 'DS3',
    title: 'Groove & Swing',
    description: 'Add feel to your beats with swing and groove. Learn what makes drums "feel" good.',
    challengeCount: 4,
  },
  DS4: {
    id: 'DS4',
    title: 'Velocity & Dynamics',
    description: 'Bring your patterns to life with velocity variation. Accents, ghost notes, and dynamics.',
    challengeCount: 4,
  },
  DS5: {
    id: 'DS5',
    title: 'Genre Patterns',
    description: 'Program authentic patterns from hip-hop to house, trap to funk breakbeats.',
    challengeCount: 4,
  },
  DS6: {
    id: 'DS6',
    title: 'Loop Construction',
    description: 'Build complete loops with fills, variations, and transitions.',
    challengeCount: 4,
  },
} as const;

/**
 * Get a drum sequencing challenge by ID
 */
export function getDrumSequencingChallenge(id: string): DrumSequencingChallenge | undefined {
  return drumSequencingChallengesById[id];
}

/**
 * Get drum sequencing challenges for a module
 */
export function getDrumSequencingModuleChallenges(moduleId: string): DrumSequencingChallenge[] {
  return drumSequencingChallengesByModule[moduleId] ?? [];
}

/**
 * Get the next drum sequencing challenge after the given one
 */
export function getNextDrumSequencingChallenge(currentId: string): DrumSequencingChallenge | undefined {
  const index = allDrumSequencingChallenges.findIndex(c => c.id === currentId);
  if (index === -1 || index >= allDrumSequencingChallenges.length - 1) {
    return undefined;
  }
  return allDrumSequencingChallenges[index + 1];
}
