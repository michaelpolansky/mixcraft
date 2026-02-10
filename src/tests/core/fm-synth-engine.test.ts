/**
 * Tests for FMSynthEngine
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// vi.hoisted runs before vi.mock, avoiding TDZ issues with const declarations
const {
  mockFMSynth,
  mockGain,
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
    mockFMSynth: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      triggerAttackRelease: vi.fn(),
      harmonicity: { value: 1 },
      modulationIndex: { value: 2 },
      oscillator: { type: 'sine' },
      modulation: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.5,
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.5,
      },
      volume: { value: -12 },
    }; }),
    mockGain: vi.fn(function() { return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      gain: { value: 1 },
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
  FMSynth: mockFMSynth,
  Gain: mockGain,
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
  now: vi.fn(() => 0),
  Frequency: vi.fn((_note: string) => ({
    toFrequency: () => 440,
  })),
}));

// Import after mocking
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import { DEFAULT_FM_SYNTH_PARAMS, FM_PARAM_RANGES } from '../../core/types.ts';

describe('FMSynthEngine', () => {
  let engine: FMSynthEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new FMSynthEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  // ============================================
  // Initialization
  // ============================================

  describe('Initialization', () => {
    it('initializes with default FM parameters', () => {
      const params = engine.getParams();
      expect(params.harmonicity).toBe(DEFAULT_FM_SYNTH_PARAMS.harmonicity);
      expect(params.modulationIndex).toBe(DEFAULT_FM_SYNTH_PARAMS.modulationIndex);
      expect(params.carrierType).toBe(DEFAULT_FM_SYNTH_PARAMS.carrierType);
      expect(params.modulatorType).toBe(DEFAULT_FM_SYNTH_PARAMS.modulatorType);
      expect(params.modulationEnvelopeAmount).toBe(DEFAULT_FM_SYNTH_PARAMS.modulationEnvelopeAmount);
      expect(params.volume).toBe(DEFAULT_FM_SYNTH_PARAMS.volume);
    });

    it('accepts custom initial parameters', () => {
      const custom = new FMSynthEngine({
        harmonicity: 3,
        modulationIndex: 5,
        carrierType: 'triangle',
      });
      const params = custom.getParams();
      expect(params.harmonicity).toBe(3);
      expect(params.modulationIndex).toBe(5);
      expect(params.carrierType).toBe('triangle');
      custom.dispose();
    });

    it('starts uninitialized', () => {
      expect(engine.initialized).toBe(false);
    });

    it('initializes after start()', async () => {
      await engine.start();
      expect(engine.initialized).toBe(true);
    });
  });

  // ============================================
  // Harmonicity
  // ============================================

  describe('Harmonicity', () => {
    it('sets harmonicity within range', () => {
      engine.setHarmonicity(4);
      expect(engine.getParams().harmonicity).toBe(4);
    });

    it('clamps harmonicity to minimum (0.5)', () => {
      engine.setHarmonicity(0);
      expect(engine.getParams().harmonicity).toBe(FM_PARAM_RANGES.harmonicity.min);
    });

    it('clamps harmonicity to maximum (12)', () => {
      engine.setHarmonicity(20);
      expect(engine.getParams().harmonicity).toBe(FM_PARAM_RANGES.harmonicity.max);
    });
  });

  // ============================================
  // Modulation Index
  // ============================================

  describe('Modulation Index', () => {
    it('sets modulation index within range', () => {
      engine.setModulationIndex(5);
      expect(engine.getParams().modulationIndex).toBe(5);
    });

    it('clamps modulation index to minimum (0)', () => {
      engine.setModulationIndex(-1);
      expect(engine.getParams().modulationIndex).toBe(FM_PARAM_RANGES.modulationIndex.min);
    });

    it('clamps modulation index to maximum (10)', () => {
      engine.setModulationIndex(15);
      expect(engine.getParams().modulationIndex).toBe(FM_PARAM_RANGES.modulationIndex.max);
    });
  });

  // ============================================
  // Oscillator Types
  // ============================================

  describe('Oscillator Types', () => {
    it('sets carrier type', () => {
      engine.setCarrierType('sawtooth');
      expect(engine.getParams().carrierType).toBe('sawtooth');
    });

    it('sets modulator type', () => {
      engine.setModulatorType('square');
      expect(engine.getParams().modulatorType).toBe('square');
    });

    it('supports all standard waveforms for carrier', () => {
      const waveforms = ['sine', 'sawtooth', 'square', 'triangle'] as const;
      for (const waveform of waveforms) {
        engine.setCarrierType(waveform);
        expect(engine.getParams().carrierType).toBe(waveform);
      }
    });

    it('supports all standard waveforms for modulator', () => {
      const waveforms = ['sine', 'sawtooth', 'square', 'triangle'] as const;
      for (const waveform of waveforms) {
        engine.setModulatorType(waveform);
        expect(engine.getParams().modulatorType).toBe(waveform);
      }
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
  });

  // ============================================
  // Modulation Envelope Amount
  // ============================================

  describe('Modulation Envelope Amount', () => {
    it('sets modulation envelope amount within range', () => {
      engine.setModulationEnvelopeAmount(0.7);
      expect(engine.getParams().modulationEnvelopeAmount).toBe(0.7);
    });

    it('clamps modulation envelope amount to minimum (0)', () => {
      engine.setModulationEnvelopeAmount(-0.5);
      expect(engine.getParams().modulationEnvelopeAmount).toBe(FM_PARAM_RANGES.modulationEnvelopeAmount.min);
    });

    it('clamps modulation envelope amount to maximum (1)', () => {
      engine.setModulationEnvelopeAmount(1.5);
      expect(engine.getParams().modulationEnvelopeAmount).toBe(FM_PARAM_RANGES.modulationEnvelopeAmount.max);
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
    it('updates multiple FM-specific parameters at once', () => {
      engine.setParams({
        harmonicity: 3,
        modulationIndex: 4,
        carrierType: 'triangle',
        modulatorType: 'square',
      });
      const params = engine.getParams();
      expect(params.harmonicity).toBe(3);
      expect(params.modulationIndex).toBe(4);
      expect(params.carrierType).toBe('triangle');
      expect(params.modulatorType).toBe('square');
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

    it('clamps parameters in bulk update', () => {
      engine.setParams({
        harmonicity: 100, // Should clamp to 12
        modulationIndex: -5, // Should clamp to 0
      });
      const params = engine.getParams();
      expect(params.harmonicity).toBe(FM_PARAM_RANGES.harmonicity.max);
      expect(params.modulationIndex).toBe(FM_PARAM_RANGES.modulationIndex.min);
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
    it('triggers attack', () => {
      engine.triggerAttack('C4');
      // Test passes if no error thrown - mock handles the call
    });

    it('triggers release', () => {
      engine.triggerRelease();
      // Test passes if no error thrown
    });

    it('triggers attack release', () => {
      engine.triggerAttackRelease('C4', '8n');
      // Test passes if no error thrown
    });

    it('accepts frequency as number', () => {
      engine.triggerAttack(440);
      // Test passes if no error thrown
    });
  });

  // ============================================
  // Factory Function
  // ============================================

  describe('Factory Function', () => {
    it('createFMSynthEngine creates engine with defaults', () => {
      const created = createFMSynthEngine();
      expect(created.getParams().harmonicity).toBe(DEFAULT_FM_SYNTH_PARAMS.harmonicity);
      created.dispose();
    });

    it('createFMSynthEngine accepts custom params', () => {
      const created = createFMSynthEngine({ harmonicity: 5 });
      expect(created.getParams().harmonicity).toBe(5);
      created.dispose();
    });
  });

  // ============================================
  // Cleanup
  // ============================================

  describe('Cleanup', () => {
    it('dispose cleans up resources', () => {
      const testEngine = new FMSynthEngine();
      expect(() => testEngine.dispose()).not.toThrow();
    });
  });
});
