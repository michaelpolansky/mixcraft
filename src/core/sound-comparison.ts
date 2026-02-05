/**
 * Sound Comparison and Scoring
 * Hybrid scoring using audio features (70%) and parameter proximity (30%)
 */

import type { SoundFeatures } from './sound-analysis.ts';
import type { SynthParams } from './types.ts';

/**
 * Detailed breakdown of how well each aspect matched
 */
export interface ScoreBreakdown {
  brightness: { score: number; feedback: string };
  attack: { score: number; feedback: string };
  filter: { score: number; feedback: string };
  envelope: { score: number; feedback: string };
}

/**
 * Complete scoring result
 */
export interface ScoreResult {
  /** Overall score 0-100 */
  overall: number;
  /** Star rating based on score thresholds */
  stars: 1 | 2 | 3;
  /** Detailed breakdown by category */
  breakdown: ScoreBreakdown;
  /** Whether the challenge is passed (>= 60%) */
  passed: boolean;
}

/**
 * Thresholds for star ratings
 */
const STAR_THRESHOLDS = {
  one: 60,
  two: 80,
  three: 95,
};

/**
 * Weights for hybrid scoring
 */
const WEIGHTS = {
  audioFeatures: 0.7,
  parameterProximity: 0.3,
};

/**
 * Compares player's sound to target and returns a score
 */
export function compareSounds(
  playerFeatures: SoundFeatures,
  targetFeatures: SoundFeatures,
  playerParams: SynthParams,
  targetParams: SynthParams
): ScoreResult {
  // Calculate audio feature scores (70% of total)
  const brightnessScore = compareBrightness(playerFeatures, targetFeatures);
  const attackScore = compareAttack(playerFeatures, targetFeatures);
  const envelopeScore = compareEnvelope(playerFeatures, targetFeatures);
  const spectrumScore = compareSpectrum(playerFeatures, targetFeatures);

  // Calculate parameter proximity scores (30% of total)
  const filterParamScore = compareFilterParams(playerParams, targetParams);
  const oscParamScore = compareOscillatorParams(playerParams, targetParams);
  const envParamScore = compareEnvelopeParams(playerParams, targetParams);

  // Weighted audio feature score
  const audioScore = (
    brightnessScore.score * 0.3 +
    attackScore.score * 0.25 +
    envelopeScore.score * 0.25 +
    spectrumScore * 0.2
  ) / 100; // Normalize to 0-1

  // Weighted parameter proximity score
  const paramScore = (
    filterParamScore * 0.4 +
    oscParamScore * 0.3 +
    envParamScore * 0.3
  );

  // Combined score
  const overall = Math.round(
    audioScore * WEIGHTS.audioFeatures * 100 +
    paramScore * WEIGHTS.parameterProximity * 100
  );

  // Clamp to valid range
  const clampedOverall = Math.max(0, Math.min(100, overall));

  // Determine stars
  let stars: 1 | 2 | 3 = 1;
  if (clampedOverall >= STAR_THRESHOLDS.three) {
    stars = 3;
  } else if (clampedOverall >= STAR_THRESHOLDS.two) {
    stars = 2;
  }

  return {
    overall: clampedOverall,
    stars,
    breakdown: {
      brightness: brightnessScore,
      attack: attackScore,
      filter: {
        score: Math.round(filterParamScore * 100),
        feedback: getFilterFeedback(playerParams, targetParams),
      },
      envelope: envelopeScore,
    },
    passed: clampedOverall >= STAR_THRESHOLDS.one,
  };
}

/**
 * Compare brightness (spectral centroid)
 */
function compareBrightness(
  player: SoundFeatures,
  target: SoundFeatures
): { score: number; feedback: string } {
  // Normalize difference relative to target
  const maxCentroid = Math.max(target.spectralCentroid, 1);
  const diff = Math.abs(player.spectralCentroid - target.spectralCentroid);
  const normalizedDiff = diff / maxCentroid;

  // Score: 0 diff = 100%, 50% diff = 0%
  const score = Math.max(0, Math.round((1 - normalizedDiff * 2) * 100));

  let feedback: string;
  if (score >= 80) {
    feedback = 'Brightness matches well';
  } else if (player.spectralCentroid > target.spectralCentroid * 1.2) {
    feedback = 'Too bright - try lowering the filter cutoff';
  } else if (player.spectralCentroid < target.spectralCentroid * 0.8) {
    feedback = 'Too dark - try raising the filter cutoff';
  } else {
    feedback = 'Brightness is close, fine-tune the filter';
  }

  return { score, feedback };
}

/**
 * Compare attack characteristics
 */
function compareAttack(
  player: SoundFeatures,
  target: SoundFeatures
): { score: number; feedback: string } {
  // Attack time is in frames (0-20 typically)
  const maxDiff = 10; // 10 frames difference = 0 score
  const diff = Math.abs(player.attackTime - target.attackTime);
  const score = Math.max(0, Math.round((1 - diff / maxDiff) * 100));

  let feedback: string;
  if (score >= 80) {
    feedback = 'Attack time is spot on';
  } else if (player.attackTime > target.attackTime + 3) {
    feedback = 'Attack is too slow - try a shorter attack time';
  } else if (player.attackTime < target.attackTime - 3) {
    feedback = 'Attack is too fast - try a longer attack time';
  } else {
    feedback = 'Attack is close, fine-tune the envelope';
  }

  return { score, feedback };
}

/**
 * Compare envelope shapes using RMS envelope
 */
function compareEnvelope(
  player: SoundFeatures,
  target: SoundFeatures
): { score: number; feedback: string } {
  // Compare normalized RMS envelopes
  let totalDiff = 0;
  const len = Math.min(player.rmsEnvelope.length, target.rmsEnvelope.length);

  for (let i = 0; i < len; i++) {
    const pVal = player.rmsEnvelope[i] ?? 0;
    const tVal = target.rmsEnvelope[i] ?? 0;
    totalDiff += Math.abs(pVal - tVal);
  }

  const avgDiff = len > 0 ? totalDiff / len : 1;
  // avgDiff of 0 = 100%, avgDiff of 0.5 = 0%
  const score = Math.max(0, Math.round((1 - avgDiff * 2) * 100));

  let feedback: string;
  if (score >= 80) {
    feedback = 'Envelope shape matches well';
  } else if (score >= 50) {
    feedback = 'Envelope is close but could be tighter';
  } else {
    feedback = 'Envelope shape needs work - check attack, decay, and sustain';
  }

  return { score, feedback };
}

/**
 * Compare raw spectrum similarity using cosine similarity
 */
function compareSpectrum(player: SoundFeatures, target: SoundFeatures): number {
  // Compare the lower part of the spectrum (most perceptually relevant)
  const compareLength = Math.min(
    128,
    player.averageSpectrum.length,
    target.averageSpectrum.length
  );

  let dotProduct = 0;
  let playerMag = 0;
  let targetMag = 0;

  for (let i = 0; i < compareLength; i++) {
    const p = player.averageSpectrum[i] ?? 0;
    const t = target.averageSpectrum[i] ?? 0;
    dotProduct += p * t;
    playerMag += p * p;
    targetMag += t * t;
  }

  // Cosine similarity
  const magnitude = Math.sqrt(playerMag) * Math.sqrt(targetMag);
  if (magnitude === 0) return 50; // Default to middle score

  const similarity = dotProduct / magnitude;
  return Math.round(similarity * 100);
}

/**
 * Compare filter parameters
 */
function compareFilterParams(player: SynthParams, target: SynthParams): number {
  // Cutoff comparison (logarithmic scale)
  const cutoffRatio = player.filter.cutoff / target.filter.cutoff;
  const cutoffScore = 1 - Math.min(1, Math.abs(Math.log2(cutoffRatio)) / 2);

  // Resonance comparison
  const resDiff = Math.abs(player.filter.resonance - target.filter.resonance);
  const resScore = Math.max(0, 1 - resDiff / 10);

  // Type match bonus
  const typeMatch = player.filter.type === target.filter.type ? 1 : 0.5;

  return (cutoffScore * 0.5 + resScore * 0.3 + typeMatch * 0.2);
}

/**
 * Compare oscillator parameters
 */
function compareOscillatorParams(player: SynthParams, target: SynthParams): number {
  // Waveform type is most important
  const typeMatch = player.oscillator.type === target.oscillator.type ? 1 : 0;

  // Octave match
  const octaveDiff = Math.abs(player.oscillator.octave - target.oscillator.octave);
  const octaveScore = Math.max(0, 1 - octaveDiff / 2);

  // Detune (less important)
  const detuneDiff = Math.abs(player.oscillator.detune - target.oscillator.detune);
  const detuneScore = Math.max(0, 1 - detuneDiff / 100);

  return (typeMatch * 0.6 + octaveScore * 0.3 + detuneScore * 0.1);
}

/**
 * Compare envelope parameters
 */
function compareEnvelopeParams(player: SynthParams, target: SynthParams): number {
  const pEnv = player.amplitudeEnvelope;
  const tEnv = target.amplitudeEnvelope;

  // Compare each ADSR component (logarithmic for times)
  const attackScore = compareLogTime(pEnv.attack, tEnv.attack);
  const decayScore = compareLogTime(pEnv.decay, tEnv.decay);
  const sustainScore = 1 - Math.abs(pEnv.sustain - tEnv.sustain);
  const releaseScore = compareLogTime(pEnv.release, tEnv.release);

  return (attackScore * 0.3 + decayScore * 0.25 + sustainScore * 0.25 + releaseScore * 0.2);
}

/**
 * Compare time values on logarithmic scale
 */
function compareLogTime(player: number, target: number): number {
  if (target === 0) return player === 0 ? 1 : 0;
  const ratio = player / target;
  return Math.max(0, 1 - Math.abs(Math.log2(ratio)));
}

/**
 * Generate feedback for filter settings
 */
function getFilterFeedback(player: SynthParams, target: SynthParams): string {
  const cutoffRatio = player.filter.cutoff / target.filter.cutoff;

  if (player.filter.type !== target.filter.type) {
    return `Try a ${target.filter.type} filter`;
  } else if (cutoffRatio > 1.3) {
    return 'Filter cutoff is too high';
  } else if (cutoffRatio < 0.7) {
    return 'Filter cutoff is too low';
  } else if (Math.abs(player.filter.resonance - target.filter.resonance) > 3) {
    return player.filter.resonance > target.filter.resonance
      ? 'Resonance is too high'
      : 'Resonance is too low';
  }
  return 'Filter settings are close';
}

/**
 * Generates an overall summary of the attempt
 */
export function generateSummary(result: ScoreResult): string {
  if (result.stars === 3) {
    return 'Perfect! You nailed it!';
  } else if (result.stars === 2) {
    return 'Great job! Just a few tweaks needed for perfection.';
  } else if (result.passed) {
    return 'Good start! Keep refining to improve your score.';
  } else {
    // Find the worst category
    const breakdown = result.breakdown;
    const worst = Object.entries(breakdown).reduce((a, b) =>
      a[1].score < b[1].score ? a : b
    );
    return `Focus on ${worst[0]}: ${worst[1].feedback}`;
  }
}
