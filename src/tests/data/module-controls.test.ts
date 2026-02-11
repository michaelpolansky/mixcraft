/**
 * Tests for module-controls.ts
 * Verifies progressive control visibility for sound design challenges
 */

import { describe, it, expect } from 'vitest';
import { getAvailableControls, isControlVisible, isSectionVisible, getVisualizations } from '../../data/module-controls.ts';
import type { Challenge, SynthAvailableControls } from '../../core/types.ts';
import { DEFAULT_SYNTH_PARAMS } from '../../core/types.ts';

/** Minimal challenge factory for testing */
function makeChallenge(module: string, overrides?: SynthAvailableControls): Challenge {
  return {
    id: `test-${module}`,
    title: 'Test',
    description: 'Test',
    difficulty: 1,
    targetParams: DEFAULT_SYNTH_PARAMS,
    hints: [],
    module,
    testNote: 'C4',
    ...(overrides ? { availableControls: overrides } : {}),
  };
}

describe('getAvailableControls', () => {
  describe('module defaults', () => {
    it('SD1: only oscillator and output', () => {
      const controls = getAvailableControls(makeChallenge('SD1'));
      expect(controls.oscillator).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.filter).toBeUndefined();
      expect(controls.amplitudeEnvelope).toBeUndefined();
      expect(controls.filterEnvelope).toBeUndefined();
      expect(controls.lfo).toBeUndefined();
      expect(controls.effects).toBeUndefined();
    });

    it('SD2: adds filter', () => {
      const controls = getAvailableControls(makeChallenge('SD2'));
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.amplitudeEnvelope).toBeUndefined();
      expect(controls.filterEnvelope).toBeUndefined();
      expect(controls.lfo).toBeUndefined();
      expect(controls.effects).toBeUndefined();
    });

    it('SD3: adds both envelopes', () => {
      const controls = getAvailableControls(makeChallenge('SD3'));
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.amplitudeEnvelope).toBe(true);
      expect(controls.filterEnvelope).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.lfo).toBeUndefined();
      expect(controls.effects).toBeUndefined();
    });

    it('SD4: adds LFO', () => {
      const controls = getAvailableControls(makeChallenge('SD4'));
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.amplitudeEnvelope).toBe(true);
      expect(controls.filterEnvelope).toBe(true);
      expect(controls.lfo).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.effects).toBeUndefined();
    });
  });

  describe('fallback for advanced modules', () => {
    it('SD5: all controls visible', () => {
      const controls = getAvailableControls(makeChallenge('SD5'));
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.amplitudeEnvelope).toBe(true);
      expect(controls.filterEnvelope).toBe(true);
      expect(controls.lfo).toBe(true);
      expect(controls.effects).toBe(true);
      expect(controls.output).toBe(true);
    });

    it('SD10: all controls visible', () => {
      const controls = getAvailableControls(makeChallenge('SD10'));
      expect(controls.oscillator).toBe(true);
      expect(controls.effects).toBe(true);
    });

    it('SD17: all controls visible', () => {
      const controls = getAvailableControls(makeChallenge('SD17'));
      expect(controls.oscillator).toBe(true);
      expect(controls.effects).toBe(true);
    });
  });

  describe('unknown module fallback', () => {
    it('returns all controls for unknown module', () => {
      const controls = getAvailableControls(makeChallenge('UNKNOWN'));
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.amplitudeEnvelope).toBe(true);
      expect(controls.filterEnvelope).toBe(true);
      expect(controls.lfo).toBe(true);
      expect(controls.effects).toBe(true);
      expect(controls.output).toBe(true);
    });

    it('returns all controls for FM module (not subtractive)', () => {
      const controls = getAvailableControls(makeChallenge('SD8'));
      expect(controls.oscillator).toBe(true);
      expect(controls.effects).toBe(true);
    });
  });

  describe('per-challenge override', () => {
    it('override takes priority over module default', () => {
      const override: SynthAvailableControls = {
        oscillator: true,
        filter: true,
        effects: true,
        output: true,
      };
      const controls = getAvailableControls(makeChallenge('SD1', override));
      // SD1 normally only has oscillator + output, but override adds filter and effects
      expect(controls.oscillator).toBe(true);
      expect(controls.filter).toBe(true);
      expect(controls.effects).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.amplitudeEnvelope).toBeUndefined();
    });

    it('override can restrict a normally-full module', () => {
      const override: SynthAvailableControls = {
        oscillator: true,
        output: true,
      };
      const controls = getAvailableControls(makeChallenge('SD7', override));
      // SD7 normally has all controls, but override restricts to oscillator + output
      expect(controls.oscillator).toBe(true);
      expect(controls.output).toBe(true);
      expect(controls.filter).toBeUndefined();
      expect(controls.lfo).toBeUndefined();
    });

    it('override with per-control objects takes priority', () => {
      const override: SynthAvailableControls = {
        oscillator: { waveform: true },
        filter: { cutoff: true, resonance: true },
        output: true,
      };
      const controls = getAvailableControls(makeChallenge('SD1', override));
      expect(controls.oscillator).toEqual({ waveform: true });
      expect(controls.filter).toEqual({ cutoff: true, resonance: true });
      expect(controls.output).toBe(true);
      expect(controls.amplitudeEnvelope).toBeUndefined();
    });
  });

  describe('progressive complexity ordering', () => {
    it('each module adds controls cumulatively', () => {
      const sd1 = getAvailableControls(makeChallenge('SD1'));
      const sd2 = getAvailableControls(makeChallenge('SD2'));
      const sd3 = getAvailableControls(makeChallenge('SD3'));
      const sd4 = getAvailableControls(makeChallenge('SD4'));
      const sd5 = getAvailableControls(makeChallenge('SD5'));

      const countTrue = (c: SynthAvailableControls) =>
        Object.values(c).filter((v) => v === true).length;

      // Each module should have >= controls as the previous
      expect(countTrue(sd2)).toBeGreaterThan(countTrue(sd1));
      expect(countTrue(sd3)).toBeGreaterThan(countTrue(sd2));
      expect(countTrue(sd4)).toBeGreaterThan(countTrue(sd3));
      expect(countTrue(sd5)).toBeGreaterThan(countTrue(sd4));
    });
  });
});

describe('isControlVisible', () => {
  it('returns false for undefined section', () => {
    expect(isControlVisible(undefined, 'waveform')).toBe(false);
  });

  it('returns false for false section', () => {
    expect(isControlVisible(false, 'waveform')).toBe(false);
  });

  it('returns true for any control when section is true (show-all)', () => {
    expect(isControlVisible(true, 'waveform')).toBe(true);
    expect(isControlVisible(true, 'octave')).toBe(true);
    expect(isControlVisible(true, 'nonexistent')).toBe(true);
  });

  it('returns true only for explicitly-true controls in object mode', () => {
    const section = { waveform: true, octave: true, detune: false };
    expect(isControlVisible(section, 'waveform')).toBe(true);
    expect(isControlVisible(section, 'octave')).toBe(true);
    expect(isControlVisible(section, 'detune')).toBe(false);
  });

  it('returns false for controls not in the object', () => {
    const section = { waveform: true };
    expect(isControlVisible(section, 'octave')).toBe(false);
    expect(isControlVisible(section, 'detune')).toBe(false);
  });

  it('returns false for empty object (no controls specified)', () => {
    expect(isControlVisible({}, 'waveform')).toBe(false);
  });
});

describe('isSectionVisible', () => {
  it('returns false for undefined', () => {
    expect(isSectionVisible(undefined)).toBe(false);
  });

  it('returns false for false', () => {
    expect(isSectionVisible(false)).toBe(false);
  });

  it('returns true for true (show-all)', () => {
    expect(isSectionVisible(true)).toBe(true);
  });

  it('returns true if any control in object is true', () => {
    expect(isSectionVisible({ waveform: true })).toBe(true);
    expect(isSectionVisible({ waveform: false, octave: true })).toBe(true);
  });

  it('returns false if all controls in object are false', () => {
    expect(isSectionVisible({ waveform: false, octave: false })).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(isSectionVisible({})).toBe(false);
  });
});

describe('getVisualizations', () => {
  it('returns per-challenge visualizations when set', () => {
    const challenge = makeChallenge('SD1', {
      oscillator: { waveform: true },
      output: true,
      visualizations: ['spectrum', 'oscilloscope', 'filter'],
    });
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'oscilloscope', 'filter']);
  });

  it('falls back to module-based default for SD1', () => {
    const challenge = makeChallenge('SD1');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'oscilloscope']);
  });

  it('falls back to module-based default for SD2', () => {
    const challenge = makeChallenge('SD2');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'filter']);
  });

  it('falls back to module-based default for SD3', () => {
    const challenge = makeChallenge('SD3');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'envelope']);
  });

  it('falls back to module-based default for SD4', () => {
    const challenge = makeChallenge('SD4');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'lfo']);
  });

  it('falls back to module-based default for SD5', () => {
    const challenge = makeChallenge('SD5');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'effects']);
  });

  it('returns spectrum + oscilloscope for unknown modules', () => {
    const challenge = makeChallenge('SD10');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'oscilloscope']);
  });

  it('returns spectrum + oscilloscope for non-SD modules', () => {
    const challenge = makeChallenge('SD8');
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'oscilloscope']);
  });

  it('per-challenge override supersedes module default', () => {
    // SD2 would default to ['spectrum', 'filter'] but override changes it
    const challenge = makeChallenge('SD2', {
      oscillator: true,
      filter: true,
      output: true,
      visualizations: ['spectrum', 'filter', 'envelope'],
    });
    expect(getVisualizations(challenge)).toEqual(['spectrum', 'filter', 'envelope']);
  });
});
