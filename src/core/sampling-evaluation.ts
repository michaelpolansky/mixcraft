/**
 * Sampling Challenge Evaluation
 * Scoring logic for sample manipulation challenges
 */

import type { SamplingChallenge, SamplerParams, SampleSlice } from './types.ts';

/**
 * Score result for sampling challenges
 */
export interface SamplingScoreResult {
  overall: number;           // 0-100
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    type: SamplingChallenge['challengeType'];
    pitchScore?: number;
    sliceScore?: number;
    timingScore?: number;
    creativityScore?: number;
  };
  feedback: string[];
}

/**
 * Tolerance values for sampling evaluation
 */
const TOLERANCES = {
  pitch: 1,           // +/- 1 semitone
  timeStretch: 0.1,   // +/- 10%
  startPoint: 0.02,   // +/- 2% of sample length
  endPoint: 0.02,     // +/- 2% of sample length
  fade: 0.05,         // +/- 50ms for fades
};

/**
 * Score pitch accuracy
 * Returns 100 for exact match, scaled down based on semitone difference
 */
export function scorePitch(actual: number, target: number): number {
  const diff = Math.abs(actual - target);

  if (diff === 0) {
    return 100;
  } else if (diff <= TOLERANCES.pitch) {
    // Within tolerance: 70-100 based on how close
    return 100 - (diff / TOLERANCES.pitch) * 30;
  } else {
    // Outside tolerance: 0-70 based on distance
    const maxDiff = TOLERANCES.pitch * 5; // Beyond 5 semitones is 0
    const ratio = Math.min(diff / maxDiff, 1);
    return 70 * (1 - ratio);
  }
}

/**
 * Score slice count and distribution
 * Returns score based on correct number and reasonable spacing
 */
export function scoreSlices(
  actualSlices: SampleSlice[],
  expectedCount: number,
  duration: number
): number {
  if (expectedCount === 0) {
    // No slices expected - full score if none created
    return actualSlices.length === 0 ? 100 : 50;
  }

  const actualCount = actualSlices.length;

  // Score for count accuracy (0-60 points)
  let countScore: number;
  if (actualCount === expectedCount) {
    countScore = 60;
  } else {
    const countDiff = Math.abs(actualCount - expectedCount);
    const countRatio = countDiff / expectedCount;
    countScore = Math.max(0, 60 * (1 - countRatio));
  }

  // Score for distribution (0-40 points)
  // Good slices are evenly distributed
  let distributionScore = 0;
  if (actualCount >= 2 && duration > 0) {
    const idealSpacing = duration / actualCount;
    const sortedSlices = [...actualSlices].sort((a, b) => a.start - b.start);

    let spacingVariance = 0;
    for (let i = 1; i < sortedSlices.length; i++) {
      const current = sortedSlices[i];
      const prev = sortedSlices[i - 1];
      if (current && prev) {
        const spacing = current.start - prev.start;
        spacingVariance += Math.abs(spacing - idealSpacing);
      }
    }

    const avgVariance = spacingVariance / (sortedSlices.length - 1);
    const varianceRatio = avgVariance / idealSpacing;
    distributionScore = Math.max(0, 40 * (1 - varianceRatio));
  } else if (actualCount === 1 && expectedCount === 1) {
    distributionScore = 40; // Single slice, full distribution score
  }

  return Math.round(countScore + distributionScore);
}

/**
 * Score time stretch accuracy
 * Returns score based on how close to target time stretch factor
 */
export function scoreTimeStretch(actual: number, target: number): number {
  const diff = Math.abs(actual - target);

  if (diff === 0) {
    return 100;
  } else if (diff <= TOLERANCES.timeStretch) {
    // Within tolerance: 70-100
    return 100 - (diff / TOLERANCES.timeStretch) * 30;
  } else {
    // Outside tolerance: 0-70
    const maxDiff = TOLERANCES.timeStretch * 5;
    const ratio = Math.min(diff / maxDiff, 1);
    return 70 * (1 - ratio);
  }
}

/**
 * Score start/end point accuracy for trimming
 */
function scoreTrimPoints(
  actualStart: number,
  actualEnd: number,
  targetStart: number,
  targetEnd: number
): number {
  const startDiff = Math.abs(actualStart - targetStart);
  const endDiff = Math.abs(actualEnd - targetEnd);

  let startScore: number;
  if (startDiff <= TOLERANCES.startPoint) {
    startScore = 100 - (startDiff / TOLERANCES.startPoint) * 30;
  } else {
    startScore = Math.max(0, 70 * (1 - startDiff / (TOLERANCES.startPoint * 5)));
  }

  let endScore: number;
  if (endDiff <= TOLERANCES.endPoint) {
    endScore = 100 - (endDiff / TOLERANCES.endPoint) * 30;
  } else {
    endScore = Math.max(0, 70 * (1 - endDiff / (TOLERANCES.endPoint * 5)));
  }

  return (startScore + endScore) / 2;
}

/**
 * Score fade accuracy
 */
function scoreFades(
  actualFadeIn: number,
  actualFadeOut: number,
  targetFadeIn: number,
  targetFadeOut: number
): number {
  const fadeInDiff = Math.abs(actualFadeIn - targetFadeIn);
  const fadeOutDiff = Math.abs(actualFadeOut - targetFadeOut);

  let fadeInScore: number;
  if (fadeInDiff <= TOLERANCES.fade) {
    fadeInScore = 100 - (fadeInDiff / TOLERANCES.fade) * 30;
  } else {
    fadeInScore = Math.max(0, 70 * (1 - fadeInDiff / (TOLERANCES.fade * 5)));
  }

  let fadeOutScore: number;
  if (fadeOutDiff <= TOLERANCES.fade) {
    fadeOutScore = 100 - (fadeOutDiff / TOLERANCES.fade) * 30;
  } else {
    fadeOutScore = Math.max(0, 70 * (1 - fadeOutDiff / (TOLERANCES.fade * 5)));
  }

  return (fadeInScore + fadeOutScore) / 2;
}

/**
 * Evaluate a recreate-kit challenge
 * Check pitch, slices, and timing against targetParams
 */
function evaluateRecreateKit(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const target = challenge.targetParams || {};

  let pitchScore = 100;
  let sliceScore = 100;
  let timingScore = 100;
  let componentCount = 0;

  // Score pitch if target has pitch
  if (target.pitch !== undefined) {
    pitchScore = scorePitch(userParams.pitch, target.pitch);
    componentCount++;

    if (pitchScore < 70) {
      feedback.push(`Pitch is off by ${Math.abs(userParams.pitch - target.pitch)} semitones`);
    } else if (pitchScore < 90) {
      feedback.push('Pitch is close, fine-tune it');
    }
  }

  // Score slices if expected
  if (challenge.expectedSlices !== undefined) {
    sliceScore = scoreSlices(userParams.slices, challenge.expectedSlices, userParams.duration);
    componentCount++;

    if (sliceScore < 70) {
      feedback.push(`Expected ${challenge.expectedSlices} slices, you have ${userParams.slices.length}`);
    } else if (sliceScore < 90) {
      feedback.push('Check your slice distribution');
    }
  }

  // Score time stretch if target has it
  if (target.timeStretch !== undefined) {
    timingScore = scoreTimeStretch(userParams.timeStretch, target.timeStretch);
    componentCount++;

    if (timingScore < 70) {
      feedback.push('Time stretch is off target');
    } else if (timingScore < 90) {
      feedback.push('Time stretch is close');
    }
  }

  // Calculate overall
  const scores = [pitchScore, sliceScore, timingScore].slice(0, componentCount || 1);
  const overall = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  // Add summary feedback
  if (overall >= 90) {
    feedback.unshift('Excellent kit recreation!');
  } else if (overall >= 75) {
    feedback.unshift('Good work, getting close!');
  } else if (passed) {
    feedback.unshift('Keep refining your samples');
  } else {
    feedback.unshift('Listen to the reference again');
  }

  return {
    overall,
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'recreate-kit',
      pitchScore: target.pitch !== undefined ? pitchScore : undefined,
      sliceScore: challenge.expectedSlices !== undefined ? sliceScore : undefined,
      timingScore: target.timeStretch !== undefined ? timingScore : undefined,
    },
    feedback,
  };
}

/**
 * Evaluate a chop-challenge
 * Check slice count and distribution
 */
function evaluateChopChallenge(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const expectedSlices = challenge.expectedSlices || 4;

  const sliceScore = scoreSlices(userParams.slices, expectedSlices, userParams.duration);

  if (userParams.slices.length === 0) {
    feedback.push('No slices created - chop up the sample!');
  } else if (userParams.slices.length !== expectedSlices) {
    feedback.push(`Expected ${expectedSlices} slices, you have ${userParams.slices.length}`);
  }

  if (sliceScore < 60 && userParams.slices.length > 0) {
    feedback.push('Try spacing your chops more evenly');
  } else if (sliceScore >= 60 && sliceScore < 90) {
    feedback.push('Good chopping, refine the spacing');
  }

  const overall = sliceScore;
  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('Perfect chops!');
  } else if (overall >= 75) {
    feedback.unshift('Nice chopping!');
  } else if (passed) {
    feedback.unshift('Chops are acceptable');
  } else {
    feedback.unshift('Keep practicing your chopping');
  }

  return {
    overall,
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'chop-challenge',
      sliceScore,
    },
    feedback,
  };
}

/**
 * Evaluate a tune-to-track challenge
 * Check pitch and time stretch to match target key/BPM
 */
function evaluateTuneToTrack(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const target = challenge.targetParams || {};

  let pitchScore = 100;
  let timingScore = 100;
  let componentCount = 0;

  // Score pitch tuning
  if (target.pitch !== undefined) {
    pitchScore = scorePitch(userParams.pitch, target.pitch);
    componentCount++;

    const pitchDiff = Math.abs(userParams.pitch - target.pitch);
    if (pitchScore < 70) {
      feedback.push(`Sample is ${pitchDiff > 0 ? (userParams.pitch > target.pitch ? 'sharp' : 'flat') : ''} - adjust pitch`);
    } else if (pitchScore < 90) {
      feedback.push('Almost in tune, small adjustment needed');
    }
  }

  // Score time stretch
  if (target.timeStretch !== undefined) {
    timingScore = scoreTimeStretch(userParams.timeStretch, target.timeStretch);
    componentCount++;

    if (timingScore < 70) {
      feedback.push('Tempo is off - adjust time stretch');
    } else if (timingScore < 90) {
      feedback.push('Tempo is close, fine-tune it');
    }
  }

  const scores = [pitchScore, timingScore].slice(0, componentCount || 1);
  const overall = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('Sample is perfectly tuned to the track!');
  } else if (overall >= 75) {
    feedback.unshift('Good tuning, almost there!');
  } else if (passed) {
    feedback.unshift('Getting closer, keep adjusting');
  } else {
    feedback.unshift('Listen to the reference and match pitch/tempo');
  }

  return {
    overall,
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'tune-to-track',
      pitchScore: target.pitch !== undefined ? pitchScore : undefined,
      timingScore: target.timeStretch !== undefined ? timingScore : undefined,
    },
    feedback,
  };
}

/**
 * Evaluate a flip-this challenge
 * Creative challenges - basic scoring (sample loaded and manipulated = pass)
 */
function evaluateFlipThis(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];

  // Check if sample is loaded
  const sampleLoaded = userParams.sampleUrl !== null && userParams.sampleUrl !== '';

  // Check for any manipulation
  const hasManipulation =
    userParams.pitch !== 0 ||
    userParams.timeStretch !== 1.0 ||
    userParams.slices.length > 0 ||
    userParams.reverse ||
    userParams.startPoint > 0 ||
    userParams.endPoint < 1;

  let creativityScore = 0;

  if (!sampleLoaded) {
    creativityScore = 0;
    feedback.push('Load a sample to start your flip');
  } else if (!hasManipulation) {
    creativityScore = 50;
    feedback.push('Sample loaded - now get creative! Try pitching, chopping, or reversing');
  } else {
    // Score based on amount of manipulation
    let manipulations = 0;
    if (userParams.pitch !== 0) manipulations++;
    if (userParams.timeStretch !== 1.0) manipulations++;
    if (userParams.slices.length > 0) manipulations++;
    if (userParams.reverse) manipulations++;
    if (userParams.startPoint > 0 || userParams.endPoint < 1) manipulations++;

    // Base score of 60, +10 for each manipulation up to 100
    creativityScore = Math.min(100, 60 + manipulations * 10);

    if (manipulations === 1) {
      feedback.push('Good start! Try combining more techniques');
    } else if (manipulations === 2) {
      feedback.push('Nice! Keep experimenting');
    } else {
      feedback.push('Creative flip! You\'re using multiple techniques');
    }
  }

  const overall = creativityScore;
  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('Impressive flip!');
  } else if (overall >= 75) {
    feedback.unshift('Great creative work!');
  } else if (passed) {
    feedback.unshift('Keep flipping!');
  } else {
    feedback.unshift('Load a sample and make it your own');
  }

  return {
    overall,
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'flip-this',
      creativityScore,
    },
    feedback,
  };
}

/**
 * Evaluate a clean-sample challenge
 * Check for proper trim (start/end points) and fades
 */
function evaluateCleanSample(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const target = challenge.targetParams || {};

  let trimScore = 100;
  let fadeScore = 100;
  let componentCount = 0;

  // Score trim points
  if (target.startPoint !== undefined || target.endPoint !== undefined) {
    const targetStart = target.startPoint ?? 0;
    const targetEnd = target.endPoint ?? 1;

    trimScore = scoreTrimPoints(
      userParams.startPoint,
      userParams.endPoint,
      targetStart,
      targetEnd
    );
    componentCount++;

    if (trimScore < 70) {
      feedback.push('Trim points need adjustment');
    } else if (trimScore < 90) {
      feedback.push('Trim is close, refine the start/end points');
    }
  }

  // Score fades
  if (target.fadeIn !== undefined || target.fadeOut !== undefined) {
    const targetFadeIn = target.fadeIn ?? 0;
    const targetFadeOut = target.fadeOut ?? 0;

    fadeScore = scoreFades(
      userParams.fadeIn,
      userParams.fadeOut,
      targetFadeIn,
      targetFadeOut
    );
    componentCount++;

    if (fadeScore < 70) {
      feedback.push('Adjust your fades to smooth the edges');
    } else if (fadeScore < 90) {
      feedback.push('Fades are close, fine-tune them');
    }
  }

  // If no targets, check for any cleaning applied
  if (componentCount === 0) {
    const hasTrims = userParams.startPoint > 0 || userParams.endPoint < 1;
    const hasFades = userParams.fadeIn > 0 || userParams.fadeOut > 0;

    if (hasTrims && hasFades) {
      trimScore = 100;
      fadeScore = 100;
    } else if (hasTrims || hasFades) {
      trimScore = 75;
      fadeScore = 75;
      feedback.push('Good start! Try trimming and adding fades');
    } else {
      trimScore = 50;
      fadeScore = 50;
      feedback.push('Trim the sample and add fades to clean it up');
    }
    componentCount = 2;
  }

  const overall = Math.round((trimScore + fadeScore) / 2);
  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('Sample is clean and polished!');
  } else if (overall >= 75) {
    feedback.unshift('Good cleanup work!');
  } else if (passed) {
    feedback.unshift('Sample is usable, but could be cleaner');
  } else {
    feedback.unshift('Focus on trimming silence and smoothing edges');
  }

  return {
    overall,
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'clean-sample',
      timingScore: trimScore,
    },
    feedback,
  };
}

/**
 * Evaluate a sampling challenge
 * Routes to the appropriate evaluator based on challenge type
 */
export function evaluateSamplingChallenge(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  switch (challenge.challengeType) {
    case 'recreate-kit':
      return evaluateRecreateKit(challenge, userParams);
    case 'chop-challenge':
      return evaluateChopChallenge(challenge, userParams);
    case 'tune-to-track':
      return evaluateTuneToTrack(challenge, userParams);
    case 'flip-this':
      return evaluateFlipThis(challenge, userParams);
    case 'clean-sample':
      return evaluateCleanSample(challenge, userParams);
    default:
      // Fallback for unknown types
      return {
        overall: 0,
        stars: 1,
        passed: false,
        breakdown: {
          type: challenge.challengeType,
        },
        feedback: ['Unknown challenge type'],
      };
  }
}
