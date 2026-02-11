/**
 * AI Feedback Router
 * Generates natural language feedback for challenge attempts
 */

import { z } from 'zod/v4';
import Anthropic from '@anthropic-ai/sdk';
import { router, publicProcedure } from '../trpc.ts';

// ============================================
// Shared Schemas
// ============================================

/**
 * Zod schemas matching our core types
 */
const ScoreBreakdownItemSchema = z.object({
  score: z.number(),
  feedback: z.string(),
});

const ScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  breakdown: z.object({
    brightness: ScoreBreakdownItemSchema,
    attack: ScoreBreakdownItemSchema,
    filter: ScoreBreakdownItemSchema,
    envelope: ScoreBreakdownItemSchema,
  }),
  passed: z.boolean(),
});

const EffectsParamsSchema = z.object({
  distortion: z.object({
    amount: z.number(),
    mix: z.number(),
  }),
  delay: z.object({
    time: z.number(),
    feedback: z.number(),
    mix: z.number(),
  }),
  reverb: z.object({
    decay: z.number(),
    mix: z.number(),
  }),
  chorus: z.object({
    rate: z.number(),
    depth: z.number(),
    mix: z.number(),
  }),
});

const SynthParamsSchema = z.object({
  oscillator: z.object({
    type: z.enum(['sine', 'square', 'sawtooth', 'triangle']),
    octave: z.number(),
    detune: z.number(),
  }),
  filter: z.object({
    type: z.enum(['lowpass', 'highpass', 'bandpass']),
    cutoff: z.number(),
    resonance: z.number(),
  }),
  filterEnvelope: z.object({
    attack: z.number(),
    decay: z.number(),
    sustain: z.number(),
    release: z.number(),
    amount: z.number(),
  }),
  amplitudeEnvelope: z.object({
    attack: z.number(),
    decay: z.number(),
    sustain: z.number(),
    release: z.number(),
  }),
  lfo: z.object({
    rate: z.number(),
    depth: z.number(),
    waveform: z.enum(['sine', 'square', 'sawtooth', 'triangle']),
  }),
  effects: EffectsParamsSchema,
  volume: z.number(),
});

const ChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
});

const FeedbackInputSchema = z.object({
  result: ScoreResultSchema,
  playerParams: SynthParamsSchema,
  targetParams: SynthParamsSchema,
  challenge: ChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

/**
 * Build the prompt for Claude
 */
function buildFeedbackPrompt(input: z.infer<typeof FeedbackInputSchema>): string {
  const { result, playerParams, targetParams, challenge, attemptNumber } = input;

  const paramComparison = `
Player's settings:
- Oscillator: ${playerParams.oscillator.type}, octave ${playerParams.oscillator.octave}
- Filter: ${playerParams.filter.type}, cutoff ${playerParams.filter.cutoff}Hz, resonance ${playerParams.filter.resonance}
- Amp Envelope: A=${playerParams.amplitudeEnvelope.attack}s D=${playerParams.amplitudeEnvelope.decay}s S=${playerParams.amplitudeEnvelope.sustain} R=${playerParams.amplitudeEnvelope.release}s
- LFO: ${playerParams.lfo.waveform} wave, rate ${playerParams.lfo.rate}Hz, depth ${playerParams.lfo.depth}
- Effects: Distortion ${Math.round(playerParams.effects.distortion.mix * 100)}%, Delay ${Math.round(playerParams.effects.delay.mix * 100)}%, Reverb ${Math.round(playerParams.effects.reverb.mix * 100)}%, Chorus ${Math.round(playerParams.effects.chorus.mix * 100)}%

Target settings:
- Oscillator: ${targetParams.oscillator.type}, octave ${targetParams.oscillator.octave}
- Filter: ${targetParams.filter.type}, cutoff ${targetParams.filter.cutoff}Hz, resonance ${targetParams.filter.resonance}
- Amp Envelope: A=${targetParams.amplitudeEnvelope.attack}s D=${targetParams.amplitudeEnvelope.decay}s S=${targetParams.amplitudeEnvelope.sustain} R=${targetParams.amplitudeEnvelope.release}s
- LFO: ${targetParams.lfo.waveform} wave, rate ${targetParams.lfo.rate}Hz, depth ${targetParams.lfo.depth}
- Effects: Distortion ${Math.round(targetParams.effects.distortion.mix * 100)}%, Delay ${Math.round(targetParams.effects.delay.mix * 100)}%, Reverb ${Math.round(targetParams.effects.reverb.mix * 100)}%, Chorus ${Math.round(targetParams.effects.chorus.mix * 100)}%`;

  return `You are a friendly synthesizer mentor helping someone learn sound design. A student just attempted a "recreate this sound" challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

Score breakdown:
- Brightness: ${result.breakdown.brightness.score}% - ${result.breakdown.brightness.feedback}
- Attack: ${result.breakdown.attack.score}% - ${result.breakdown.attack.feedback}
- Filter: ${result.breakdown.filter.score}% - ${result.breakdown.filter.feedback}
- Envelope: ${result.breakdown.envelope.score}% - ${result.breakdown.envelope.feedback}

${paramComparison}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (if anything scored above 70%)
2. The ONE most important thing to change to improve their score
3. A specific, actionable tip (e.g., "try lowering the filter cutoff to around 500Hz")

Be warm and encouraging. Use plain language, not technical jargon. If they passed, congratulate them and mention what made it work.`;
}

// ============================================
// Mixing Feedback Schemas
// ============================================

const MixingConditionResultSchema = z.object({
  description: z.string(),
  passed: z.boolean(),
});

const MixingScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    eq: z.object({
      low: z.number(),
      mid: z.number(),
      high: z.number(),
      total: z.number(),
    }).optional(),
    compressor: z.object({
      threshold: z.number(),
      amount: z.number(),
      attack: z.number().optional(),
      release: z.number().optional(),
      total: z.number(),
    }).optional(),
    tracks: z.record(z.string(), z.object({
      low: z.number(),
      mid: z.number(),
      high: z.number(),
      total: z.number(),
    })).optional(),
    busCompressor: z.number().optional(),
    conditions: z.array(MixingConditionResultSchema).optional(),
  }),
  feedback: z.array(z.string()),
});

const TrackParamsSchema = z.record(z.string(), z.object({
  low: z.number(),
  mid: z.number(),
  high: z.number(),
  volume: z.number(),
  pan: z.number(),
  reverbMix: z.number().optional(),
  compressorThreshold: z.number().optional(),
  compressorAmount: z.number().optional(),
}));

const MixingChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
  trackNames: z.array(z.string()),
});

const MixingFeedbackInputSchema = z.object({
  result: MixingScoreResultSchema,
  trackParams: TrackParamsSchema,
  busCompressor: z.object({
    threshold: z.number(),
    amount: z.number(),
  }).optional(),
  busEQ: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
  }).optional(),
  challenge: MixingChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Build prompt for mixing feedback
 */
function buildMixingFeedbackPrompt(input: z.infer<typeof MixingFeedbackInputSchema>): string {
  const { result, trackParams, busCompressor, busEQ, challenge, attemptNumber } = input;

  // Build track settings summary
  const trackSummary = Object.entries(trackParams)
    .map(([id, params]) => {
      const panLabel = params.pan === 0 ? 'C' : params.pan < 0 ? `L${Math.abs(params.pan * 100).toFixed(0)}` : `R${(params.pan * 100).toFixed(0)}`;
      const compStr = params.compressorAmount && params.compressorAmount > 0 ? `, Comp ${params.compressorThreshold ?? 0}dB/${params.compressorAmount}%` : '';
      return `- ${id}: Vol ${params.volume > 0 ? '+' : ''}${params.volume.toFixed(1)}dB, Pan ${panLabel}, EQ L${params.low > 0 ? '+' : ''}${params.low}/M${params.mid > 0 ? '+' : ''}${params.mid}/H${params.high > 0 ? '+' : ''}${params.high}${params.reverbMix !== undefined ? `, Reverb ${params.reverbMix}%` : ''}${compStr}`;
    })
    .join('\n');

  // Build conditions summary
  const conditionsSummary = result.breakdown.conditions
    ? result.breakdown.conditions
        .map((c) => `- ${c.passed ? '✓' : '✗'} ${c.description}`)
        .join('\n')
    : 'No specific conditions';

  // Bus processing summary
  const busSummary = [];
  if (busCompressor) {
    busSummary.push(`Bus Compressor: Threshold ${busCompressor.threshold}dB, Amount ${busCompressor.amount}%`);
  }
  if (busEQ) {
    busSummary.push(`Bus EQ: Low ${busEQ.low > 0 ? '+' : ''}${busEQ.low}, Mid ${busEQ.mid > 0 ? '+' : ''}${busEQ.mid}, High ${busEQ.high > 0 ? '+' : ''}${busEQ.high}`);
  }

  return `You are a friendly mixing engineer mentor helping someone learn audio mixing. A student just attempted a mixing challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Tracks: ${challenge.trackNames.join(', ')}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

Current mix settings:
${trackSummary}
${busSummary.length > 0 ? '\n' + busSummary.join('\n') : ''}

Conditions checked:
${conditionsSummary}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (any conditions that passed)
2. The ONE most important thing to fix to improve their mix
3. A specific, actionable tip using mixing terminology (e.g., "try cutting 2-3dB from the bass lows to make room for the kick")

Be warm and encouraging. Explain the "why" behind mixing decisions. If they passed, congratulate them and explain what made the mix work.`;
}

// ============================================
// Production Feedback Schemas
// ============================================

const ProductionConditionResultSchema = z.object({
  description: z.string(),
  passed: z.boolean(),
});

const ProductionLayerScoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
});

const ProductionScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    type: z.enum(['reference', 'goal']),
    layerScores: z.array(ProductionLayerScoreSchema).optional(),
    conditionResults: z.array(ProductionConditionResultSchema).optional(),
  }),
  feedback: z.array(z.string()),
});

const LayerStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  volume: z.number(),
  pan: z.number(),
  muted: z.boolean(),
  eqLow: z.number(),
  eqHigh: z.number(),
});

const ProductionChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
  targetType: z.enum(['reference', 'goal']),
  targetDescription: z.string().optional(),
});

const ProductionFeedbackInputSchema = z.object({
  result: ProductionScoreResultSchema,
  layerStates: z.array(LayerStateSchema),
  challenge: ProductionChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Build prompt for production feedback
 */
function buildProductionFeedbackPrompt(input: z.infer<typeof ProductionFeedbackInputSchema>): string {
  const { result, layerStates, challenge, attemptNumber } = input;

  // Build layer settings summary
  const layerSummary = layerStates
    .map((layer) => {
      const panLabel = layer.pan === 0 ? 'C' : layer.pan < 0 ? `L${Math.abs(layer.pan * 100).toFixed(0)}` : `R${(layer.pan * 100).toFixed(0)}`;
      const status = layer.muted ? ' [MUTED]' : '';
      return `- ${layer.name}: Vol ${layer.volume > 0 ? '+' : ''}${layer.volume.toFixed(1)}dB, Pan ${panLabel}, EQ Low ${layer.eqLow > 0 ? '+' : ''}${layer.eqLow} / High ${layer.eqHigh > 0 ? '+' : ''}${layer.eqHigh}${status}`;
    })
    .join('\n');

  // Build breakdown summary
  let breakdownSummary = '';
  if (result.breakdown.type === 'reference' && result.breakdown.layerScores) {
    breakdownSummary = result.breakdown.layerScores
      .map((ls) => `- ${ls.name}: ${ls.score.toFixed(0)}%`)
      .join('\n');
  } else if (result.breakdown.conditionResults) {
    breakdownSummary = result.breakdown.conditionResults
      .map((c) => `- ${c.passed ? '✓' : '✗'} ${c.description}`)
      .join('\n');
  }

  const challengeType = challenge.targetType === 'reference'
    ? 'match a reference mix'
    : 'meet production goals';

  return `You are a friendly music producer mentor helping someone learn production. A student just attempted a production challenge where they need to ${challengeType}.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
${challenge.targetDescription ? `Goal: ${challenge.targetDescription}` : ''}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

Current layer settings:
${layerSummary}

${result.breakdown.type === 'reference' ? 'Layer accuracy:' : 'Goals checked:'}
${breakdownSummary}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (good balance choices, correct layer handling)
2. The ONE most important thing to fix to improve
3. A specific, actionable tip about layering, arrangement, or frequency balance

Be warm and encouraging. Explain how different elements work together in a production. If they passed, congratulate them and highlight what made the production work.`;
}

// ============================================
// Sampling Feedback Schemas
// ============================================

const SamplingScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    type: z.string(),
    pitchScore: z.number().optional(),
    sliceScore: z.number().optional(),
    timingScore: z.number().optional(),
    creativityScore: z.number().optional(),
  }),
  feedback: z.array(z.string()),
});

const SamplerParamsSchema = z.object({
  pitch: z.number(),
  timeStretch: z.number(),
  volume: z.number(),
  startPoint: z.number(),
  endPoint: z.number(),
  fadeIn: z.number(),
  fadeOut: z.number(),
  sliceCount: z.number(),
});

const SamplingChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
  challengeType: z.string(),
});

const SamplingFeedbackInputSchema = z.object({
  result: SamplingScoreResultSchema,
  playerParams: SamplerParamsSchema,
  challenge: SamplingChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Build prompt for sampling feedback
 */
function buildSamplingFeedbackPrompt(input: z.infer<typeof SamplingFeedbackInputSchema>): string {
  const { result, playerParams, challenge, attemptNumber } = input;

  const paramsSummary = `
Current sample settings:
- Pitch: ${playerParams.pitch > 0 ? '+' : ''}${playerParams.pitch} semitones
- Time Stretch: ${(playerParams.timeStretch * 100).toFixed(0)}%
- Volume: ${playerParams.volume > 0 ? '+' : ''}${playerParams.volume.toFixed(1)}dB
- Start/End: ${(playerParams.startPoint * 100).toFixed(0)}% - ${(playerParams.endPoint * 100).toFixed(0)}%
- Fade In/Out: ${(playerParams.fadeIn * 1000).toFixed(0)}ms / ${(playerParams.fadeOut * 1000).toFixed(0)}ms
- Slices: ${playerParams.sliceCount}`;

  const breakdownSummary = [];
  if (result.breakdown.pitchScore !== undefined) {
    breakdownSummary.push(`- Pitch: ${result.breakdown.pitchScore.toFixed(0)}%`);
  }
  if (result.breakdown.sliceScore !== undefined) {
    breakdownSummary.push(`- Slicing: ${result.breakdown.sliceScore.toFixed(0)}%`);
  }
  if (result.breakdown.timingScore !== undefined) {
    breakdownSummary.push(`- Timing: ${result.breakdown.timingScore.toFixed(0)}%`);
  }

  return `You are a friendly sampling mentor helping someone learn sample-based music production. A student just attempted a sampling challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Type: ${challenge.challengeType}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

${paramsSummary}

Score breakdown:
${breakdownSummary.join('\n')}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (any aspect scoring above 70%)
2. The ONE most important thing to adjust
3. A specific, actionable tip about sampling technique (pitch shifting, slicing, timing, etc.)

Be warm and encouraging. Explain the creative possibilities of sampling. If they passed, congratulate them and highlight what worked.`;
}

// ============================================
// Drum Sequencing Feedback Schemas
// ============================================

const DrumSequencingScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    patternScore: z.number().optional(),
    velocityScore: z.number().optional(),
    swingScore: z.number().optional(),
    tempoScore: z.number().optional(),
  }),
  feedback: z.array(z.string()),
});

const DrumPatternSummarySchema = z.object({
  tempo: z.number(),
  swing: z.number(),
  trackCount: z.number(),
  activeSteps: z.number(),
  totalSteps: z.number(),
});

const DrumSequencingChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
  challengeType: z.string(),
  evaluationFocus: z.array(z.string()),
});

const DrumSequencingFeedbackInputSchema = z.object({
  result: DrumSequencingScoreResultSchema,
  patternSummary: DrumPatternSummarySchema,
  challenge: DrumSequencingChallengeInfoSchema,
  attemptNumber: z.number(),
});

// ============================================
// FM Synthesis Feedback Schemas
// ============================================

const FMScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    harmonicity: z.number(),
    modulationIndex: z.number(),
    carrierType: z.number(),
    modulatorType: z.number(),
    envelope: z.number(),
  }),
});

const FMSynthParamsSchema = z.object({
  harmonicity: z.number(),
  modulationIndex: z.number(),
  carrierType: z.enum(['sine', 'square', 'sawtooth', 'triangle']),
  modulatorType: z.enum(['sine', 'square', 'sawtooth', 'triangle']),
  amplitudeEnvelope: z.object({
    attack: z.number(),
    decay: z.number(),
    sustain: z.number(),
    release: z.number(),
  }),
  modulationEnvelopeAmount: z.number(),
  effects: EffectsParamsSchema,
  volume: z.number(),
});

const FMChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
});

const FMFeedbackInputSchema = z.object({
  result: FMScoreResultSchema,
  playerParams: FMSynthParamsSchema,
  targetParams: FMSynthParamsSchema,
  challenge: FMChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Build prompt for FM synthesis feedback
 */
function buildFMSynthesisFeedbackPrompt(input: z.infer<typeof FMFeedbackInputSchema>): string {
  const { result, playerParams, targetParams, challenge, attemptNumber } = input;

  const paramComparison = `
Player's FM settings:
- Harmonicity: ${playerParams.harmonicity.toFixed(1)} (carrier:modulator frequency ratio)
- Modulation Index: ${playerParams.modulationIndex.toFixed(1)} (depth of FM)
- Carrier: ${playerParams.carrierType} wave
- Modulator: ${playerParams.modulatorType} wave
- Amp Envelope: A=${playerParams.amplitudeEnvelope.attack}s D=${playerParams.amplitudeEnvelope.decay}s S=${playerParams.amplitudeEnvelope.sustain} R=${playerParams.amplitudeEnvelope.release}s
- Mod Envelope Amount: ${(playerParams.modulationEnvelopeAmount * 100).toFixed(0)}%

Target FM settings:
- Harmonicity: ${targetParams.harmonicity.toFixed(1)}
- Modulation Index: ${targetParams.modulationIndex.toFixed(1)}
- Carrier: ${targetParams.carrierType} wave
- Modulator: ${targetParams.modulatorType} wave
- Amp Envelope: A=${targetParams.amplitudeEnvelope.attack}s D=${targetParams.amplitudeEnvelope.decay}s S=${targetParams.amplitudeEnvelope.sustain} R=${targetParams.amplitudeEnvelope.release}s
- Mod Envelope Amount: ${(targetParams.modulationEnvelopeAmount * 100).toFixed(0)}%`;

  return `You are a friendly FM synthesis mentor helping someone learn frequency modulation synthesis. A student just attempted an FM sound design challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

Score breakdown:
- Harmonicity (frequency ratio): ${result.breakdown.harmonicity.toFixed(0)}%
- Modulation Index (FM depth): ${result.breakdown.modulationIndex.toFixed(0)}%
- Carrier waveform: ${result.breakdown.carrierType.toFixed(0)}%
- Modulator waveform: ${result.breakdown.modulatorType.toFixed(0)}%
- Envelope shape: ${result.breakdown.envelope.toFixed(0)}%

${paramComparison}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (any aspect scoring above 70%)
2. The ONE most important FM parameter to adjust
3. A specific, actionable tip that explains the FM concept (e.g., "try increasing the modulation index to add more harmonic sidebands" or "non-integer harmonicity creates bell-like inharmonic tones")

Be warm and encouraging. Explain FM concepts in accessible terms - how changing harmonicity or modulation index affects the sound. If they passed, congratulate them and explain what made the FM sound work.`;
}

// ============================================
// Additive Synthesis Feedback Schemas
// ============================================

const AdditiveScoreResultSchema = z.object({
  overall: z.number(),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  passed: z.boolean(),
  breakdown: z.object({
    harmonics: z.number(),
    envelope: z.number(),
  }),
});

const AdditiveSynthParamsSchema = z.object({
  harmonics: z.array(z.number()),
  amplitudeEnvelope: z.object({
    attack: z.number(),
    decay: z.number(),
    sustain: z.number(),
    release: z.number(),
  }),
  effects: EffectsParamsSchema,
  volume: z.number(),
});

const AdditiveChallengeInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  module: z.string(),
});

const AdditiveFeedbackInputSchema = z.object({
  result: AdditiveScoreResultSchema,
  playerParams: AdditiveSynthParamsSchema,
  targetParams: AdditiveSynthParamsSchema,
  challenge: AdditiveChallengeInfoSchema,
  attemptNumber: z.number(),
});

/**
 * Format harmonics array for display
 */
function formatHarmonics(harmonics: number[]): string {
  const active = harmonics
    .map((amp, i) => ({ harmonic: i + 1, amp }))
    .filter(h => h.amp > 0.05)
    .map(h => `H${h.harmonic}: ${(h.amp * 100).toFixed(0)}%`)
    .slice(0, 8); // Show at most 8 active harmonics

  return active.length > 0 ? active.join(', ') : 'None active';
}

/**
 * Build prompt for additive synthesis feedback
 */
function buildAdditiveSynthesisFeedbackPrompt(input: z.infer<typeof AdditiveFeedbackInputSchema>): string {
  const { result, playerParams, targetParams, challenge, attemptNumber } = input;

  const paramComparison = `
Player's additive settings:
- Active harmonics: ${formatHarmonics(playerParams.harmonics)}
- Amp Envelope: A=${playerParams.amplitudeEnvelope.attack}s D=${playerParams.amplitudeEnvelope.decay}s S=${playerParams.amplitudeEnvelope.sustain} R=${playerParams.amplitudeEnvelope.release}s

Target additive settings:
- Active harmonics: ${formatHarmonics(targetParams.harmonics)}
- Amp Envelope: A=${targetParams.amplitudeEnvelope.attack}s D=${targetParams.amplitudeEnvelope.decay}s S=${targetParams.amplitudeEnvelope.sustain} R=${targetParams.amplitudeEnvelope.release}s`;

  return `You are a friendly additive synthesis mentor helping someone learn Fourier synthesis. A student just attempted an additive sound design challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

Score breakdown:
- Harmonic balance: ${result.breakdown.harmonics.toFixed(0)}%
- Envelope shape: ${result.breakdown.envelope.toFixed(0)}%

${paramComparison}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (any aspect scoring above 70%)
2. The ONE most important harmonic adjustment to make
3. A specific, actionable tip that explains the additive concept (e.g., "the fundamental (H1) is too quiet - it provides the pitch foundation" or "odd harmonics (H1, H3, H5) create a hollow square-wave character")

Be warm and encouraging. Explain how harmonics build timbre - the fundamental provides pitch, upper harmonics add brightness/character. If they passed, congratulate them and explain what made the additive sound work.`;
}

/**
 * Build prompt for drum sequencing feedback
 */
function buildDrumSequencingFeedbackPrompt(input: z.infer<typeof DrumSequencingFeedbackInputSchema>): string {
  const { result, patternSummary, challenge, attemptNumber } = input;

  const patternInfo = `
Current pattern:
- Tempo: ${patternSummary.tempo} BPM
- Swing: ${(patternSummary.swing * 100).toFixed(0)}%
- Tracks: ${patternSummary.trackCount}
- Active steps: ${patternSummary.activeSteps} / ${patternSummary.totalSteps}`;

  const breakdownSummary = [];
  if (result.breakdown.patternScore !== undefined) {
    breakdownSummary.push(`- Pattern accuracy: ${result.breakdown.patternScore.toFixed(0)}%`);
  }
  if (result.breakdown.velocityScore !== undefined) {
    breakdownSummary.push(`- Velocity/dynamics: ${result.breakdown.velocityScore.toFixed(0)}%`);
  }
  if (result.breakdown.swingScore !== undefined) {
    breakdownSummary.push(`- Swing/groove: ${result.breakdown.swingScore.toFixed(0)}%`);
  }
  if (result.breakdown.tempoScore !== undefined) {
    breakdownSummary.push(`- Tempo: ${result.breakdown.tempoScore.toFixed(0)}%`);
  }

  return `You are a friendly drum programming mentor helping someone learn beat-making. A student just attempted a drum sequencing challenge.

Challenge: "${challenge.title}"
Description: ${challenge.description}
Module: ${challenge.module}
Type: ${challenge.challengeType}
Focus areas: ${challenge.evaluationFocus.join(', ')}
Attempt #${attemptNumber}

Score: ${result.overall}% (${result.stars} star${result.stars > 1 ? 's' : ''})
${result.passed ? 'PASSED' : 'NOT YET PASSED'}

${patternInfo}

Score breakdown:
${breakdownSummary.join('\n')}

Give brief, encouraging feedback (2-3 sentences max). Focus on:
1. What they did well (any aspect scoring above 70%)
2. The ONE most important thing to fix in their pattern
3. A specific, actionable tip about rhythm, groove, or dynamics (e.g., "try adding ghost notes on the snare for more groove")

Be warm and encouraging. Use rhythm terminology that's accessible. If they passed, congratulate them and explain what made the beat work.`;
}

/**
 * Feedback router
 */
export const feedbackRouter = router({
  /**
   * Generate AI feedback for a sound design challenge attempt
   */
  generate: publicProcedure
    .input(FeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from response
      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for a mixing challenge attempt
   */
  generateMixing: publicProcedure
    .input(MixingFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildMixingFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for a production challenge attempt
   */
  generateProduction: publicProcedure
    .input(ProductionFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildProductionFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for a sampling challenge attempt
   */
  generateSampling: publicProcedure
    .input(SamplingFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildSamplingFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for a drum sequencing challenge attempt
   */
  generateDrumSequencing: publicProcedure
    .input(DrumSequencingFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildDrumSequencingFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for an FM synthesis challenge attempt
   */
  generateFMSynthesis: publicProcedure
    .input(FMFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildFMSynthesisFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),

  /**
   * Generate AI feedback for an additive synthesis challenge attempt
   */
  generateAdditiveSynthesis: publicProcedure
    .input(AdditiveFeedbackInputSchema)
    .mutation(async ({ input }) => {
      const client = getAnthropicClient();
      const prompt = buildAdditiveSynthesisFeedbackPrompt(input);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const feedback = textBlock?.type === 'text' ? textBlock.text : 'Unable to generate feedback.';

      return { feedback };
    }),
});
