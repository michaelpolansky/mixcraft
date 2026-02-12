/**
 * Tests for getVizLayout / getVizDims
 * Verifies visualization mode behavior for ChallengeView
 */

import { describe, it, expect } from 'vitest';
import { getVizLayout, getVizDims, STANDARD_DIMS } from '../../data/module-controls.ts';
import type { ChallengeVisualization } from '../../core/types.ts';

const ALL_VIZ: ChallengeVisualization[] = ['spectrum', 'oscilloscope', 'filter', 'envelope', 'lfo', 'effects'];

describe('getVizLayout', () => {
  describe('default mode', () => {
    it('returns all panels unchanged', () => {
      const layout = getVizLayout(ALL_VIZ, 'default');
      expect(layout.panels).toEqual(ALL_VIZ);
    });

    it('returns empty dimensions (no overrides)', () => {
      const layout = getVizLayout(ALL_VIZ, 'default');
      expect(layout.dimensions).toEqual({});
    });

    it('passes through a limited panel list unchanged', () => {
      const layout = getVizLayout(['spectrum', 'filter'], 'default');
      expect(layout.panels).toEqual(['spectrum', 'filter']);
    });
  });

  describe('spectrum mode', () => {
    it('keeps only spectrum and oscilloscope', () => {
      const layout = getVizLayout(ALL_VIZ, 'spectrum');
      expect(layout.panels).toEqual(['spectrum', 'oscilloscope']);
    });

    it('expands spectrum height to 320', () => {
      const layout = getVizLayout(ALL_VIZ, 'spectrum');
      expect(layout.dimensions.spectrum).toEqual({ height: 320 });
    });

    it('compacts oscilloscope height to 60', () => {
      const layout = getVizLayout(ALL_VIZ, 'spectrum');
      expect(layout.dimensions.oscilloscope).toEqual({ height: 60 });
    });

    it('respects progressive visibility — no oscilloscope if not in source list', () => {
      const layout = getVizLayout(['spectrum', 'filter'], 'spectrum');
      expect(layout.panels).toEqual(['spectrum']);
    });
  });

  describe('waveform mode', () => {
    it('keeps only oscilloscope and spectrum', () => {
      const layout = getVizLayout(ALL_VIZ, 'waveform');
      expect(layout.panels).toEqual(['oscilloscope', 'spectrum']);
    });

    it('puts oscilloscope first (expanded)', () => {
      const layout = getVizLayout(ALL_VIZ, 'waveform');
      expect(layout.panels[0]).toBe('oscilloscope');
    });

    it('expands oscilloscope to 300px', () => {
      const layout = getVizLayout(ALL_VIZ, 'waveform');
      expect(layout.dimensions.oscilloscope).toEqual({ height: 300 });
    });

    it('compacts spectrum to 70px', () => {
      const layout = getVizLayout(ALL_VIZ, 'waveform');
      expect(layout.dimensions.spectrum).toEqual({ height: 70 });
    });

    it('returns only spectrum if oscilloscope not in source list', () => {
      const layout = getVizLayout(['spectrum', 'filter', 'envelope'], 'waveform');
      expect(layout.panels).toEqual(['spectrum']);
    });
  });

  describe('compare mode', () => {
    it('keeps only spectrum', () => {
      const layout = getVizLayout(ALL_VIZ, 'compare');
      expect(layout.panels).toEqual(['spectrum']);
    });

    it('sets spectrum to half-width (215px)', () => {
      const layout = getVizLayout(ALL_VIZ, 'compare');
      expect(layout.dimensions.spectrum).toEqual({ width: 215, height: 200 });
    });

    it('returns empty panels if spectrum not in source list', () => {
      const layout = getVizLayout(['oscilloscope', 'filter'], 'compare');
      expect(layout.panels).toEqual([]);
    });
  });

  describe('minimal mode', () => {
    it('keeps all panels from source list', () => {
      const layout = getVizLayout(ALL_VIZ, 'minimal');
      expect(layout.panels).toEqual(ALL_VIZ);
    });

    it('compacts spectrum to 80px height', () => {
      const layout = getVizLayout(ALL_VIZ, 'minimal');
      expect(layout.dimensions.spectrum).toEqual({ height: 80 });
    });

    it('compacts all other panels to 60px height', () => {
      const layout = getVizLayout(ALL_VIZ, 'minimal');
      expect(layout.dimensions.oscilloscope).toEqual({ height: 60 });
      expect(layout.dimensions.filter).toEqual({ height: 60 });
      expect(layout.dimensions.envelope).toEqual({ height: 60 });
      expect(layout.dimensions.lfo).toEqual({ height: 60 });
      expect(layout.dimensions.effects).toEqual({ height: 60 });
    });
  });

  describe('empty source list', () => {
    it('returns empty panels for any mode', () => {
      expect(getVizLayout([], 'default').panels).toEqual([]);
      expect(getVizLayout([], 'spectrum').panels).toEqual([]);
      expect(getVizLayout([], 'compare').panels).toEqual([]);
    });
  });
});

describe('getVizDims', () => {
  it('returns standard dimensions when no override', () => {
    const layout = getVizLayout(ALL_VIZ, 'default');
    expect(getVizDims('spectrum', layout)).toEqual(STANDARD_DIMS.spectrum);
    expect(getVizDims('oscilloscope', layout)).toEqual(STANDARD_DIMS.oscilloscope);
  });

  it('applies height override from spectrum mode', () => {
    const layout = getVizLayout(ALL_VIZ, 'spectrum');
    const dims = getVizDims('spectrum', layout);
    expect(dims.height).toBe(320);
    expect(dims.width).toBe(450); // standard width preserved
  });

  it('applies width override from compare mode', () => {
    const layout = getVizLayout(ALL_VIZ, 'compare');
    const dims = getVizDims('spectrum', layout);
    expect(dims.width).toBe(215);
    expect(dims.height).toBe(200);
  });

  it('returns standard dims for panels not in override map', () => {
    const layout = getVizLayout(ALL_VIZ, 'spectrum');
    // filter is not in spectrum mode's override map
    expect(getVizDims('filter', layout)).toEqual(STANDARD_DIMS.filter);
  });

  it('returns correct minimal dimensions', () => {
    const layout = getVizLayout(ALL_VIZ, 'minimal');
    expect(getVizDims('spectrum', layout)).toEqual({ width: 450, height: 80 });
    expect(getVizDims('envelope', layout)).toEqual({ width: 450, height: 60 });
  });
});
