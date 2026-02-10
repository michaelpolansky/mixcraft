/**
 * Tests for EffectsChain
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// vi.hoisted runs before vi.mock, avoiding TDZ issues with const declarations
const {
  mockGain,
  mockDistortion,
  mockFeedbackDelay,
  mockChorus,
  mockReverb,
} = vi.hoisted(() => ({
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
}));

vi.mock('tone', () => ({
  Gain: mockGain,
  Distortion: mockDistortion,
  FeedbackDelay: mockFeedbackDelay,
  Chorus: mockChorus,
  Reverb: mockReverb,
}));

// Import after mocking
import { EffectsChain } from '../../core/effects-chain.ts';

describe('EffectsChain', () => {
  let chain: EffectsChain;

  beforeEach(() => {
    vi.clearAllMocks();
    chain = new EffectsChain();
  });

  afterEach(() => {
    chain.dispose();
  });

  describe('Initialization', () => {
    it('initializes with default parameters', () => {
      const params = chain.getParams();
      expect(params.distortion.amount).toBe(0);
      expect(params.delay.mix).toBe(0);
      expect(params.reverb.mix).toBe(0);
      expect(params.chorus.mix).toBe(0);
    });

    it('accepts custom initial parameters', () => {
      const custom = new EffectsChain({
        distortion: { amount: 0.5, mix: 0.5 },
      });
      expect(custom.getParams().distortion.amount).toBe(0.5);
      custom.dispose();
    });
  });

  describe('Distortion', () => {
    it('sets distortion amount', () => {
      chain.setDistortion({ amount: 0.7 });
      expect(chain.getParams().distortion.amount).toBe(0.7);
    });

    it('sets distortion mix', () => {
      chain.setDistortion({ mix: 0.5 });
      expect(chain.getParams().distortion.mix).toBe(0.5);
    });
  });

  describe('Delay', () => {
    it('sets delay time', () => {
      chain.setDelay({ time: 0.5 });
      expect(chain.getParams().delay.time).toBe(0.5);
    });

    it('sets delay feedback', () => {
      chain.setDelay({ feedback: 0.6 });
      expect(chain.getParams().delay.feedback).toBe(0.6);
    });

    it('sets delay mix', () => {
      chain.setDelay({ mix: 0.4 });
      expect(chain.getParams().delay.mix).toBe(0.4);
    });
  });

  describe('Reverb', () => {
    it('sets reverb decay', () => {
      chain.setReverb({ decay: 3.0 });
      expect(chain.getParams().reverb.decay).toBe(3.0);
    });

    it('sets reverb mix', () => {
      chain.setReverb({ mix: 0.3 });
      expect(chain.getParams().reverb.mix).toBe(0.3);
    });
  });

  describe('Chorus', () => {
    it('sets chorus rate', () => {
      chain.setChorus({ rate: 2.0 });
      expect(chain.getParams().chorus.rate).toBe(2.0);
    });

    it('sets chorus depth', () => {
      chain.setChorus({ depth: 0.7 });
      expect(chain.getParams().chorus.depth).toBe(0.7);
    });

    it('sets chorus mix', () => {
      chain.setChorus({ mix: 0.5 });
      expect(chain.getParams().chorus.mix).toBe(0.5);
    });
  });

  describe('Bulk update', () => {
    it('sets all params at once', () => {
      chain.setParams({
        distortion: { amount: 0.2, mix: 0.2 },
        delay: { time: 0.3, feedback: 0.4, mix: 0.3 },
      });
      expect(chain.getParams().distortion.amount).toBe(0.2);
      expect(chain.getParams().delay.time).toBe(0.3);
    });
  });
});
