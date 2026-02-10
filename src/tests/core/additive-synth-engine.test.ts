/**
 * Tests for AdditiveSynthEngine
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// vi.hoisted runs before vi.mock, avoiding TDZ issues with const declarations
const {
  mockOscillator,
  mockGain,
  mockAmplitudeEnvelope,
  mockDistortion,
  mockFeedbackDelay,
  mockChorus,
  mockReverb,
  mockLFO,
  mockNoise,
  mockFilter,
  mockPanner,
  mockSequence,
  mockTransport,
  mockAnalyserNode,
  mockContext,
} = vi.hoisted(() => {
  const mockAnalyserNode = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  };

  return {
    mockOscillator: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
    }; }),
    mockGain: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      gain: { value: 1 },
    }; }),
    mockAmplitudeEnvelope: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      triggerAttackRelease: vi.fn(),
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    }; }),
    mockDistortion: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      distortion: 0,
    }; }),
    mockFeedbackDelay: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      delayTime: { value: 0.25 },
      feedback: { value: 0.3 },
    }; }),
    mockChorus: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn().mockReturnThis(),
      frequency: { value: 1.5 },
      depth: 0.5,
    }; }),
    mockReverb: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      decay: 1.5,
    }; }),
    mockLFO: vi.fn(function() { return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 1 },
      min: -1,
      max: 1,
      type: 'sine',
    }; }),
    mockNoise: vi.fn(function() { return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'white',
    }; }),
    mockFilter: vi.fn(function() { return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      frequency: { value: 1000 },
      Q: { value: 1 },
      type: 'lowpass',
    }; }),
    mockPanner: vi.fn(function() { return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      pan: { value: 0 },
    }; }),
    mockSequence: vi.fn(function() { return {
      start: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
    }; }),
    mockTransport: {
      bpm: { value: 120 },
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
    },
    mockAnalyserNode,
    mockContext: {
      createAnalyser: vi.fn(() => mockAnalyserNode),
      now: vi.fn(() => 0),
    },
  };
});

vi.mock('tone', () => ({
  Oscillator: mockOscillator,
  Gain: mockGain,
  AmplitudeEnvelope: mockAmplitudeEnvelope,
  Distortion: mockDistortion,
  FeedbackDelay: mockFeedbackDelay,
  Chorus: mockChorus,
  Reverb: mockReverb,
  LFO: mockLFO,
  Noise: mockNoise,
  Filter: mockFilter,
  Panner: mockPanner,
  Sequence: mockSequence,
  Transport: mockTransport,
  getContext: vi.fn(() => mockContext),
  getDestination: vi.fn(() => ({})),
  connect: vi.fn(),
  start: vi.fn(() => Promise.resolve()),
  Frequency: vi.fn((note: string) => ({
    toFrequency: () => 440,
  })),
  dbToGain: vi.fn((db: number) => Math.pow(10, db / 20)),
}));

// Import after mocking
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import { DEFAULT_ADDITIVE_SYNTH_PARAMS, ADDITIVE_PRESETS } from '../../core/types.ts';

describe('AdditiveSynthEngine', () => {
  let engine: AdditiveSynthEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new AdditiveSynthEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  // ============================================
  // Initialization
  // ============================================

  describe('Initialization', () => {
    it('initializes with default additive parameters', () => {
      const params = engine.getParams();
      expect(params.harmonics).toEqual(DEFAULT_ADDITIVE_SYNTH_PARAMS.harmonics);
      expect(params.amplitudeEnvelope).toEqual(DEFAULT_ADDITIVE_SYNTH_PARAMS.amplitudeEnvelope);
      expect(params.volume).toBe(DEFAULT_ADDITIVE_SYNTH_PARAMS.volume);
    });

    it('accepts custom initial parameters', () => {
      const customHarmonics = [1, 0.5, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const custom = new AdditiveSynthEngine({
        harmonics: customHarmonics,
        volume: -6,
      });
      const params = custom.getParams();
      expect(params.harmonics).toEqual(customHarmonics);
      expect(params.volume).toBe(-6);
      custom.dispose();
    });

    it('creates 16 oscillators', () => {
      // Each oscillator constructor call represents one harmonic
      expect(mockOscillator).toHaveBeenCalledTimes(16);
    });

    it('creates 16 harmonic gain nodes plus sum, master', () => {
      // 16 harmonic gains + 1 sum gain + 1 master gain = 18 total
      // Plus effects chain gains (internal) - but we test our specific needs
      expect(mockGain.mock.calls.length).toBeGreaterThanOrEqual(18);
    });

    it('starts uninitialized', () => {
      expect(engine.initialized).toBe(false);
    });

    it('initializes after start()', async () => {
      await engine.start();
      expect(engine.initialized).toBe(true);
    });

    it('pads harmonics array to 16 elements if shorter', () => {
      const custom = new AdditiveSynthEngine({
        harmonics: [1, 0.5], // Only 2 elements
      });
      const params = custom.getParams();
      expect(params.harmonics.length).toBe(16);
      expect(params.harmonics[0]).toBe(1);
      expect(params.harmonics[1]).toBe(0.5);
      expect(params.harmonics[2]).toBe(0);
      custom.dispose();
    });

    it('truncates harmonics array to 16 elements if longer', () => {
      const longHarmonics = Array.from({ length: 20 }, () => 0.5);
      const custom = new AdditiveSynthEngine({
        harmonics: longHarmonics,
      });
      const params = custom.getParams();
      expect(params.harmonics.length).toBe(16);
      custom.dispose();
    });

    it('clamps harmonic amplitudes to 0-1', () => {
      const custom = new AdditiveSynthEngine({
        harmonics: [2, -0.5, 1.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      const params = custom.getParams();
      expect(params.harmonics[0]).toBe(1); // Clamped from 2
      expect(params.harmonics[1]).toBe(0); // Clamped from -0.5
      expect(params.harmonics[2]).toBe(1); // Clamped from 1.5
      expect(params.harmonics[3]).toBe(0.5); // Unchanged
      custom.dispose();
    });
  });

  // ============================================
  // Harmonic Controls
  // ============================================

  describe('Harmonic Controls', () => {
    it('sets individual harmonic amplitude', () => {
      engine.setHarmonic(0, 0.8);
      expect(engine.getParams().harmonics[0]).toBe(0.8);
    });

    it('sets harmonic at any valid index (0-15)', () => {
      engine.setHarmonic(15, 0.3);
      expect(engine.getParams().harmonics[15]).toBe(0.3);
    });

    it('ignores invalid harmonic index (negative)', () => {
      const original = engine.getParams().harmonics[0];
      engine.setHarmonic(-1, 0.5);
      expect(engine.getParams().harmonics[0]).toBe(original);
    });

    it('ignores invalid harmonic index (>= 16)', () => {
      engine.setHarmonic(16, 0.5);
      expect(engine.getParams().harmonics.length).toBe(16);
    });

    it('clamps harmonic amplitude to 0-1', () => {
      engine.setHarmonic(0, 2);
      expect(engine.getParams().harmonics[0]).toBe(1);

      engine.setHarmonic(1, -1);
      expect(engine.getParams().harmonics[1]).toBe(0);
    });

    it('sets all harmonics at once', () => {
      const newHarmonics = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0];
      engine.setHarmonics(newHarmonics);
      expect(engine.getParams().harmonics).toEqual(newHarmonics);
    });

    it('fills missing harmonics with 0 when setting partial array', () => {
      engine.setHarmonics([1, 0.5, 0.25]);
      const params = engine.getParams();
      expect(params.harmonics[0]).toBe(1);
      expect(params.harmonics[1]).toBe(0.5);
      expect(params.harmonics[2]).toBe(0.25);
      expect(params.harmonics[3]).toBe(0);
      expect(params.harmonics[15]).toBe(0);
    });
  });

  // ============================================
  // Presets
  // ============================================

  describe('Presets', () => {
    it('applies saw preset', () => {
      engine.applyPreset('saw');
      expect(engine.getParams().harmonics).toEqual([...ADDITIVE_PRESETS.saw]);
    });

    it('applies square preset', () => {
      engine.applyPreset('square');
      expect(engine.getParams().harmonics).toEqual([...ADDITIVE_PRESETS.square]);
    });

    it('applies triangle preset', () => {
      engine.applyPreset('triangle');
      expect(engine.getParams().harmonics).toEqual([...ADDITIVE_PRESETS.triangle]);
    });

    it('applies organ preset', () => {
      engine.applyPreset('organ');
      expect(engine.getParams().harmonics).toEqual([...ADDITIVE_PRESETS.organ]);
    });

    it('saw preset has decreasing harmonics (1/n pattern)', () => {
      engine.applyPreset('saw');
      const harmonics = engine.getParams().harmonics;
      expect(harmonics[0]).toBeCloseTo(1); // 1/1
      expect(harmonics[1]).toBeCloseTo(0.5); // 1/2
      expect(harmonics[2]).toBeCloseTo(1 / 3); // 1/3
    });

    it('square preset has only odd harmonics', () => {
      engine.applyPreset('square');
      const harmonics = engine.getParams().harmonics;
      // Odd harmonics (1, 3, 5...) have values
      expect(harmonics[0]).toBeGreaterThan(0); // 1st (fundamental)
      expect(harmonics[2]).toBeGreaterThan(0); // 3rd
      expect(harmonics[4]).toBeGreaterThan(0); // 5th
      // Even harmonics (2, 4, 6...) are zero
      expect(harmonics[1]).toBe(0); // 2nd
      expect(harmonics[3]).toBe(0); // 4th
      expect(harmonics[5]).toBe(0); // 6th
    });
  });

  // ============================================
  // Amplitude Envelope
  // ============================================

  describe('Amplitude Envelope', () => {
    it('sets full ADSR envelope', () => {
      engine.setAmplitudeEnvelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 0.8,
      });
      const params = engine.getParams();
      expect(params.amplitudeEnvelope.attack).toBe(0.1);
      expect(params.amplitudeEnvelope.decay).toBe(0.2);
      expect(params.amplitudeEnvelope.sustain).toBe(0.7);
      expect(params.amplitudeEnvelope.release).toBe(0.8);
    });

    it('sets partial envelope (attack only)', () => {
      engine.setAmplitudeEnvelope({ attack: 0.5 });
      expect(engine.getParams().amplitudeEnvelope.attack).toBe(0.5);
    });

    it('preserves other envelope params when updating one', () => {
      const original = engine.getParams().amplitudeEnvelope;
      engine.setAmplitudeEnvelope({ attack: 0.9 });
      const updated = engine.getParams().amplitudeEnvelope;
      expect(updated.attack).toBe(0.9);
      expect(updated.decay).toBe(original.decay);
      expect(updated.sustain).toBe(original.sustain);
      expect(updated.release).toBe(original.release);
    });

    it('sets attack via setAmplitudeAttack', () => {
      engine.setAmplitudeAttack(0.15);
      expect(engine.getParams().amplitudeEnvelope.attack).toBe(0.15);
    });

    it('sets decay via setAmplitudeDecay', () => {
      engine.setAmplitudeDecay(0.25);
      expect(engine.getParams().amplitudeEnvelope.decay).toBe(0.25);
    });

    it('sets sustain via setAmplitudeSustain', () => {
      engine.setAmplitudeSustain(0.6);
      expect(engine.getParams().amplitudeEnvelope.sustain).toBe(0.6);
    });

    it('clamps sustain to 0-1', () => {
      engine.setAmplitudeSustain(1.5);
      expect(engine.getParams().amplitudeEnvelope.sustain).toBe(1);

      engine.setAmplitudeSustain(-0.5);
      expect(engine.getParams().amplitudeEnvelope.sustain).toBe(0);
    });

    it('sets release via setAmplitudeRelease', () => {
      engine.setAmplitudeRelease(0.5);
      expect(engine.getParams().amplitudeEnvelope.release).toBe(0.5);
    });
  });

  // ============================================
  // Volume
  // ============================================

  describe('Volume', () => {
    it('sets volume', () => {
      engine.setVolume(-6);
      expect(engine.getParams().volume).toBe(-6);
    });

    it('allows negative volume in dB', () => {
      engine.setVolume(-30);
      expect(engine.getParams().volume).toBe(-30);
    });
  });

  // ============================================
  // Effects (delegated to EffectsChain)
  // ============================================

  describe('Effects', () => {
    it('sets distortion parameters', () => {
      engine.setDistortion({ amount: 0.5, mix: 0.5 });
      expect(engine.getParams().effects.distortion.amount).toBe(0.5);
      expect(engine.getParams().effects.distortion.mix).toBe(0.5);
    });

    it('sets delay parameters', () => {
      engine.setDelay({ time: 0.4, feedback: 0.5, mix: 0.3 });
      expect(engine.getParams().effects.delay.time).toBe(0.4);
      expect(engine.getParams().effects.delay.feedback).toBe(0.5);
      expect(engine.getParams().effects.delay.mix).toBe(0.3);
    });

    it('sets reverb parameters', () => {
      engine.setReverb({ decay: 2.0, mix: 0.4 });
      expect(engine.getParams().effects.reverb.decay).toBe(2.0);
      expect(engine.getParams().effects.reverb.mix).toBe(0.4);
    });

    it('sets chorus parameters', () => {
      engine.setChorus({ rate: 2.0, depth: 0.8, mix: 0.5 });
      expect(engine.getParams().effects.chorus.rate).toBe(2.0);
      expect(engine.getParams().effects.chorus.depth).toBe(0.8);
      expect(engine.getParams().effects.chorus.mix).toBe(0.5);
    });
  });

  // ============================================
  // Bulk Update
  // ============================================

  describe('Bulk Update (setParams)', () => {
    it('updates harmonics via setParams', () => {
      const newHarmonics = [1, 0.5, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      engine.setParams({ harmonics: newHarmonics });
      expect(engine.getParams().harmonics).toEqual(newHarmonics);
    });

    it('updates envelope via setParams', () => {
      engine.setParams({
        amplitudeEnvelope: { attack: 0.2, decay: 0.3, sustain: 0.6, release: 0.7 },
      });
      const env = engine.getParams().amplitudeEnvelope;
      expect(env.attack).toBe(0.2);
      expect(env.decay).toBe(0.3);
    });

    it('updates effects via setParams', () => {
      engine.setParams({
        effects: {
          distortion: { amount: 0.3, mix: 0.3 },
          delay: { time: 0.5, feedback: 0.4, mix: 0.2 },
          reverb: { decay: 2.5, mix: 0.3 },
          chorus: { rate: 2.0, depth: 0.7, mix: 0.4 },
        },
      });
      expect(engine.getParams().effects.distortion.amount).toBe(0.3);
      expect(engine.getParams().effects.delay.time).toBe(0.5);
    });

    it('updates volume via setParams', () => {
      engine.setParams({ volume: -18 });
      expect(engine.getParams().volume).toBe(-18);
    });
  });

  // ============================================
  // Analyser
  // ============================================

  describe('Analyser', () => {
    it('provides analyser node', () => {
      const analyser = engine.getAnalyser();
      expect(analyser).toBeDefined();
      expect(analyser.fftSize).toBe(2048);
    });

    it('provides frequency data', () => {
      const data = engine.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
    });

    it('provides time domain data', () => {
      const data = engine.getTimeDomainData();
      expect(data).toBeInstanceOf(Uint8Array);
    });
  });

  // ============================================
  // Note Control
  // ============================================

  describe('Note Control', () => {
    it('triggers attack with note name', () => {
      engine.triggerAttack('C4');
      // Test passes if no error thrown - mock handles the call
    });

    it('triggers attack with frequency', () => {
      engine.triggerAttack(440);
      // Test passes if no error thrown
    });

    it('triggers release', () => {
      engine.triggerRelease();
      // Test passes if no error thrown
    });

    it('triggers attack release with duration', () => {
      engine.triggerAttackRelease('C4', '8n');
      // Test passes if no error thrown
    });

    it('triggers attack release with numeric duration', () => {
      engine.triggerAttackRelease('C4', 0.5);
      // Test passes if no error thrown
    });
  });

  // ============================================
  // Factory Function
  // ============================================

  describe('Factory Function', () => {
    it('createAdditiveSynthEngine creates engine with defaults', () => {
      const created = createAdditiveSynthEngine();
      expect(created.getParams().harmonics).toEqual(DEFAULT_ADDITIVE_SYNTH_PARAMS.harmonics);
      created.dispose();
    });

    it('createAdditiveSynthEngine accepts custom params', () => {
      const customHarmonics = [1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const created = createAdditiveSynthEngine({ harmonics: customHarmonics });
      expect(created.getParams().harmonics).toEqual(customHarmonics);
      created.dispose();
    });
  });

  // ============================================
  // Cleanup
  // ============================================

  describe('Cleanup', () => {
    it('dispose cleans up resources', () => {
      const testEngine = new AdditiveSynthEngine();
      expect(() => testEngine.dispose()).not.toThrow();
    });
  });
});
