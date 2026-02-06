/**
 * Tests for DrumSequencerEngine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mocks inline within the vi.mock factory to avoid hoisting issues
vi.mock('tone', () => {
  // Mock transport state
  let transportState = {
    bpm: { value: 120 },
    swing: 0,
    swingSubdivision: '16n',
    position: 0,
    isStarted: false,
  };

  // Store sequence callback for testing
  let sequenceCallback: ((time: number, step: number) => void) | null = null;

  function MockPlayer() {
    const player = {
      connect: vi.fn(() => player),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      load: vi.fn(() => Promise.resolve()),
      loaded: true,
      toDestination: vi.fn(() => player),
    };
    return player;
  }

  function MockVolume(initialValue?: number) {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
      toDestination: vi.fn(),
      volume: { value: initialValue ?? 0 },
    };
  }

  function MockSequence(callback: (time: number, step: number) => void, steps: number[], subdivision: string) {
    sequenceCallback = callback;
    return {
      start: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
      callback,
      events: steps,
      subdivision,
    };
  }

  const MockTransport = {
    get bpm() { return transportState.bpm; },
    get swing() { return transportState.swing; },
    set swing(val: number) { transportState.swing = val; },
    get swingSubdivision() { return transportState.swingSubdivision; },
    set swingSubdivision(val: string) { transportState.swingSubdivision = val; },
    get position() { return transportState.position; },
    set position(val: number) { transportState.position = val; },
    start: vi.fn(() => { transportState.isStarted = true; }),
    stop: vi.fn(() => { transportState.isStarted = false; }),
    pause: vi.fn(() => { transportState.isStarted = false; }),
  };

  const MockDraw = {
    schedule: vi.fn((callback: () => void, time: number) => {
      callback();
    }),
  };

  return {
    Player: MockPlayer,
    Volume: MockVolume,
    Sequence: MockSequence,
    Transport: MockTransport,
    Draw: MockDraw,
    start: vi.fn(() => Promise.resolve()),
    // Reset function for tests
    _resetMocks: () => {
      transportState = {
        bpm: { value: 120 },
        swing: 0,
        swingSubdivision: '16n',
        position: 0,
        isStarted: false,
      };
      sequenceCallback = null;
    },
    _getSequenceCallback: () => sequenceCallback,
  };
});

// Import after mocking
import { createDrumSequencerEngine, clamp, DrumSequencerEngine } from '../../core/drum-sequencer-engine.ts';
import { DEFAULT_DRUM_SEQUENCER_PARAMS, DRUM_SEQUENCER_RANGES, DrumPattern } from '../../core/types.ts';
import * as Tone from 'tone';

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

    it('handles negative ranges', () => {
      expect(clamp(-30, -60, 0)).toBe(-30);
    });
  });
});

describe('DrumSequencerEngine', () => {
  let engine: DrumSequencerEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Tone mocks
    (Tone as unknown as { _resetMocks: () => void })._resetMocks?.();
    engine = createDrumSequencerEngine();
  });

  describe('createDrumSequencerEngine', () => {
    it('returns a DrumSequencerEngine instance', () => {
      const engine = createDrumSequencerEngine();
      expect(engine).toBeInstanceOf(DrumSequencerEngine);
    });

    it('creates engine with default params', () => {
      const engine = createDrumSequencerEngine();
      const params = engine.getParams();
      expect(params.pattern.tempo).toBe(DEFAULT_DRUM_SEQUENCER_PARAMS.pattern.tempo);
      expect(params.pattern.swing).toBe(DEFAULT_DRUM_SEQUENCER_PARAMS.pattern.swing);
      expect(params.volume).toBe(DEFAULT_DRUM_SEQUENCER_PARAMS.volume);
      expect(params.isPlaying).toBe(false);
      expect(params.currentStep).toBe(0);
    });

    it('accepts initial params override', () => {
      const customPattern: DrumPattern = {
        name: 'Custom',
        tempo: 140,
        swing: 0.5,
        stepCount: 16,
        tracks: [
          {
            id: 'kick',
            name: 'Kick',
            sampleUrl: '/samples/drums/kick.wav',
            steps: Array(16).fill(null).map(() => ({ active: false, velocity: 0.8 })),
          },
        ],
      };
      const engine = createDrumSequencerEngine({
        pattern: customPattern,
        volume: -12,
      });
      const params = engine.getParams();
      expect(params.pattern.tempo).toBe(140);
      expect(params.pattern.swing).toBe(0.5);
      expect(params.volume).toBe(-12);
    });

    it('deep copies the pattern to prevent external mutation', () => {
      const customPattern: DrumPattern = {
        name: 'Test',
        tempo: 120,
        swing: 0,
        stepCount: 16,
        tracks: [{
          id: 'kick',
          name: 'Kick',
          sampleUrl: '/samples/drums/kick.wav',
          steps: Array(16).fill(null).map(() => ({ active: false, velocity: 0.8 })),
        }],
      };
      const engine = createDrumSequencerEngine({ pattern: customPattern });

      // Mutate original pattern
      customPattern.tempo = 200;
      customPattern.tracks[0].steps[0].active = true;

      // Engine should not be affected
      const params = engine.getParams();
      expect(params.pattern.tempo).toBe(120);
      expect(params.pattern.tracks[0].steps[0].active).toBe(false);
    });
  });

  describe('setTempo', () => {
    it('sets tempo within valid range', () => {
      engine.setTempo(140);
      expect(engine.getParams().pattern.tempo).toBe(140);
    });

    it('clamps tempo to maximum', () => {
      engine.setTempo(300);
      expect(engine.getParams().pattern.tempo).toBe(DRUM_SEQUENCER_RANGES.tempo.max);
    });

    it('clamps tempo to minimum', () => {
      engine.setTempo(30);
      expect(engine.getParams().pattern.tempo).toBe(DRUM_SEQUENCER_RANGES.tempo.min);
    });

    it('accepts boundary values', () => {
      engine.setTempo(DRUM_SEQUENCER_RANGES.tempo.min);
      expect(engine.getParams().pattern.tempo).toBe(DRUM_SEQUENCER_RANGES.tempo.min);

      engine.setTempo(DRUM_SEQUENCER_RANGES.tempo.max);
      expect(engine.getParams().pattern.tempo).toBe(DRUM_SEQUENCER_RANGES.tempo.max);
    });
  });

  describe('setSwing', () => {
    it('sets swing within valid range', () => {
      engine.setSwing(0.5);
      expect(engine.getParams().pattern.swing).toBe(0.5);
    });

    it('clamps swing to maximum (1)', () => {
      engine.setSwing(1.5);
      expect(engine.getParams().pattern.swing).toBe(1);
    });

    it('clamps swing to minimum (0)', () => {
      engine.setSwing(-0.5);
      expect(engine.getParams().pattern.swing).toBe(0);
    });

    it('accepts boundary values', () => {
      engine.setSwing(0);
      expect(engine.getParams().pattern.swing).toBe(0);

      engine.setSwing(1);
      expect(engine.getParams().pattern.swing).toBe(1);
    });
  });

  describe('setVolume', () => {
    it('sets volume within valid range', () => {
      engine.setVolume(-20);
      expect(engine.getParams().volume).toBe(-20);
    });

    it('clamps volume to maximum (0 dB)', () => {
      engine.setVolume(10);
      expect(engine.getParams().volume).toBe(DRUM_SEQUENCER_RANGES.volume.max);
    });

    it('clamps volume to minimum (-60 dB)', () => {
      engine.setVolume(-100);
      expect(engine.getParams().volume).toBe(DRUM_SEQUENCER_RANGES.volume.min);
    });
  });

  describe('toggleStep', () => {
    it('toggles step from inactive to active', () => {
      const params = engine.getParams();
      expect(params.pattern.tracks[0].steps[0].active).toBe(false);

      engine.toggleStep(0, 0);

      const updatedParams = engine.getParams();
      expect(updatedParams.pattern.tracks[0].steps[0].active).toBe(true);
    });

    it('toggles step from active to inactive', () => {
      engine.toggleStep(0, 0); // Make active
      engine.toggleStep(0, 0); // Toggle back

      const params = engine.getParams();
      expect(params.pattern.tracks[0].steps[0].active).toBe(false);
    });

    it('handles invalid track index gracefully', () => {
      expect(() => engine.toggleStep(99, 0)).not.toThrow();
    });

    it('handles invalid step index gracefully', () => {
      expect(() => engine.toggleStep(0, 99)).not.toThrow();
    });

    it('handles negative indices gracefully', () => {
      expect(() => engine.toggleStep(-1, 0)).not.toThrow();
      expect(() => engine.toggleStep(0, -1)).not.toThrow();
    });
  });

  describe('setStepActive', () => {
    it('sets step to active', () => {
      engine.setStepActive(0, 0, true);
      expect(engine.getParams().pattern.tracks[0].steps[0].active).toBe(true);
    });

    it('sets step to inactive', () => {
      engine.setStepActive(0, 0, true);
      engine.setStepActive(0, 0, false);
      expect(engine.getParams().pattern.tracks[0].steps[0].active).toBe(false);
    });

    it('handles invalid indices gracefully', () => {
      expect(() => engine.setStepActive(99, 0, true)).not.toThrow();
      expect(() => engine.setStepActive(0, 99, true)).not.toThrow();
    });
  });

  describe('setStepVelocity', () => {
    it('sets step velocity within valid range', () => {
      engine.setStepVelocity(0, 0, 0.5);
      expect(engine.getParams().pattern.tracks[0].steps[0].velocity).toBe(0.5);
    });

    it('clamps velocity to maximum (1)', () => {
      engine.setStepVelocity(0, 0, 1.5);
      expect(engine.getParams().pattern.tracks[0].steps[0].velocity).toBe(1);
    });

    it('clamps velocity to minimum (0)', () => {
      engine.setStepVelocity(0, 0, -0.5);
      expect(engine.getParams().pattern.tracks[0].steps[0].velocity).toBe(0);
    });

    it('handles invalid indices gracefully', () => {
      expect(() => engine.setStepVelocity(99, 0, 0.5)).not.toThrow();
      expect(() => engine.setStepVelocity(0, 99, 0.5)).not.toThrow();
    });
  });

  describe('clearTrack', () => {
    it('clears all steps in a track', () => {
      // Activate some steps
      engine.toggleStep(0, 0);
      engine.toggleStep(0, 4);
      engine.toggleStep(0, 8);

      // Verify steps are active
      let params = engine.getParams();
      expect(params.pattern.tracks[0].steps[0].active).toBe(true);
      expect(params.pattern.tracks[0].steps[4].active).toBe(true);
      expect(params.pattern.tracks[0].steps[8].active).toBe(true);

      // Clear track
      engine.clearTrack(0);

      // Verify all steps are cleared
      params = engine.getParams();
      expect(params.pattern.tracks[0].steps.every(s => !s.active)).toBe(true);
    });

    it('handles invalid track index gracefully', () => {
      expect(() => engine.clearTrack(99)).not.toThrow();
    });

    it('only clears the specified track', () => {
      // Activate steps on different tracks
      engine.toggleStep(0, 0);
      engine.toggleStep(1, 0);

      // Clear only track 0
      engine.clearTrack(0);

      const params = engine.getParams();
      expect(params.pattern.tracks[0].steps[0].active).toBe(false);
      expect(params.pattern.tracks[1].steps[0].active).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('clears all steps on all tracks', () => {
      // Activate steps on multiple tracks
      engine.toggleStep(0, 0);
      engine.toggleStep(0, 4);
      engine.toggleStep(1, 2);
      engine.toggleStep(2, 8);

      // Clear all
      engine.clearAll();

      // Verify all steps on all tracks are cleared
      const params = engine.getParams();
      params.pattern.tracks.forEach(track => {
        expect(track.steps.every(s => !s.active)).toBe(true);
      });
    });
  });

  describe('getPattern', () => {
    it('returns a deep copy of the pattern', () => {
      const pattern = engine.getPattern();

      // Mutate the returned pattern
      pattern.tempo = 200;
      pattern.tracks[0].steps[0].active = true;

      // Original should not be affected
      const originalParams = engine.getParams();
      expect(originalParams.pattern.tempo).toBe(120);
      expect(originalParams.pattern.tracks[0].steps[0].active).toBe(false);
    });
  });

  describe('getParams', () => {
    it('returns a deep copy of params', () => {
      const params = engine.getParams();

      // Mutate the returned params
      params.volume = 0;
      params.pattern.tempo = 200;

      // Original should not be affected
      const originalParams = engine.getParams();
      expect(originalParams.volume).toBe(DEFAULT_DRUM_SEQUENCER_PARAMS.volume);
      expect(originalParams.pattern.tempo).toBe(120);
    });

    it('includes all expected fields', () => {
      const params = engine.getParams();
      expect(params).toHaveProperty('pattern');
      expect(params).toHaveProperty('currentStep');
      expect(params).toHaveProperty('isPlaying');
      expect(params).toHaveProperty('selectedTrack');
      expect(params).toHaveProperty('volume');
    });
  });

  describe('getCurrentStep', () => {
    it('returns current step', () => {
      expect(engine.getCurrentStep()).toBe(0);
    });
  });

  describe('setSelectedTrack', () => {
    it('sets selected track', () => {
      engine.setSelectedTrack(1);
      expect(engine.getSelectedTrack()).toBe(1);
    });

    it('ignores invalid negative index', () => {
      engine.setSelectedTrack(-1);
      expect(engine.getSelectedTrack()).toBe(0); // Should remain at default
    });

    it('ignores out of bounds index', () => {
      engine.setSelectedTrack(99);
      expect(engine.getSelectedTrack()).toBe(0); // Should remain at default
    });
  });

  describe('onStepChange / offStepChange', () => {
    it('registers step change callback', () => {
      const callback = vi.fn();
      engine.onStepChange(callback);

      // The callback is stored internally, we can verify by calling getParams
      // after start() is called and the sequence runs
      expect(() => engine.onStepChange(callback)).not.toThrow();
    });

    it('removes step change callback', () => {
      const callback = vi.fn();
      engine.onStepChange(callback);
      engine.offStepChange();

      // Should not throw when removing
      expect(() => engine.offStepChange()).not.toThrow();
    });
  });

  describe('loaded property', () => {
    it('returns false before start is called', () => {
      expect(engine.loaded).toBe(false);
    });

    it('returns true after start is called', async () => {
      await engine.start();
      expect(engine.loaded).toBe(true);
    });
  });

  describe('playing property', () => {
    it('returns false initially', () => {
      expect(engine.playing).toBe(false);
    });
  });

  describe('start', () => {
    it('initializes Tone.js audio context', async () => {
      await engine.start();
      expect(Tone.start).toHaveBeenCalled();
    });

    it('only initializes once', async () => {
      await engine.start();
      await engine.start();
      expect(Tone.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('play/stop', () => {
    it('play does nothing before loaded', () => {
      engine.play();
      expect(engine.playing).toBe(false);
    });

    it('play starts transport after loaded', async () => {
      await engine.start();
      engine.play();
      expect(Tone.Transport.start).toHaveBeenCalled();
      expect(engine.playing).toBe(true);
    });

    it('stop resets playback state', async () => {
      await engine.start();
      engine.play();
      engine.stop();

      expect(Tone.Transport.stop).toHaveBeenCalled();
      expect(engine.playing).toBe(false);
      expect(engine.getCurrentStep()).toBe(0);
    });
  });

  describe('pause', () => {
    it('pauses without resetting position', async () => {
      await engine.start();
      engine.play();
      engine.pause();

      expect(Tone.Transport.pause).toHaveBeenCalled();
      expect(engine.playing).toBe(false);
    });
  });

  describe('setPattern', () => {
    it('sets a new pattern', async () => {
      const newPattern: DrumPattern = {
        name: 'New Pattern',
        tempo: 140,
        swing: 0.3,
        stepCount: 16,
        tracks: [{
          id: 'kick',
          name: 'Kick',
          sampleUrl: '/samples/drums/kick.wav',
          steps: Array(16).fill(null).map(() => ({ active: true, velocity: 1 })),
        }],
      };

      await engine.setPattern(newPattern);

      const params = engine.getParams();
      expect(params.pattern.tempo).toBe(140);
      expect(params.pattern.swing).toBe(0.3);
      expect(params.pattern.tracks[0].steps[0].active).toBe(true);
    });

    it('deep copies the pattern', async () => {
      const newPattern: DrumPattern = {
        name: 'Test',
        tempo: 150,
        swing: 0,
        stepCount: 16,
        tracks: [{
          id: 'kick',
          name: 'Kick',
          sampleUrl: '/samples/drums/kick.wav',
          steps: Array(16).fill(null).map(() => ({ active: false, velocity: 0.8 })),
        }],
      };

      await engine.setPattern(newPattern);

      // Mutate original
      newPattern.tempo = 200;
      newPattern.tracks[0].steps[0].active = true;

      // Engine should not be affected
      const params = engine.getParams();
      expect(params.pattern.tempo).toBe(150);
      expect(params.pattern.tracks[0].steps[0].active).toBe(false);
    });
  });

  describe('dispose', () => {
    it('disposes without throwing', () => {
      expect(() => engine.dispose()).not.toThrow();
    });

    it('disposes after start', async () => {
      await engine.start();
      expect(() => engine.dispose()).not.toThrow();
    });

    it('stops playback on dispose', async () => {
      await engine.start();
      engine.play();
      engine.dispose();

      expect(engine.playing).toBe(false);
    });

    it('sets loaded to false', async () => {
      await engine.start();
      expect(engine.loaded).toBe(true);

      engine.dispose();
      expect(engine.loaded).toBe(false);
    });
  });
});
