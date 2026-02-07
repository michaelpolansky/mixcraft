/**
 * Tests for SamplerEngine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mocks inline within the vi.mock factory to avoid hoisting issues
vi.mock('tone', () => {
  const mockAnalyserNode = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  };

  // Use function constructors for Tone.js classes
  function MockPlayer() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      load: vi.fn(() => Promise.resolve()),
      loaded: true,
      loop: false,
      reverse: false,
      playbackRate: 1,
      buffer: {
        duration: 5,
        get: () => ({
          getChannelData: () => new Float32Array(44100 * 5).fill(0.5),
          length: 44100 * 5,
        }),
      },
    };
  }

  function MockVolume() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      volume: { value: -12 },
    };
  }

  function MockGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      gain: { value: 1 },
    };
  }

  function MockDistortion() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      distortion: 0,
    };
  }

  function MockFeedbackDelay() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      delayTime: { value: 0.25 },
      feedback: { value: 0.3 },
    };
  }

  function MockChorus() {
    const instance = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      frequency: { value: 1.5 },
      depth: 0.5,
    };
    instance.start = vi.fn(() => instance);
    return instance;
  }

  function MockReverb() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      decay: 1.5,
    };
  }

  return {
    Player: MockPlayer,
    Volume: MockVolume,
    Gain: MockGain,
    Distortion: MockDistortion,
    FeedbackDelay: MockFeedbackDelay,
    Chorus: MockChorus,
    Reverb: MockReverb,
    getContext: vi.fn(() => ({
      createAnalyser: vi.fn(() => mockAnalyserNode),
    })),
    getDestination: vi.fn(() => ({})),
    connect: vi.fn(),
    start: vi.fn(() => Promise.resolve()),
  };
});

// Import after mocking
import { createSamplerEngine, clamp, semitonesToRate, SamplerEngine } from '../../core/sampler-engine.ts';
import { DEFAULT_SAMPLER_PARAMS, SAMPLER_PARAM_RANGES } from '../../core/types.ts';

describe('Helper Functions', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('returns min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles equal min and max', () => {
      expect(clamp(5, 5, 5)).toBe(5);
    });
  });

  describe('semitonesToRate', () => {
    it('returns 1 for 0 semitones', () => {
      expect(semitonesToRate(0)).toBe(1);
    });

    it('returns 2 for 12 semitones (one octave up)', () => {
      expect(semitonesToRate(12)).toBe(2);
    });

    it('returns 0.5 for -12 semitones (one octave down)', () => {
      expect(semitonesToRate(-12)).toBe(0.5);
    });

    it('returns 4 for 24 semitones (two octaves up)', () => {
      expect(semitonesToRate(24)).toBe(4);
    });

    it('handles fractional semitones', () => {
      const result = semitonesToRate(6);
      expect(result).toBeCloseTo(Math.sqrt(2), 5);
    });
  });
});

describe('SamplerEngine', () => {
  let engine: SamplerEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = createSamplerEngine();
  });

  describe('createSamplerEngine', () => {
    it('returns a SamplerEngine instance', () => {
      const engine = createSamplerEngine();
      expect(engine).toBeInstanceOf(SamplerEngine);
    });

    it('creates engine with default params', () => {
      const engine = createSamplerEngine();
      const params = engine.getParams();
      expect(params.pitch).toBe(DEFAULT_SAMPLER_PARAMS.pitch);
      expect(params.timeStretch).toBe(DEFAULT_SAMPLER_PARAMS.timeStretch);
      expect(params.volume).toBe(DEFAULT_SAMPLER_PARAMS.volume);
    });

    it('accepts initial params override', () => {
      const engine = createSamplerEngine({ pitch: 5, volume: -6 });
      const params = engine.getParams();
      expect(params.pitch).toBe(5);
      expect(params.volume).toBe(-6);
    });
  });

  describe('setPitch', () => {
    it('sets pitch within valid range', () => {
      engine.setPitch(12);
      expect(engine.getParams().pitch).toBe(12);
    });

    it('clamps pitch to maximum', () => {
      engine.setPitch(48);
      expect(engine.getParams().pitch).toBe(SAMPLER_PARAM_RANGES.pitch.max);
    });

    it('clamps pitch to minimum', () => {
      engine.setPitch(-48);
      expect(engine.getParams().pitch).toBe(SAMPLER_PARAM_RANGES.pitch.min);
    });

    it('accepts negative semitones', () => {
      engine.setPitch(-7);
      expect(engine.getParams().pitch).toBe(-7);
    });
  });

  describe('setTimeStretch', () => {
    it('sets time stretch within valid range', () => {
      engine.setTimeStretch(1.5);
      expect(engine.getParams().timeStretch).toBe(1.5);
    });

    it('clamps time stretch to maximum', () => {
      engine.setTimeStretch(5.0);
      expect(engine.getParams().timeStretch).toBe(SAMPLER_PARAM_RANGES.timeStretch.max);
    });

    it('clamps time stretch to minimum', () => {
      engine.setTimeStretch(0.1);
      expect(engine.getParams().timeStretch).toBe(SAMPLER_PARAM_RANGES.timeStretch.min);
    });
  });

  describe('setVolume', () => {
    it('sets volume within valid range', () => {
      engine.setVolume(-20);
      expect(engine.getParams().volume).toBe(-20);
    });

    it('clamps volume to maximum (0 dB)', () => {
      engine.setVolume(10);
      expect(engine.getParams().volume).toBe(SAMPLER_PARAM_RANGES.volume.max);
    });

    it('clamps volume to minimum (-60 dB)', () => {
      engine.setVolume(-100);
      expect(engine.getParams().volume).toBe(SAMPLER_PARAM_RANGES.volume.min);
    });
  });

  describe('addSlice', () => {
    it('creates slice with correct start and end', () => {
      // Set a duration by casting to access private params
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = engine.addSlice(2, 5);
      expect(slice.start).toBe(2);
      expect(slice.end).toBe(5);
    });

    it('creates slice with unique ID', () => {
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice1 = engine.addSlice(0, 2);
      const slice2 = engine.addSlice(2, 4);
      expect(slice1.id).not.toBe(slice2.id);
    });

    it('creates slice with default pitch of 0', () => {
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = engine.addSlice(0, 5);
      expect(slice.pitch).toBe(0);
    });

    it('creates slice with default velocity of 1', () => {
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = engine.addSlice(0, 5);
      expect(slice.velocity).toBe(1);
    });

    it('clamps start to valid range', () => {
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = engine.addSlice(-5, 5);
      expect(slice.start).toBe(0);
    });

    it('clamps end to valid range', () => {
      (engine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = engine.addSlice(0, 15);
      expect(slice.end).toBe(10);
    });
  });

  describe('removeSlice', () => {
    it('removes slice by ID', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;

      const slice = freshEngine.addSlice(0, 5);
      expect(freshEngine.getSlices()).toHaveLength(1);

      freshEngine.removeSlice(slice.id);
      expect(freshEngine.getSlices()).toHaveLength(0);
    });

    it('does nothing for non-existent ID', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;

      freshEngine.addSlice(0, 5);
      freshEngine.removeSlice('non-existent-id');
      expect(freshEngine.getSlices()).toHaveLength(1);
    });
  });

  describe('autoSlice', () => {
    it('divides sample into equal slices', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;

      const slices = freshEngine.autoSlice(4);
      expect(slices).toHaveLength(4);
      expect(slices[0]!.start).toBe(0);
      expect(slices[0]!.end).toBe(2.5);
      expect(slices[1]!.start).toBe(2.5);
      expect(slices[1]!.end).toBe(5);
    });

    it('clears existing slices', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;

      freshEngine.addSlice(0, 2);
      freshEngine.addSlice(3, 5);
      expect(freshEngine.getSlices()).toHaveLength(2);

      freshEngine.autoSlice(2);
      expect(freshEngine.getSlices()).toHaveLength(2);
    });

    it('returns empty array for 0 slices', () => {
      const slices = engine.autoSlice(0);
      expect(slices).toHaveLength(0);
    });

    it('returns empty array for negative slices', () => {
      const slices = engine.autoSlice(-1);
      expect(slices).toHaveLength(0);
    });
  });

  describe('setStartPoint and setEndPoint', () => {
    it('sets start point within range', () => {
      engine.setStartPoint(0.25);
      expect(engine.getParams().startPoint).toBe(0.25);
    });

    it('clamps start point to not exceed end point', () => {
      engine.setEndPoint(0.5);
      engine.setStartPoint(0.75);
      expect(engine.getParams().startPoint).toBe(0.5);
    });

    it('sets end point within range', () => {
      engine.setEndPoint(0.75);
      expect(engine.getParams().endPoint).toBe(0.75);
    });

    it('clamps end point to not go below start point', () => {
      engine.setStartPoint(0.5);
      engine.setEndPoint(0.25);
      expect(engine.getParams().endPoint).toBe(0.5);
    });
  });

  describe('setLoop and setReverse', () => {
    it('enables loop mode', () => {
      engine.setLoop(true);
      expect(engine.getParams().loop).toBe(true);
    });

    it('disables loop mode', () => {
      engine.setLoop(true);
      engine.setLoop(false);
      expect(engine.getParams().loop).toBe(false);
    });

    it('enables reverse mode', () => {
      engine.setReverse(true);
      expect(engine.getParams().reverse).toBe(true);
    });

    it('disables reverse mode', () => {
      engine.setReverse(true);
      engine.setReverse(false);
      expect(engine.getParams().reverse).toBe(false);
    });
  });

  describe('getAnalyser', () => {
    it('returns the analyser node', () => {
      const analyser = engine.getAnalyser();
      expect(analyser).toBeDefined();
      expect(analyser.fftSize).toBe(2048);
    });
  });

  describe('getWaveformData', () => {
    it('returns empty Float32Array when no sample is loaded', () => {
      const freshEngine = createSamplerEngine();
      const waveformData = freshEngine.getWaveformData();
      expect(waveformData).toBeInstanceOf(Float32Array);
      expect(waveformData.length).toBe(0);
    });

    it('returns Float32Array (not null) after loadSample', async () => {
      const freshEngine = createSamplerEngine();
      await freshEngine.loadSample('/test/sample.wav', 'Test Sample');
      const waveformData = freshEngine.getWaveformData();
      expect(waveformData).toBeInstanceOf(Float32Array);
      expect(waveformData.length).toBeGreaterThan(0);
    });
  });

  describe('loadSample', () => {
    it('accepts a URL and name', async () => {
      const freshEngine = createSamplerEngine();
      await freshEngine.loadSample('/test/sample.wav', 'Test Sample');
      // If we get here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('updates params with sample URL and name', async () => {
      const freshEngine = createSamplerEngine();
      await freshEngine.loadSample('/test/sample.wav', 'Test Sample');
      const params = freshEngine.getParams();
      expect(params.sampleUrl).toBe('/test/sample.wav');
      expect(params.sampleName).toBe('Test Sample');
    });

    it('updates duration from loaded buffer', async () => {
      const freshEngine = createSamplerEngine();
      await freshEngine.loadSample('/test/sample.wav', 'Test Sample');
      const params = freshEngine.getParams();
      expect(params.duration).toBe(5); // Mock buffer duration is 5
    });

    it('sets loaded property to true', async () => {
      const freshEngine = createSamplerEngine();
      await freshEngine.loadSample('/test/sample.wav', 'Test Sample');
      expect(freshEngine.loaded).toBe(true);
    });
  });

  describe('start', () => {
    it('can be called without throwing', () => {
      expect(() => engine.start()).not.toThrow();
    });

    it('can be called with optional time parameter', () => {
      expect(() => engine.start(0.5)).not.toThrow();
    });

    it('does not throw when called before loading a sample', () => {
      const freshEngine = createSamplerEngine();
      // Mock loaded as false for this test
      (freshEngine as unknown as { player: { loaded: boolean } }).player.loaded = false;
      expect(() => freshEngine.start()).not.toThrow();
    });

    it('returns early when playback duration is zero or negative', () => {
      const freshEngine = createSamplerEngine();
      freshEngine.setStartPoint(0.5);
      freshEngine.setEndPoint(0.5); // Same as start, so duration = 0
      expect(() => freshEngine.start()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('can be called without throwing', () => {
      expect(() => engine.stop()).not.toThrow();
    });

    it('can be called when not playing', () => {
      const freshEngine = createSamplerEngine();
      expect(() => freshEngine.stop()).not.toThrow();
    });

    it('can be called multiple times', () => {
      expect(() => {
        engine.stop();
        engine.stop();
        engine.stop();
      }).not.toThrow();
    });
  });

  describe('triggerSlice', () => {
    it('accepts a valid slice index', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;
      freshEngine.addSlice(0, 2);
      expect(() => freshEngine.triggerSlice(0)).not.toThrow();
    });

    it('does not throw for negative index', () => {
      expect(() => engine.triggerSlice(-1)).not.toThrow();
    });

    it('does not throw for index out of bounds', () => {
      expect(() => engine.triggerSlice(999)).not.toThrow();
    });

    it('does not throw for empty slices array', () => {
      const freshEngine = createSamplerEngine();
      expect(() => freshEngine.triggerSlice(0)).not.toThrow();
    });

    it('handles slice with zero duration gracefully', () => {
      const freshEngine = createSamplerEngine();
      (freshEngine as unknown as { params: { duration: number } }).params.duration = 10;
      const slice = freshEngine.addSlice(5, 5); // Zero duration
      expect(() => freshEngine.triggerSlice(0)).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('disposes without throwing', () => {
      expect(() => engine.dispose()).not.toThrow();
    });
  });
});
