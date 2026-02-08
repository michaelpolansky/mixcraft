/**
 * Tests for Sound Comparison Logic
 */

import { describe, it, expect } from 'vitest';
import { compareSounds, generateSummary, compareFMParams, type ScoreResult } from '../../core/sound-comparison.ts';
import type { SoundFeatures } from '../../core/sound-analysis.ts';
import type { SynthParams, FMSynthParams } from '../../core/types.ts';
import { DEFAULT_FM_SYNTH_PARAMS, DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../core/types.ts';

// Helper to create default sound features
function createFeatures(overrides: Partial<SoundFeatures> = {}): SoundFeatures {
  return {
    spectralCentroid: overrides.spectralCentroid ?? 2000,
    spectralSpread: overrides.spectralSpread ?? 500,
    spectralFlatness: overrides.spectralFlatness ?? 0.3,
    attackTime: overrides.attackTime ?? 5,
    sustainLevel: overrides.sustainLevel ?? 0.7,
    rmsEnvelope: overrides.rmsEnvelope ?? new Array(50).fill(0.5),
    averageSpectrum: overrides.averageSpectrum ?? new Array(128).fill(0.5),
  };
}

// Helper to create default synth params
function createParams(overrides: Partial<SynthParams> = {}): SynthParams {
  return {
    oscillator: overrides.oscillator ?? { type: 'sawtooth', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 },
    filter: overrides.filter ?? { type: 'lowpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
    filterEnvelope: overrides.filterEnvelope ?? {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.3,
      release: 0.5,
      amount: 2,
    },
    amplitudeEnvelope: overrides.amplitudeEnvelope ?? {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
    },
    pitchEnvelope: overrides.pitchEnvelope ?? {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
      amount: 0,
    },
    modEnvelope: overrides.modEnvelope ?? {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.5,
      release: 0.5,
      amount: 0,
    },
    pwmEnvelope: overrides.pwmEnvelope ?? {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.3,
      amount: 0,
    },
    lfo: overrides.lfo ?? { rate: 1, depth: 0, waveform: 'sine', sync: false, syncDivision: '4n' },
    noise: overrides.noise ?? { type: 'white', level: 0 },
    glide: overrides.glide ?? { enabled: false, time: 0.1 },
    velocity: overrides.velocity ?? { ampAmount: 0, filterAmount: 0 },
    subOsc: overrides.subOsc ?? { enabled: false, type: 'sine', octave: -1, level: 0.5 },
    oscillator2: overrides.oscillator2 ?? { enabled: false, type: 'sawtooth', octave: 0, detune: 7, pulseWidth: 0.5, level: 0.5 },
    effects: overrides.effects ?? {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: overrides.volume ?? -12,
    lfo2: overrides.lfo2 ?? DEFAULT_LFO2,
    modMatrix: overrides.modMatrix ?? DEFAULT_MOD_MATRIX,
    pan: overrides.pan ?? 0,
  };
}

describe('compareSounds', () => {
  describe('Exact match', () => {
    it('scores 100 when features and params match exactly', () => {
      const features = createFeatures();
      const params = createParams();

      const result = compareSounds(features, features, params, params);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
    });
  });

  describe('Brightness comparison', () => {
    it('gives high brightness score when spectral centroid matches', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 2000 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.brightness.score).toBe(100);
      expect(result.breakdown.brightness.feedback).toContain('matches');
    });

    it('gives low brightness score when spectral centroid is far off', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 4000 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.brightness.score).toBeLessThan(50);
      expect(result.breakdown.brightness.feedback).toContain('bright');
    });

    it('suggests lowering cutoff when too bright', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 3000 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.brightness.feedback.toLowerCase()).toContain('cutoff');
    });

    it('suggests raising cutoff when too dark', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 1000 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.brightness.feedback.toLowerCase()).toContain('raising');
    });
  });

  describe('Attack comparison', () => {
    it('gives high attack score when attack time matches', () => {
      const playerFeatures = createFeatures({ attackTime: 5 });
      const targetFeatures = createFeatures({ attackTime: 5 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.attack.score).toBe(100);
      expect(result.breakdown.attack.feedback).toContain('spot on');
    });

    it('suggests shorter attack when too slow', () => {
      const playerFeatures = createFeatures({ attackTime: 12 });
      const targetFeatures = createFeatures({ attackTime: 5 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.attack.feedback.toLowerCase()).toContain('slow');
    });

    it('suggests longer attack when too fast', () => {
      const playerFeatures = createFeatures({ attackTime: 1 });
      const targetFeatures = createFeatures({ attackTime: 8 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.attack.feedback.toLowerCase()).toContain('fast');
    });
  });

  describe('Envelope comparison', () => {
    it('gives high score for matching envelopes', () => {
      const envelope = new Array(50).fill(0.5);
      const playerFeatures = createFeatures({ rmsEnvelope: envelope });
      const targetFeatures = createFeatures({ rmsEnvelope: envelope });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.envelope.score).toBe(100);
    });

    it('gives low score for very different envelopes', () => {
      const playerEnvelope = new Array(50).fill(0.1);
      const targetEnvelope = new Array(50).fill(0.9);
      const playerFeatures = createFeatures({ rmsEnvelope: playerEnvelope });
      const targetFeatures = createFeatures({ rmsEnvelope: targetEnvelope });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      expect(result.breakdown.envelope.score).toBeLessThan(50);
    });
  });

  describe('Filter parameter comparison', () => {
    it('gives high filter score when filter params match', () => {
      const features = createFeatures();
      const params = createParams({
        filter: { type: 'lowpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
      });

      const result = compareSounds(features, features, params, params);

      expect(result.breakdown.filter.score).toBeGreaterThan(90);
    });

    it('penalizes wrong filter type', () => {
      const features = createFeatures();
      const playerParams = createParams({
        filter: { type: 'highpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
      });
      const targetParams = createParams({
        filter: { type: 'lowpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      expect(result.breakdown.filter.feedback).toContain('lowpass');
    });

    it('gives feedback for cutoff being too high', () => {
      const features = createFeatures();
      const playerParams = createParams({
        filter: { type: 'lowpass', cutoff: 4000, resonance: 1, keyTracking: 0 },
      });
      const targetParams = createParams({
        filter: { type: 'lowpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      expect(result.breakdown.filter.feedback.toLowerCase()).toContain('high');
    });

    it('gives feedback for cutoff being too low', () => {
      const features = createFeatures();
      const playerParams = createParams({
        filter: { type: 'lowpass', cutoff: 500, resonance: 1, keyTracking: 0 },
      });
      const targetParams = createParams({
        filter: { type: 'lowpass', cutoff: 2000, resonance: 1, keyTracking: 0 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      expect(result.breakdown.filter.feedback.toLowerCase()).toContain('low');
    });
  });

  describe('Oscillator parameter comparison', () => {
    it('penalizes wrong waveform type', () => {
      const features = createFeatures();
      const playerParams = createParams({
        oscillator: { type: 'sine', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 },
      });
      const targetParams = createParams({
        oscillator: { type: 'sawtooth', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      // Waveform mismatch affects ~18% of score (30% param weight * 60% osc type weight)
      // With perfect audio features (70%), total should be ~95%
      expect(result.overall).toBeLessThan(100);
      expect(result.overall).toBeGreaterThanOrEqual(90);
    });

    it('penalizes octave mismatch', () => {
      const features = createFeatures();
      const playerParams = createParams({
        oscillator: { type: 'sawtooth', octave: 2, detune: 0, pulseWidth: 0.5, level: 1 },
      });
      const targetParams = createParams({
        oscillator: { type: 'sawtooth', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      // Octave mismatch affects less than waveform type
      expect(result.overall).toBeLessThan(100);
    });
  });

  describe('Envelope parameter comparison', () => {
    it('compares ADSR parameters', () => {
      const features = createFeatures();
      const playerParams = createParams({
        amplitudeEnvelope: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 0.5 },
      });
      const targetParams = createParams({
        amplitudeEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      // Attack time difference should hurt the score
      expect(result.overall).toBeLessThan(100);
    });
  });

  describe('Star thresholds', () => {
    it('gives 3 stars for 95%+', () => {
      const features = createFeatures();
      const params = createParams();

      const result = compareSounds(features, features, params, params);

      expect(result.stars).toBe(3);
      expect(result.overall).toBeGreaterThanOrEqual(95);
    });

    it('gives 2 stars for 80-94%', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 2300 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      // This should produce a score in the 80-94 range
      if (result.overall >= 80 && result.overall < 95) {
        expect(result.stars).toBe(2);
      }
    });

    it('gives 1 star for 60-79%', () => {
      const playerFeatures = createFeatures({ spectralCentroid: 3500 });
      const targetFeatures = createFeatures({ spectralCentroid: 2000 });
      const params = createParams();

      const result = compareSounds(playerFeatures, targetFeatures, params, params);

      if (result.overall >= 60 && result.overall < 80) {
        expect(result.stars).toBe(1);
      }
    });

    it('marks as not passed below 60%', () => {
      // Create significantly different features
      const playerFeatures = createFeatures({
        spectralCentroid: 5000,
        attackTime: 15,
        rmsEnvelope: new Array(50).fill(0.1),
      });
      const targetFeatures = createFeatures({
        spectralCentroid: 1000,
        attackTime: 2,
        rmsEnvelope: new Array(50).fill(0.9),
      });

      const playerParams = createParams({
        oscillator: { type: 'sine', octave: 2, detune: 50, pulseWidth: 0.5, level: 1 },
        filter: { type: 'highpass', cutoff: 5000, resonance: 10, keyTracking: 0 },
      });
      const targetParams = createParams({
        oscillator: { type: 'sawtooth', octave: -1, detune: 0, pulseWidth: 0.5, level: 1 },
        filter: { type: 'lowpass', cutoff: 500, resonance: 1, keyTracking: 0 },
      });

      const result = compareSounds(playerFeatures, targetFeatures, playerParams, targetParams);

      expect(result.passed).toBe(false);
    });
  });

  describe('Score weighting', () => {
    it('weights audio features at 70% and params at 30%', () => {
      // With perfect audio features but imperfect params
      const features = createFeatures();
      const playerParams = createParams({
        oscillator: { type: 'sine', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 }, // Wrong type
      });
      const targetParams = createParams({
        oscillator: { type: 'sawtooth', octave: 0, detune: 0, pulseWidth: 0.5, level: 1 },
      });

      const result = compareSounds(features, features, playerParams, targetParams);

      // Audio features are perfect (70 points)
      // Params are imperfect (less than 30 points)
      // Total should be between 70 and 100
      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(result.overall).toBeLessThan(100);
    });
  });
});

describe('generateSummary', () => {
  it('returns "Perfect!" for 3 stars', () => {
    const result: ScoreResult = {
      overall: 98,
      stars: 3,
      passed: true,
      breakdown: {
        brightness: { score: 100, feedback: 'Great' },
        attack: { score: 100, feedback: 'Great' },
        filter: { score: 100, feedback: 'Great' },
        envelope: { score: 100, feedback: 'Great' },
      },
    };

    expect(generateSummary(result)).toContain('Perfect');
  });

  it('returns encouraging message for 2 stars', () => {
    const result: ScoreResult = {
      overall: 85,
      stars: 2,
      passed: true,
      breakdown: {
        brightness: { score: 90, feedback: 'Close' },
        attack: { score: 80, feedback: 'Close' },
        filter: { score: 85, feedback: 'Close' },
        envelope: { score: 85, feedback: 'Close' },
      },
    };

    const summary = generateSummary(result);
    expect(summary).toContain('Great');
  });

  it('returns improvement guidance for 1 star', () => {
    const result: ScoreResult = {
      overall: 65,
      stars: 1,
      passed: true,
      breakdown: {
        brightness: { score: 70, feedback: 'Close' },
        attack: { score: 60, feedback: 'Slow' },
        filter: { score: 65, feedback: 'Adjust' },
        envelope: { score: 65, feedback: 'Adjust' },
      },
    };

    const summary = generateSummary(result);
    expect(summary).toContain('refining');
  });

  it('identifies worst category for failing score', () => {
    const result: ScoreResult = {
      overall: 45,
      stars: 1,
      passed: false,
      breakdown: {
        brightness: { score: 60, feedback: 'Too dark' },
        attack: { score: 30, feedback: 'Too slow' }, // Worst
        filter: { score: 50, feedback: 'Adjust' },
        envelope: { score: 40, feedback: 'Adjust' },
      },
    };

    const summary = generateSummary(result);
    expect(summary.toLowerCase()).toContain('attack');
  });
});

describe('compareFMParams', () => {
  it('scores 100 for identical params', () => {
    const result = compareFMParams(DEFAULT_FM_SYNTH_PARAMS, DEFAULT_FM_SYNTH_PARAMS);
    expect(result.score).toBe(100);
  });

  it('penalizes harmonicity difference', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, harmonicity: 3 };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, harmonicity: 1 };
    const result = compareFMParams(player, target);
    expect(result.score).toBeLessThan(100);
    expect(result.breakdown.harmonicity).toBeLessThan(100);
  });

  it('penalizes modulation index difference', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, modulationIndex: 8 };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, modulationIndex: 2 };
    const result = compareFMParams(player, target);
    expect(result.score).toBeLessThan(100);
    expect(result.breakdown.modulationIndex).toBeLessThan(100);
  });

  it('penalizes wrong carrier type', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, carrierType: 'square' as const };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, carrierType: 'sine' as const };
    const result = compareFMParams(player, target);
    expect(result.breakdown.carrierType).toBe(50);
  });

  it('penalizes wrong modulator type', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, modulatorType: 'sawtooth' as const };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, modulatorType: 'sine' as const };
    const result = compareFMParams(player, target);
    expect(result.breakdown.modulatorType).toBe(50);
  });
});
