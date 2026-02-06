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
  stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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
  stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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
    tracks: z.record(z.object({
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

const TrackParamsSchema = z.record(z.object({
  low: z.number(),
  mid: z.number(),
  high: z.number(),
  volume: z.number(),
  pan: z.number(),
  reverbMix: z.number().optional(),
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
      return `- ${id}: Vol ${params.volume > 0 ? '+' : ''}${params.volume.toFixed(1)}dB, Pan ${panLabel}, EQ L${params.low > 0 ? '+' : ''}${params.low}/M${params.mid > 0 ? '+' : ''}${params.mid}/H${params.high > 0 ? '+' : ''}${params.high}${params.reverbMix !== undefined ? `, Reverb ${params.reverbMix}%` : ''}`;
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
  stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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
});
