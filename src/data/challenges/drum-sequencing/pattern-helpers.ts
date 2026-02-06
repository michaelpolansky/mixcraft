/**
 * Pattern Helper Functions
 * Utilities for creating drum patterns in challenges
 */

import type { DrumStep, DrumTrack, DrumPattern } from '../../../core/types.ts';

/** Standard drum sample URLs */
export const DRUM_SAMPLES = {
  kick: '/samples/drums/kick.wav',
  snare: '/samples/drums/snare.wav',
  hihatClosed: '/samples/drums/hihat-closed.wav',
  hihatOpen: '/samples/drums/hihat-open.wav',
  clap: '/samples/drums/clap.wav',
  tom: '/samples/drums/tom.wav',
  ride: '/samples/drums/ride.wav',
  crash: '/samples/drums/crash.wav',
} as const;

/**
 * Create an inactive step
 */
export function createStep(active: boolean, velocity: number = 0.8): DrumStep {
  return { active, velocity };
}

/**
 * Create an array of empty (inactive) steps
 */
export function createEmptySteps(count: 16 | 32 = 16): DrumStep[] {
  return Array(count).fill(null).map(() => createStep(false, 0.8));
}

/**
 * Create steps with specific positions active
 * @param stepCount Total number of steps
 * @param activePositions Array of step indices (0-based) to activate
 * @param defaultVelocity Default velocity for active steps
 */
export function createStepsWithHits(
  stepCount: 16 | 32,
  activePositions: number[],
  defaultVelocity: number = 0.8
): DrumStep[] {
  const steps = createEmptySteps(stepCount);
  for (const pos of activePositions) {
    if (pos >= 0 && pos < stepCount) {
      steps[pos] = createStep(true, defaultVelocity);
    }
  }
  return steps;
}

/**
 * Create steps with specific positions and velocities
 * @param stepCount Total number of steps
 * @param hits Array of [position, velocity] tuples
 */
export function createStepsWithVelocities(
  stepCount: 16 | 32,
  hits: [number, number][]
): DrumStep[] {
  const steps = createEmptySteps(stepCount);
  for (const [pos, vel] of hits) {
    if (pos >= 0 && pos < stepCount) {
      steps[pos] = createStep(true, vel);
    }
  }
  return steps;
}

/**
 * Create a drum track
 */
export function createTrack(
  id: string,
  name: string,
  sampleUrl: string,
  steps: DrumStep[]
): DrumTrack {
  return { id, name, sampleUrl, steps };
}

/**
 * Create an empty pattern with standard 4-track setup
 */
export function createEmptyPattern(
  name: string = 'Empty Pattern',
  tempo: number = 120,
  stepCount: 16 | 32 = 16
): DrumPattern {
  return {
    name,
    tempo,
    swing: 0,
    stepCount,
    tracks: [
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick, createEmptySteps(stepCount)),
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare, createEmptySteps(stepCount)),
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed, createEmptySteps(stepCount)),
      createTrack('hihat-open', 'HH Open', DRUM_SAMPLES.hihatOpen, createEmptySteps(stepCount)),
    ],
  };
}

/**
 * Create a pattern with specific track configurations
 */
export function createPattern(
  name: string,
  tempo: number,
  swing: number,
  stepCount: 16 | 32,
  trackConfigs: {
    id: string;
    name: string;
    sampleUrl: string;
    steps: DrumStep[];
  }[]
): DrumPattern {
  return {
    name,
    tempo,
    swing,
    stepCount,
    tracks: trackConfigs,
  };
}

/**
 * Create a standard 4-track pattern with specific step configurations
 */
export function createStandardPattern(
  name: string,
  tempo: number,
  swing: number,
  stepCount: 16 | 32,
  kickSteps: DrumStep[],
  snareSteps: DrumStep[],
  hihatClosedSteps: DrumStep[],
  hihatOpenSteps: DrumStep[]
): DrumPattern {
  return {
    name,
    tempo,
    swing,
    stepCount,
    tracks: [
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick, kickSteps),
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare, snareSteps),
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed, hihatClosedSteps),
      createTrack('hihat-open', 'HH Open', DRUM_SAMPLES.hihatOpen, hihatOpenSteps),
    ],
  };
}

/**
 * Create eighth note pattern (hits on 0, 2, 4, 6, 8, 10, 12, 14)
 */
export function createEighthNoteSteps(stepCount: 16 | 32 = 16, velocity: number = 0.8): DrumStep[] {
  const positions = [];
  for (let i = 0; i < stepCount; i += 2) {
    positions.push(i);
  }
  return createStepsWithHits(stepCount, positions, velocity);
}

/**
 * Create sixteenth note pattern (hits on every step)
 */
export function createSixteenthNoteSteps(stepCount: 16 | 32 = 16, velocity: number = 0.8): DrumStep[] {
  const positions = [];
  for (let i = 0; i < stepCount; i++) {
    positions.push(i);
  }
  return createStepsWithHits(stepCount, positions, velocity);
}

/**
 * Create four-on-the-floor kick pattern (0, 4, 8, 12)
 */
export function createFourOnFloorKick(stepCount: 16 | 32 = 16, velocity: number = 0.9): DrumStep[] {
  const positions = [];
  for (let i = 0; i < stepCount; i += 4) {
    positions.push(i);
  }
  return createStepsWithHits(stepCount, positions, velocity);
}

/**
 * Create backbeat snare pattern (4, 12 for 16 steps = beats 2 and 4)
 */
export function createBackbeatSnare(stepCount: 16 | 32 = 16, velocity: number = 0.9): DrumStep[] {
  const positions = [];
  for (let i = 4; i < stepCount; i += 8) {
    positions.push(i);
  }
  return createStepsWithHits(stepCount, positions, velocity);
}

/**
 * Create offbeat hi-hat pattern (2, 6, 10, 14 for house music)
 */
export function createOffbeatHihat(stepCount: 16 | 32 = 16, velocity: number = 0.7): DrumStep[] {
  const positions = [];
  for (let i = 2; i < stepCount; i += 4) {
    positions.push(i);
  }
  return createStepsWithHits(stepCount, positions, velocity);
}
