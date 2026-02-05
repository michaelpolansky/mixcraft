/**
 * AI Feedback Router
 * Generates natural language feedback for challenge attempts
 */

import { z } from 'zod/v4';
import Anthropic from '@anthropic-ai/sdk';
import { router, publicProcedure } from '../trpc.ts';

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

/**
 * Feedback router
 */
export const feedbackRouter = router({
  /**
   * Generate AI feedback for a challenge attempt
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
});
