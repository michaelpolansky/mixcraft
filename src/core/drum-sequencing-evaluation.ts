/**
 * Drum Sequencing Challenge Evaluation
 * Scoring logic for drum pattern matching challenges
 */

import type { DrumSequencingChallenge, DrumPattern, DrumTrack, DrumStep } from './types.ts';

/**
 * Score result for drum sequencing challenges
 */
export interface DrumSequencingScoreResult {
  overall: number;           // 0-100
  stars: 1 | 2 | 3;
  passed: boolean;           // >= 70
  breakdown: {
    patternScore?: number;
    velocityScore?: number;
    swingScore?: number;
    tempoScore?: number;
  };
  feedback: string[];
}

/**
 * Tolerance values for drum sequencing evaluation
 */
const TOLERANCES = {
  velocity: 0.15,    // +/- 0.15 out of 1.0
  swing: 0.1,        // +/- 0.1 out of 1.0
  tempo: 5,          // +/- 5 BPM
};

/**
 * Compare step on/off states between two tracks
 * Returns percentage of matching steps (0-100)
 */
export function compareTrackPatterns(
  userTrack: DrumTrack,
  targetTrack: DrumTrack
): number {
  const userSteps = userTrack.steps;
  const targetSteps = targetTrack.steps;

  // Handle mismatched step counts by using the shorter length
  const stepCount = Math.min(userSteps.length, targetSteps.length);

  if (stepCount === 0) {
    return 100; // No steps to compare
  }

  let matchingSteps = 0;

  for (let i = 0; i < stepCount; i++) {
    const userActive = userSteps[i]?.active ?? false;
    const targetActive = targetSteps[i]?.active ?? false;

    if (userActive === targetActive) {
      matchingSteps++;
    }
  }

  return (matchingSteps / stepCount) * 100;
}

/**
 * Score pattern accuracy across all tracks
 * Returns 0-100 based on matching step on/off states
 */
export function scorePattern(
  userPattern: DrumPattern,
  targetPattern: DrumPattern
): number {
  const userTracks = userPattern.tracks;
  const targetTracks = targetPattern.tracks;

  if (targetTracks.length === 0) {
    return 100; // No tracks to compare
  }

  let totalScore = 0;
  let tracksCompared = 0;

  // Compare each target track with matching user track
  for (const targetTrack of targetTracks) {
    const userTrack = userTracks.find(t => t.id === targetTrack.id);

    if (userTrack) {
      totalScore += compareTrackPatterns(userTrack, targetTrack);
      tracksCompared++;
    } else {
      // User is missing this track entirely - count as 0% match
      tracksCompared++;
    }
  }

  if (tracksCompared === 0) {
    return 100;
  }

  return Math.round(totalScore / tracksCompared);
}

/**
 * Compare velocity values for active steps
 * Only scores steps that are active in both patterns
 * Returns 0-100 based on velocity accuracy within tolerance
 */
export function scoreVelocity(
  userPattern: DrumPattern,
  targetPattern: DrumPattern
): number {
  const userTracks = userPattern.tracks;
  const targetTracks = targetPattern.tracks;

  let totalScore = 0;
  let stepsCompared = 0;

  for (const targetTrack of targetTracks) {
    const userTrack = userTracks.find(t => t.id === targetTrack.id);

    if (!userTrack) continue;

    const stepCount = Math.min(userTrack.steps.length, targetTrack.steps.length);

    for (let i = 0; i < stepCount; i++) {
      const userStep = userTrack.steps[i];
      const targetStep = targetTrack.steps[i];

      // Only compare steps that are active in both patterns
      if (userStep?.active && targetStep?.active) {
        const userVelocity = userStep.velocity;
        const targetVelocity = targetStep.velocity;
        const diff = Math.abs(userVelocity - targetVelocity);

        if (diff <= TOLERANCES.velocity) {
          // Within tolerance: scale 100-70 based on how close
          const score = 100 - (diff / TOLERANCES.velocity) * 30;
          totalScore += score;
        } else {
          // Outside tolerance: scale 70-0 based on distance
          const maxDiff = TOLERANCES.velocity * 3;
          const ratio = Math.min((diff - TOLERANCES.velocity) / maxDiff, 1);
          totalScore += 70 * (1 - ratio);
        }

        stepsCompared++;
      }
    }
  }

  if (stepsCompared === 0) {
    return 100; // No active steps to compare
  }

  return Math.round(totalScore / stepsCompared);
}

/**
 * Score swing accuracy
 * Returns 0-100 based on swing value match within tolerance
 */
export function scoreSwing(
  userSwing: number,
  targetSwing: number
): number {
  const diff = Math.abs(userSwing - targetSwing);

  if (diff <= TOLERANCES.swing) {
    // Within tolerance: scale 100-70 based on how close
    return Math.round(100 - (diff / TOLERANCES.swing) * 30);
  } else {
    // Outside tolerance: scale 70-0 based on distance
    const maxDiff = TOLERANCES.swing * 3;
    const ratio = Math.min((diff - TOLERANCES.swing) / maxDiff, 1);
    return Math.round(70 * (1 - ratio));
  }
}

/**
 * Score tempo accuracy
 * Returns 0-100 based on tempo match within tolerance
 */
export function scoreTempo(
  userTempo: number,
  targetTempo: number
): number {
  const diff = Math.abs(userTempo - targetTempo);

  if (diff <= TOLERANCES.tempo) {
    // Within tolerance: scale 100-70 based on how close
    return Math.round(100 - (diff / TOLERANCES.tempo) * 30);
  } else {
    // Outside tolerance: scale 70-0 based on distance
    const maxDiff = TOLERANCES.tempo * 3;
    const ratio = Math.min((diff - TOLERANCES.tempo) / maxDiff, 1);
    return Math.round(70 * (1 - ratio));
  }
}

/**
 * Generate feedback messages based on scores
 */
function generateFeedback(
  breakdown: DrumSequencingScoreResult['breakdown'],
  overall: number,
  evaluationFocus: DrumSequencingChallenge['evaluationFocus']
): string[] {
  const feedback: string[] = [];

  // Add specific feedback for each evaluated aspect
  if (evaluationFocus.includes('pattern') && breakdown.patternScore !== undefined) {
    if (breakdown.patternScore < 70) {
      feedback.push('Some steps are in the wrong position - check the pattern');
    } else if (breakdown.patternScore < 90) {
      feedback.push('Pattern is close, but a few steps need adjustment');
    }
  }

  if (evaluationFocus.includes('velocity') && breakdown.velocityScore !== undefined) {
    if (breakdown.velocityScore < 70) {
      feedback.push('Velocity dynamics are off - adjust hit strengths');
    } else if (breakdown.velocityScore < 90) {
      feedback.push('Velocities are close, fine-tune the dynamics');
    }
  }

  if (evaluationFocus.includes('swing') && breakdown.swingScore !== undefined) {
    if (breakdown.swingScore < 70) {
      feedback.push('Swing amount needs adjustment');
    } else if (breakdown.swingScore < 90) {
      feedback.push('Swing is close, small adjustment needed');
    }
  }

  if (evaluationFocus.includes('tempo') && breakdown.tempoScore !== undefined) {
    if (breakdown.tempoScore < 70) {
      feedback.push('Tempo is off - check the BPM');
    } else if (breakdown.tempoScore < 90) {
      feedback.push('Tempo is close, fine-tune the BPM');
    }
  }

  // Add summary feedback at the beginning
  if (overall >= 90) {
    feedback.unshift('Excellent drum pattern!');
  } else if (overall >= 70) {
    feedback.unshift('Good work, pattern is solid!');
  } else {
    feedback.unshift('Keep practicing - listen to the target pattern');
  }

  return feedback;
}

/**
 * Evaluate a drum sequencing challenge
 * Compares user pattern against target pattern based on evaluation focus
 */
export function evaluateDrumSequencingChallenge(
  challenge: DrumSequencingChallenge,
  userPattern: DrumPattern
): DrumSequencingScoreResult {
  const { targetPattern, evaluationFocus } = challenge;
  const breakdown: DrumSequencingScoreResult['breakdown'] = {};
  const scores: number[] = [];

  // Calculate scores for each aspect in the evaluation focus
  if (evaluationFocus.includes('pattern')) {
    breakdown.patternScore = scorePattern(userPattern, targetPattern);
    scores.push(breakdown.patternScore);
  }

  if (evaluationFocus.includes('velocity')) {
    breakdown.velocityScore = scoreVelocity(userPattern, targetPattern);
    scores.push(breakdown.velocityScore);
  }

  if (evaluationFocus.includes('swing')) {
    breakdown.swingScore = scoreSwing(userPattern.swing, targetPattern.swing);
    scores.push(breakdown.swingScore);
  }

  if (evaluationFocus.includes('tempo')) {
    breakdown.tempoScore = scoreTempo(userPattern.tempo, targetPattern.tempo);
    scores.push(breakdown.tempoScore);
  }

  // Calculate overall score as average of relevant scores
  const overall = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Determine pass/fail and stars
  const passed = overall >= 70;
  const stars: 1 | 2 | 3 = overall >= 90 ? 3 : overall >= 70 ? 2 : 1;

  // Generate feedback
  const feedback = generateFeedback(breakdown, overall, evaluationFocus);

  return {
    overall,
    stars,
    passed,
    breakdown,
    feedback,
  };
}
