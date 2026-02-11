/**
 * Mixing Evaluation
 * Scores player's EQ and compressor settings against targets
 */

import type {
  MixingChallenge,
  EQParams,
  CompressorFullParams,
  MixingTarget,
  MultiTrackEQTarget,
  MultiTrackGoalTarget,
  MultiTrackCondition,
  ParametricEQParams,
} from './types.ts';
import type { MixingScoreResult, TrackEQParams } from '../ui/stores/mixing-store.ts';

/**
 * Calculate similarity between two values within a tolerance range
 * Returns 100 if exact match, scales down as difference increases
 */
function scoreSimilarity(playerValue: number, targetValue: number, tolerance: number): number {
  const diff = Math.abs(playerValue - targetValue);
  if (diff <= tolerance * 0.1) return 100; // Within 10% tolerance = perfect
  if (diff > tolerance) return 0; // Outside tolerance = zero
  // Linear scale between
  return Math.round(100 * (1 - diff / tolerance));
}

/**
 * Evaluate EQ settings against target
 */
function evaluateEQ(
  player: EQParams,
  target: { low: number; mid: number; high: number },
  tolerance: number = 3 // ±3 dB default tolerance
): { low: number; mid: number; high: number; total: number } {
  const low = scoreSimilarity(player.low, target.low, tolerance);
  const mid = scoreSimilarity(player.mid, target.mid, tolerance);
  const high = scoreSimilarity(player.high, target.high, tolerance);
  const total = Math.round((low + mid + high) / 3);

  return { low, mid, high, total };
}

/**
 * Evaluate compressor settings against target
 */
function evaluateCompressor(
  player: CompressorFullParams,
  target: { threshold: number; amount: number; attack?: number; release?: number },
  includeTimings: boolean = false
): { threshold: number; amount: number; attack?: number; release?: number; total: number } {
  const threshold = scoreSimilarity(player.threshold, target.threshold, 6); // ±6 dB
  const amount = scoreSimilarity(player.amount, target.amount, 15); // ±15%

  if (!includeTimings || target.attack === undefined || target.release === undefined) {
    const total = Math.round((threshold + amount) / 2);
    return { threshold, amount, total };
  }

  // Include attack/release for F5 challenges
  const attack = scoreSimilarity(player.attack, target.attack, 0.05); // ±50ms
  const release = scoreSimilarity(player.release, target.release, 0.1); // ±100ms
  const total = Math.round((threshold + amount + attack + release) / 4);

  return { threshold, amount, attack, release, total };
}

/**
 * Evaluate problem-solving challenges (F6-F8)
 */
function evaluateProblem(
  playerEQ: EQParams,
  playerComp: CompressorFullParams,
  problem: {
    solution: {
      eq?: Partial<{ low: [number, number]; mid: [number, number]; high: [number, number] }>;
      compressor?: Partial<{ threshold: [number, number]; amount: [number, number] }>;
    }
  }
): { total: number; feedback: string[] } {
  const feedback: string[] = [];
  const scores: number[] = [];

  // Check EQ solution ranges
  if (problem.solution.eq) {
    const eq = problem.solution.eq;
    if (eq.low) {
      const [min, max] = eq.low;
      if (playerEQ.low >= min && playerEQ.low <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Low EQ should be between ${min} and ${max} dB`);
      }
    }
    if (eq.mid) {
      const [min, max] = eq.mid;
      if (playerEQ.mid >= min && playerEQ.mid <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Mid EQ should be between ${min} and ${max} dB`);
      }
    }
    if (eq.high) {
      const [min, max] = eq.high;
      if (playerEQ.high >= min && playerEQ.high <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`High EQ should be between ${min} and ${max} dB`);
      }
    }
  }

  // Check compressor solution ranges
  if (problem.solution.compressor) {
    const comp = problem.solution.compressor;
    if (comp.threshold) {
      const [min, max] = comp.threshold;
      if (playerComp.threshold >= min && playerComp.threshold <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Threshold should be between ${min} and ${max} dB`);
      }
    }
    if (comp.amount) {
      const [min, max] = comp.amount;
      if (playerComp.amount >= min && playerComp.amount <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Compression amount should be between ${min}% and ${max}%`);
      }
    }
  }

  const total = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return { total, feedback };
}

/**
 * Generate feedback based on EQ scores
 */
function generateEQFeedback(
  scores: { low: number; mid: number; high: number },
  player: EQParams,
  target: { low: number; mid: number; high: number }
): string[] {
  const feedback: string[] = [];

  if (scores.low < 70) {
    const direction = player.low < target.low ? 'boost' : 'cut';
    feedback.push(`Try to ${direction} the low frequencies more`);
  }
  if (scores.mid < 70) {
    const direction = player.mid < target.mid ? 'boost' : 'cut';
    feedback.push(`The mids need more ${direction}`);
  }
  if (scores.high < 70) {
    const direction = player.high < target.high ? 'boost' : 'cut';
    feedback.push(`Adjust the highs - ${direction} a bit more`);
  }

  if (feedback.length === 0 && scores.low >= 70 && scores.mid >= 70 && scores.high >= 70) {
    feedback.push('Good EQ balance!');
  }

  return feedback;
}

/**
 * Generate feedback based on compressor scores
 */
function generateCompressorFeedback(
  scores: { threshold: number; amount: number; attack?: number; release?: number },
  player: CompressorFullParams,
  target: { threshold: number; amount: number; attack?: number; release?: number }
): string[] {
  const feedback: string[] = [];

  if (scores.threshold < 70) {
    const direction = player.threshold < target.threshold ? 'raise' : 'lower';
    feedback.push(`${direction} the threshold`);
  }
  if (scores.amount < 70) {
    const direction = player.amount < target.amount ? 'increase' : 'decrease';
    feedback.push(`${direction} the compression amount`);
  }
  if (scores.attack !== undefined && scores.attack < 70) {
    const direction = player.attack < target.attack! ? 'slower' : 'faster';
    feedback.push(`Try a ${direction} attack`);
  }
  if (scores.release !== undefined && scores.release < 70) {
    const direction = player.release < target.release! ? 'slower' : 'faster';
    feedback.push(`Adjust for a ${direction} release`);
  }

  if (feedback.length === 0) {
    feedback.push('Compression settings look good!');
  }

  return feedback;
}

/**
 * Calculate stars from overall score
 */
function calculateStars(score: number): 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

/**
 * Evaluate multi-track EQ challenge
 */
function evaluateMultiTrackEQ(
  playerTracks: Record<string, EQParams>,
  target: MultiTrackEQTarget,
  playerBusComp?: CompressorFullParams
): { trackScores: Record<string, { low: number; mid: number; high: number; total: number }>; busScore?: number; total: number; feedback: string[] } {
  const trackScores: Record<string, { low: number; mid: number; high: number; total: number }> = {};
  const feedback: string[] = [];
  const scores: number[] = [];

  // Evaluate each track's EQ
  for (const [trackId, targetEQ] of Object.entries(target.tracks)) {
    const playerEQ = playerTracks[trackId] || { low: 0, mid: 0, high: 0 };
    const eqScore = evaluateEQ(playerEQ, targetEQ);
    trackScores[trackId] = eqScore;
    scores.push(eqScore.total);

    // Generate per-track feedback
    if (eqScore.total < 70) {
      const hints: string[] = [];
      if (eqScore.low < 70) {
        hints.push(playerEQ.low < targetEQ.low ? 'boost lows' : 'cut lows');
      }
      if (eqScore.mid < 70) {
        hints.push(playerEQ.mid < targetEQ.mid ? 'boost mids' : 'cut mids');
      }
      if (eqScore.high < 70) {
        hints.push(playerEQ.high < targetEQ.high ? 'boost highs' : 'cut highs');
      }
      feedback.push(`${trackId}: try to ${hints.join(', ')}`);
    }
  }

  // Evaluate bus compressor if specified
  let busScore: number | undefined;
  if (target.busCompressor && playerBusComp) {
    const compResult = evaluateCompressor(playerBusComp, target.busCompressor);
    busScore = compResult.total;
    scores.push(busScore);
  }

  const total = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  if (total >= 80) {
    feedback.unshift('Good frequency separation!');
  }

  return { trackScores, busScore, total, feedback };
}

/** Extended track params that may include pan, reverb, volume, and compression */
interface TrackParamsWithExtras extends EQParams {
  pan?: number;
  reverbMix?: number;
  volume?: number;
  compressorAmount?: number;
}

/**
 * Check a multi-track condition
 */
function checkMultiTrackCondition(
  condition: MultiTrackCondition,
  playerTracks: Record<string, TrackParamsWithExtras>
): boolean {
  switch (condition.type) {
    case 'frequency_separation': {
      // Check that two tracks don't both boost the same band
      const track1 = playerTracks[condition.track1];
      const track2 = playerTracks[condition.track2];
      if (!track1 || !track2) return false;
      const band = condition.band;
      // At least one should cut or both should be neutral
      return track1[band] <= 0 || track2[band] <= 0;
    }

    case 'relative_level': {
      // Check that one track is louder than another in a specific band
      const louder = playerTracks[condition.louder];
      const quieter = playerTracks[condition.quieter];
      if (!louder || !quieter) return false;
      return louder[condition.band] > quieter[condition.band];
    }

    case 'eq_cut': {
      // Check that a track cuts a band by at least minCut
      const track = playerTracks[condition.track];
      if (!track) return false;
      return track[condition.band] <= -condition.minCut;
    }

    case 'eq_boost': {
      // Check that a track boosts a band by at least minBoost
      const track = playerTracks[condition.track];
      if (!track) return false;
      return track[condition.band] >= condition.minBoost;
    }

    case 'balance': {
      // Generic balance check - always passes (relies on other conditions)
      return true;
    }

    case 'pan_position': {
      // Check that a track is panned to a specific position
      const track = playerTracks[condition.track];
      if (!track || track.pan === undefined) return false;
      const pan = track.pan;
      switch (condition.position) {
        case 'left': return pan <= -0.3;
        case 'right': return pan >= 0.3;
        case 'center': return pan >= -0.2 && pan <= 0.2;
        default: return false;
      }
    }

    case 'pan_spread': {
      // Check that two tracks are spread apart in the stereo field
      const track1 = playerTracks[condition.track1];
      const track2 = playerTracks[condition.track2];
      if (!track1 || !track2 || track1.pan === undefined || track2.pan === undefined) return false;
      const spread = Math.abs(track1.pan - track2.pan);
      return spread >= condition.minSpread;
    }

    case 'pan_opposite': {
      // Check that two tracks are panned to opposite sides
      const track1 = playerTracks[condition.track1];
      const track2 = playerTracks[condition.track2];
      if (!track1 || !track2 || track1.pan === undefined || track2.pan === undefined) return false;
      // One should be left, one should be right (or at least opposite-ish)
      return (track1.pan < -0.2 && track2.pan > 0.2) || (track1.pan > 0.2 && track2.pan < -0.2);
    }

    case 'reverb_amount': {
      // Check that a track has reverb within a range
      const track = playerTracks[condition.track];
      if (!track || track.reverbMix === undefined) return false;
      const meetsMin = track.reverbMix >= condition.minMix;
      const meetsMax = condition.maxMix === undefined || track.reverbMix <= condition.maxMix;
      return meetsMin && meetsMax;
    }

    case 'reverb_contrast': {
      // Check that there's a reverb difference between dry and wet tracks
      const dryTrack = playerTracks[condition.dryTrack];
      const wetTrack = playerTracks[condition.wetTrack];
      if (!dryTrack || !wetTrack || dryTrack.reverbMix === undefined || wetTrack.reverbMix === undefined) return false;
      const difference = wetTrack.reverbMix - dryTrack.reverbMix;
      return difference >= condition.minDifference;
    }

    case 'depth_placement': {
      // Check that a track is at the right depth (front = dry, back = wet)
      const track = playerTracks[condition.track];
      if (!track || track.reverbMix === undefined) return false;
      switch (condition.depth) {
        case 'front': return track.reverbMix <= 20;
        case 'middle': return track.reverbMix >= 20 && track.reverbMix <= 50;
        case 'back': return track.reverbMix >= 40;
        default: return false;
      }
    }

    case 'volume_louder': {
      // Check that track1 is louder than track2
      const track1 = playerTracks[condition.track1];
      const track2 = playerTracks[condition.track2];
      if (!track1 || !track2 || track1.volume === undefined || track2.volume === undefined) return false;
      return track1.volume > track2.volume;
    }

    case 'volume_range': {
      // Check that a track's volume is within a range
      const track = playerTracks[condition.track];
      if (!track || track.volume === undefined) return false;
      return track.volume >= condition.minDb && track.volume <= condition.maxDb;
    }

    case 'volume_balanced': {
      // Check that two tracks are balanced within a tolerance
      const track1 = playerTracks[condition.track1];
      const track2 = playerTracks[condition.track2];
      if (!track1 || !track2 || track1.volume === undefined || track2.volume === undefined) return false;
      const diff = Math.abs(track1.volume - track2.volume);
      return diff <= condition.tolerance;
    }

    case 'track_compression': {
      // Check that a track has compression within a range
      const track = playerTracks[condition.track];
      if (!track || track.compressorAmount === undefined) return false;
      const meetsMin = track.compressorAmount >= condition.minAmount;
      const meetsMax = condition.maxAmount === undefined || track.compressorAmount <= condition.maxAmount;
      return meetsMin && meetsMax;
    }

    case 'compression_contrast': {
      // Check that one track is more compressed than another
      const more = playerTracks[condition.moreCompressed];
      const less = playerTracks[condition.lessCompressed];
      if (!more || !less || more.compressorAmount === undefined || less.compressorAmount === undefined) return false;
      return more.compressorAmount - less.compressorAmount >= condition.minDifference;
    }

    // Bus-level conditions are handled separately in checkBusCondition
    case 'bus_compression':
    case 'bus_eq_boost':
    case 'bus_eq_cut':
      return false; // Handled separately

    default:
      return false;
  }
}

/** Bus parameters for condition checking */
interface BusParams {
  compressor?: { amount: number };
  eq?: { low: number; mid: number; high: number };
}

/**
 * Check a bus-level condition
 */
function checkBusCondition(
  condition: MultiTrackCondition,
  busParams: BusParams
): boolean {
  switch (condition.type) {
    case 'bus_compression': {
      if (!busParams.compressor) return false;
      const meetsMin = busParams.compressor.amount >= condition.minAmount;
      const meetsMax = condition.maxAmount === undefined || busParams.compressor.amount <= condition.maxAmount;
      return meetsMin && meetsMax;
    }

    case 'bus_eq_boost': {
      if (!busParams.eq) return false;
      return busParams.eq[condition.band] >= condition.minBoost;
    }

    case 'bus_eq_cut': {
      if (!busParams.eq) return false;
      return busParams.eq[condition.band] <= -condition.minCut;
    }

    default:
      return false;
  }
}

/**
 * Describe a multi-track condition for feedback
 */
function describeCondition(condition: MultiTrackCondition): string {
  switch (condition.type) {
    case 'frequency_separation':
      return `${condition.track1} and ${condition.track2} separated in ${condition.band}s`;
    case 'relative_level':
      return `${condition.louder} louder than ${condition.quieter} in ${condition.band}s`;
    case 'eq_cut':
      return `${condition.track} ${condition.band}s cut by ${condition.minCut}+ dB`;
    case 'eq_boost':
      return `${condition.track} ${condition.band}s boosted by ${condition.minBoost}+ dB`;
    case 'balance':
      return condition.description;
    case 'pan_position':
      return `${condition.track} panned ${condition.position}`;
    case 'pan_spread':
      return `${condition.track1} and ${condition.track2} spread across stereo field`;
    case 'pan_opposite':
      return `${condition.track1} and ${condition.track2} panned to opposite sides`;
    case 'reverb_amount':
      return `${condition.track} reverb at ${condition.minMix}%${condition.maxMix ? ` to ${condition.maxMix}%` : '+'}`;
    case 'reverb_contrast':
      return `${condition.wetTrack} wetter than ${condition.dryTrack}`;
    case 'depth_placement':
      return `${condition.track} placed ${condition.depth} in the mix`;
    case 'volume_louder':
      return `${condition.track1} louder than ${condition.track2}`;
    case 'volume_range':
      return `${condition.track} volume between ${condition.minDb} and ${condition.maxDb} dB`;
    case 'volume_balanced':
      return `${condition.track1} and ${condition.track2} balanced within ${condition.tolerance} dB`;
    // Per-track compression conditions
    case 'track_compression':
      return `${condition.track} compression at ${condition.minAmount}%${condition.maxAmount !== undefined ? ` to ${condition.maxAmount}%` : '+'}`;
    case 'compression_contrast':
      return `${condition.moreCompressed} more compressed than ${condition.lessCompressed}`;
    // Bus-level conditions
    case 'bus_compression':
      return `Bus compression at ${condition.minAmount}%+`;
    case 'bus_eq_boost':
      return `Bus ${condition.band}s boosted by ${condition.minBoost}+ dB`;
    case 'bus_eq_cut':
      return `Bus ${condition.band}s cut by ${condition.minCut}+ dB`;
    default:
      return 'Unknown condition';
  }
}

/**
 * Evaluate multi-track goal-based challenge
 */
function evaluateMultiTrackGoal(
  playerTracks: Record<string, TrackParamsWithExtras>,
  target: MultiTrackGoalTarget,
  busParams?: BusParams
): { conditionResults: { description: string; passed: boolean }[]; total: number; feedback: string[] } {
  const conditionResults: { description: string; passed: boolean }[] = [];
  const feedback: string[] = [];

  for (const condition of target.conditions) {
    let passed: boolean;

    // Check if this is a bus-level condition
    if (condition.type === 'bus_compression' || condition.type === 'bus_eq_boost' || condition.type === 'bus_eq_cut') {
      passed = busParams ? checkBusCondition(condition, busParams) : false;
    } else {
      passed = checkMultiTrackCondition(condition, playerTracks);
    }

    conditionResults.push({
      description: describeCondition(condition),
      passed,
    });

    if (!passed) {
      feedback.push(`Not met: ${describeCondition(condition)}`);
    }
  }

  const passedCount = conditionResults.filter((c) => c.passed).length;
  const total = conditionResults.length > 0
    ? Math.round((passedCount / conditionResults.length) * 100)
    : 0;

  if (total >= 90) {
    feedback.unshift('Excellent balance!');
  } else if (total >= 70) {
    feedback.unshift('Good progress!');
  }

  return { conditionResults, total, feedback };
}

/**
 * Convert parametric EQ settings to approximate 3-band (low/mid/high) gains.
 *
 * Uses the 3-band crossover frequencies as measurement points:
 *   low = response at 200Hz (center of low band)
 *   mid = response at 1000Hz (center of mid band)
 *   high = response at 5000Hz (center of high band)
 *
 * Each parametric band contributes to each measurement point based on
 * the distance in octaves between the band's center frequency and
 * the measurement point, weighted by the band's Q (wider Q = wider influence).
 */
export function parametricToEffective3Band(params: ParametricEQParams): EQParams {
  const measurePoints = [200, 1000, 5000]; // Hz: low, mid, high centers

  const gains = measurePoints.map((measureFreq) => {
    let totalGain = 0;

    for (const band of params.bands) {
      if (band.gain === 0) continue;

      // Distance in octaves between band center and measurement point
      const octaveDist = Math.abs(Math.log2(measureFreq / band.frequency));

      // Bandwidth in octaves determined by Q (lower Q = wider bandwidth)
      // For peaking filters, BW ≈ 1/Q octaves (simplified)
      // For shelves, influence extends from the shelf frequency outward
      let influence: number;

      if (band.type === 'lowshelf') {
        // Low shelf: full influence below frequency, decaying above
        influence = measureFreq <= band.frequency ? 1 : Math.max(0, 1 - octaveDist * 0.5);
      } else if (band.type === 'highshelf') {
        // High shelf: full influence above frequency, decaying below
        influence = measureFreq >= band.frequency ? 1 : Math.max(0, 1 - octaveDist * 0.5);
      } else {
        // Peaking: bell curve with width determined by Q
        const bandwidth = 1 / band.Q;
        influence = Math.max(0, 1 - octaveDist / bandwidth);
      }

      totalGain += band.gain * influence;
    }

    // Clamp to EQ range
    return Math.max(-12, Math.min(12, Math.round(totalGain * 10) / 10));
  });

  return {
    low: gains[0]!,
    mid: gains[1]!,
    high: gains[2]!,
  };
}

/**
 * Main evaluation function for mixing challenges
 */
export function evaluateMixingChallenge(
  challenge: MixingChallenge,
  playerEQ: EQParams,
  playerCompressor: CompressorFullParams,
  playerTrackEQs?: Record<string, EQParams>,
  playerBusEQ?: EQParams
): MixingScoreResult {
  const target = challenge.target;
  const feedback: string[] = [];
  let overall = 0;

  const breakdown: MixingScoreResult['breakdown'] = {};

  if (target.type === 'eq') {
    // EQ matching challenge
    const eqScores = evaluateEQ(playerEQ, target);
    breakdown.eq = eqScores;
    overall = eqScores.total;
    feedback.push(...generateEQFeedback(eqScores, playerEQ, target));
  } else if (target.type === 'compressor') {
    // Compressor matching challenge
    const includeTimings = target.attack !== undefined && target.release !== undefined;
    const compScores = evaluateCompressor(playerCompressor, target, includeTimings);
    breakdown.compressor = compScores;
    overall = compScores.total;
    feedback.push(...generateCompressorFeedback(compScores, playerCompressor, target));
  } else if (target.type === 'problem') {
    // Problem-solving challenge
    const problemResult = evaluateProblem(playerEQ, playerCompressor, target);
    overall = problemResult.total;
    if (problemResult.feedback.length > 0) {
      feedback.push(...problemResult.feedback);
    } else {
      feedback.push('Problem solved correctly!');
    }
  } else if (target.type === 'multitrack-eq' && playerTrackEQs) {
    // Multi-track EQ challenge (I1+)
    const mtResult = evaluateMultiTrackEQ(playerTrackEQs, target, playerCompressor);
    breakdown.tracks = mtResult.trackScores;
    if (mtResult.busScore !== undefined) {
      breakdown.busCompressor = mtResult.busScore;
    }
    overall = mtResult.total;
    feedback.push(...mtResult.feedback);
  } else if (target.type === 'multitrack-goal' && playerTrackEQs) {
    // Multi-track goal-based challenge
    const busParams: BusParams = {
      compressor: { amount: playerCompressor.amount },
      eq: playerBusEQ,
    };
    const goalResult = evaluateMultiTrackGoal(playerTrackEQs, target, busParams);
    breakdown.conditions = goalResult.conditionResults;
    overall = goalResult.total;
    feedback.push(...goalResult.feedback);
  }

  const stars = calculateStars(overall);
  const passed = overall >= 60; // 60% to pass

  return {
    overall,
    stars,
    passed,
    breakdown,
    feedback,
  };
}
