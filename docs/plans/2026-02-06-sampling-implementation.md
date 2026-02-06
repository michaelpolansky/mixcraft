# Sampling Track Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Sampling curriculum track with sampler engine, waveform editor UI, and 24 challenges (SM1-SM6).

**Architecture:** Create a SamplerEngine class wrapping Tone.js Player/GrainPlayer for sample playback with pitch/time manipulation. Build a WaveformEditor component for visual editing with slice markers. Sampling challenges use audio similarity comparison for evaluation.

**Tech Stack:** Tone.js (Player, GrainPlayer), Canvas 2D (waveform display), Zustand (state), existing sound-analysis.ts for evaluation.

---

## Task 1: Sampler Types

**Files:**
- Modify: `src/core/types.ts`

**Step 1: Add sampler type definitions to types.ts**

Add after the existing synth types (around line 200):

```typescript
// ============================================
// Sampler Types
// ============================================

export interface SampleSlice {
  /** Unique slice ID */
  id: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Playback pitch offset in semitones (-24 to +24) */
  pitch: number;
  /** Velocity/volume (0 to 1) */
  velocity: number;
}

export interface SamplerParams {
  /** URL or path to the loaded sample */
  sampleUrl: string | null;
  /** Sample name for display */
  sampleName: string;
  /** Sample duration in seconds */
  duration: number;
  /** Global pitch offset in semitones (-24 to +24) */
  pitch: number;
  /** Time stretch ratio (0.5 to 2.0, 1.0 = original) */
  timeStretch: number;
  /** Playback start point (0 to 1, normalized) */
  startPoint: number;
  /** Playback end point (0 to 1, normalized) */
  endPoint: number;
  /** Loop enabled */
  loop: boolean;
  /** Reverse playback */
  reverse: boolean;
  /** Slices for chopping */
  slices: SampleSlice[];
  /** Currently selected slice index (-1 for full sample) */
  selectedSlice: number;
  /** Master volume in dB (-60 to 0) */
  volume: number;
  /** Fade in time in seconds */
  fadeIn: number;
  /** Fade out time in seconds */
  fadeOut: number;
}

export const DEFAULT_SAMPLER_PARAMS: SamplerParams = {
  sampleUrl: null,
  sampleName: '',
  duration: 0,
  pitch: 0,
  timeStretch: 1.0,
  startPoint: 0,
  endPoint: 1,
  loop: false,
  reverse: false,
  slices: [],
  selectedSlice: -1,
  volume: -6,
  fadeIn: 0.01,
  fadeOut: 0.01,
};

export const SAMPLER_PARAM_RANGES = {
  pitch: { min: -24, max: 24, step: 1 },
  timeStretch: { min: 0.5, max: 2.0, step: 0.01 },
  volume: { min: -60, max: 0, step: 0.5 },
  fadeIn: { min: 0, max: 0.5, step: 0.01 },
  fadeOut: { min: 0, max: 0.5, step: 0.01 },
};
```

**Step 2: Run TypeScript check**

Run: `bun run build 2>&1 | head -20`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/core/types.ts
git commit -m "feat(sampling): add sampler type definitions"
```

---

## Task 2: Sampler Engine - Basic Playback

**Files:**
- Create: `src/core/sampler-engine.ts`
- Create: `src/tests/core/sampler-engine.test.ts`

**Step 1: Write failing test for basic sampler**

```typescript
// src/tests/core/sampler-engine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Tone.js
vi.mock('tone', () => ({
  Player: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    loaded: true,
    buffer: { duration: 2.0 },
    playbackRate: 1,
    reverse: false,
    volume: { value: 0 },
    connect: vi.fn(),
  })),
  GrainPlayer: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    loaded: true,
    buffer: { duration: 2.0 },
    playbackRate: 1,
    detune: 0,
    reverse: false,
    volume: { value: 0 },
    connect: vi.fn(),
  })),
  getContext: vi.fn().mockReturnValue({
    rawContext: {
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 2048,
        frequencyBinCount: 1024,
        connect: vi.fn(),
        getFloatTimeDomainData: vi.fn(),
      }),
    },
  }),
  Gain: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  start: vi.fn(),
}));

import { SamplerEngine, createSamplerEngine } from '../../core/sampler-engine.ts';
import { DEFAULT_SAMPLER_PARAMS } from '../../core/types.ts';

describe('SamplerEngine', () => {
  describe('createSamplerEngine', () => {
    it('should create a sampler with default params', () => {
      const sampler = createSamplerEngine();
      expect(sampler).toBeInstanceOf(SamplerEngine);
      expect(sampler.getParams()).toEqual(DEFAULT_SAMPLER_PARAMS);
    });

    it('should create a sampler with custom params', () => {
      const customParams = { ...DEFAULT_SAMPLER_PARAMS, pitch: 5, volume: -12 };
      const sampler = createSamplerEngine(customParams);
      expect(sampler.getParams().pitch).toBe(5);
      expect(sampler.getParams().volume).toBe(-12);
    });
  });

  describe('pitch control', () => {
    it('should update pitch', () => {
      const sampler = createSamplerEngine();
      sampler.setPitch(7);
      expect(sampler.getParams().pitch).toBe(7);
    });

    it('should clamp pitch to valid range', () => {
      const sampler = createSamplerEngine();
      sampler.setPitch(30);
      expect(sampler.getParams().pitch).toBe(24);
      sampler.setPitch(-30);
      expect(sampler.getParams().pitch).toBe(-24);
    });
  });

  describe('time stretch control', () => {
    it('should update time stretch', () => {
      const sampler = createSamplerEngine();
      sampler.setTimeStretch(1.5);
      expect(sampler.getParams().timeStretch).toBe(1.5);
    });

    it('should clamp time stretch to valid range', () => {
      const sampler = createSamplerEngine();
      sampler.setTimeStretch(3.0);
      expect(sampler.getParams().timeStretch).toBe(2.0);
      sampler.setTimeStretch(0.1);
      expect(sampler.getParams().timeStretch).toBe(0.5);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/tests/core/sampler-engine.test.ts`
Expected: FAIL - module not found

**Step 3: Implement SamplerEngine**

```typescript
// src/core/sampler-engine.ts
/**
 * MIXCRAFT Sampler Engine
 * Wraps Tone.js Player/GrainPlayer for sample playback with pitch/time manipulation
 */

import * as Tone from 'tone';
import type { SamplerParams, SampleSlice } from './types.ts';
import { DEFAULT_SAMPLER_PARAMS, SAMPLER_PARAM_RANGES } from './types.ts';

/**
 * Clamp a value to a range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert semitones to playback rate
 */
function semitonesToRate(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

/**
 * SamplerEngine class - wraps Tone.js for sample playback
 */
export class SamplerEngine {
  private player: Tone.Player | null = null;
  private grainPlayer: Tone.GrainPlayer | null = null;
  private outputGain: Tone.Gain;
  private analyser: AnalyserNode;
  private params: SamplerParams;
  private audioBuffer: AudioBuffer | null = null;
  private waveformData: Float32Array | null = null;
  private isPlaying = false;

  constructor(initialParams: Partial<SamplerParams> = {}) {
    this.params = { ...DEFAULT_SAMPLER_PARAMS, ...initialParams };

    // Create output gain
    this.outputGain = new Tone.Gain(this.dbToGain(this.params.volume));
    this.outputGain.toDestination();

    // Create analyser
    const context = Tone.getContext();
    this.analyser = context.rawContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.outputGain.connect(this.analyser);
  }

  /**
   * Load a sample from URL
   */
  async loadSample(url: string, name: string = 'Sample'): Promise<void> {
    // Dispose existing players
    this.disposePlayer();

    // Create new player
    this.player = new Tone.Player(url);
    await Tone.loaded();

    if (this.player.buffer) {
      this.params.sampleUrl = url;
      this.params.sampleName = name;
      this.params.duration = this.player.buffer.duration;
      this.audioBuffer = this.player.buffer.get() as AudioBuffer;
      this.generateWaveformData();
    }

    this.player.connect(this.outputGain);
    this.applyParams();
  }

  /**
   * Generate waveform data for visualization
   */
  private generateWaveformData(): void {
    if (!this.audioBuffer) return;

    const channelData = this.audioBuffer.getChannelData(0);
    const samples = 1000; // Number of points for visualization
    const blockSize = Math.floor(channelData.length / samples);
    this.waveformData = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let max = 0;
      for (let j = 0; j < blockSize; j++) {
        const abs = Math.abs(channelData[start + j] || 0);
        if (abs > max) max = abs;
      }
      this.waveformData[i] = max;
    }
  }

  /**
   * Get waveform data for visualization
   */
  getWaveformData(): Float32Array | null {
    return this.waveformData;
  }

  /**
   * Apply current params to player
   */
  private applyParams(): void {
    if (this.player) {
      this.player.playbackRate = semitonesToRate(this.params.pitch);
      this.player.reverse = this.params.reverse;
    }
    this.outputGain.gain.value = this.dbToGain(this.params.volume);
  }

  /**
   * Convert dB to linear gain
   */
  private dbToGain(db: number): number {
    return Math.pow(10, db / 20);
  }

  /**
   * Start playback
   */
  start(time?: number): void {
    if (!this.player || !this.player.loaded) return;

    const startOffset = this.params.startPoint * this.params.duration;
    const endOffset = this.params.endPoint * this.params.duration;
    const duration = endOffset - startOffset;

    this.player.start(time, startOffset, duration);
    this.isPlaying = true;
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.player) {
      this.player.stop();
    }
    this.isPlaying = false;
  }

  /**
   * Trigger one-shot playback (for pads/slices)
   */
  triggerSlice(sliceIndex: number): void {
    if (!this.player || sliceIndex < 0 || sliceIndex >= this.params.slices.length) return;

    const slice = this.params.slices[sliceIndex];
    const duration = slice.end - slice.start;

    this.player.playbackRate = semitonesToRate(this.params.pitch + slice.pitch);
    this.player.start(undefined, slice.start, duration);
  }

  /**
   * Set pitch in semitones
   */
  setPitch(semitones: number): void {
    this.params.pitch = clamp(
      semitones,
      SAMPLER_PARAM_RANGES.pitch.min,
      SAMPLER_PARAM_RANGES.pitch.max
    );
    this.applyParams();
  }

  /**
   * Set time stretch ratio
   */
  setTimeStretch(ratio: number): void {
    this.params.timeStretch = clamp(
      ratio,
      SAMPLER_PARAM_RANGES.timeStretch.min,
      SAMPLER_PARAM_RANGES.timeStretch.max
    );
    // Time stretch requires GrainPlayer - implement in next task
  }

  /**
   * Set start point (0 to 1)
   */
  setStartPoint(point: number): void {
    this.params.startPoint = clamp(point, 0, this.params.endPoint - 0.01);
  }

  /**
   * Set end point (0 to 1)
   */
  setEndPoint(point: number): void {
    this.params.endPoint = clamp(point, this.params.startPoint + 0.01, 1);
  }

  /**
   * Set loop enabled
   */
  setLoop(enabled: boolean): void {
    this.params.loop = enabled;
    if (this.player) {
      this.player.loop = enabled;
    }
  }

  /**
   * Set reverse playback
   */
  setReverse(enabled: boolean): void {
    this.params.reverse = enabled;
    this.applyParams();
  }

  /**
   * Set volume in dB
   */
  setVolume(db: number): void {
    this.params.volume = clamp(
      db,
      SAMPLER_PARAM_RANGES.volume.min,
      SAMPLER_PARAM_RANGES.volume.max
    );
    this.applyParams();
  }

  /**
   * Add a slice
   */
  addSlice(start: number, end: number): SampleSlice {
    const slice: SampleSlice = {
      id: `slice-${Date.now()}`,
      start,
      end,
      pitch: 0,
      velocity: 1,
    };
    this.params.slices.push(slice);
    return slice;
  }

  /**
   * Remove a slice
   */
  removeSlice(id: string): void {
    this.params.slices = this.params.slices.filter(s => s.id !== id);
  }

  /**
   * Auto-slice based on transients (simple threshold detection)
   */
  autoSlice(numSlices: number = 8): void {
    if (!this.audioBuffer) return;

    this.params.slices = [];
    const sliceDuration = this.params.duration / numSlices;

    for (let i = 0; i < numSlices; i++) {
      this.addSlice(i * sliceDuration, (i + 1) * sliceDuration);
    }
  }

  /**
   * Get analyser node for visualization
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * Get current params
   */
  getParams(): SamplerParams {
    return { ...this.params };
  }

  /**
   * Get playing state
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Dispose player resources
   */
  private disposePlayer(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    if (this.grainPlayer) {
      this.grainPlayer.dispose();
      this.grainPlayer = null;
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.disposePlayer();
    this.outputGain.dispose();
  }
}

/**
 * Factory function to create a SamplerEngine
 */
export function createSamplerEngine(params: Partial<SamplerParams> = {}): SamplerEngine {
  return new SamplerEngine(params);
}
```

**Step 4: Run test to verify it passes**

Run: `bun run test src/tests/core/sampler-engine.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/sampler-engine.ts src/tests/core/sampler-engine.test.ts
git commit -m "feat(sampling): add SamplerEngine with basic playback"
```

---

## Task 3: Sampler Store (Zustand)

**Files:**
- Create: `src/ui/stores/sampler-store.ts`

**Step 1: Create the sampler store**

```typescript
// src/ui/stores/sampler-store.ts
/**
 * Sampler Store
 * Manages sampler state with Zustand
 */

import { create } from 'zustand';
import type { SamplerParams, SampleSlice } from '../../core/types.ts';
import { DEFAULT_SAMPLER_PARAMS } from '../../core/types.ts';
import { SamplerEngine, createSamplerEngine } from '../../core/sampler-engine.ts';

interface SamplerState {
  // Engine
  engine: SamplerEngine | null;
  isInitialized: boolean;
  isPlaying: boolean;
  isLoading: boolean;

  // Params (mirror of engine state for UI reactivity)
  params: SamplerParams;

  // Actions
  initEngine: () => void;
  loadSample: (url: string, name?: string) => Promise<void>;
  play: () => void;
  stop: () => void;
  triggerSlice: (index: number) => void;

  // Parameter setters
  setPitch: (semitones: number) => void;
  setTimeStretch: (ratio: number) => void;
  setStartPoint: (point: number) => void;
  setEndPoint: (point: number) => void;
  setLoop: (enabled: boolean) => void;
  setReverse: (enabled: boolean) => void;
  setVolume: (db: number) => void;

  // Slice management
  addSlice: (start: number, end: number) => void;
  removeSlice: (id: string) => void;
  autoSlice: (numSlices?: number) => void;
  setSelectedSlice: (index: number) => void;

  // Utility
  getAnalyser: () => AnalyserNode | null;
  getWaveformData: () => Float32Array | null;
}

export const useSamplerStore = create<SamplerState>((set, get) => ({
  // Initial state
  engine: null,
  isInitialized: false,
  isPlaying: false,
  isLoading: false,
  params: DEFAULT_SAMPLER_PARAMS,

  // Initialize engine
  initEngine: () => {
    const engine = createSamplerEngine();
    set({ engine, isInitialized: true });
  },

  // Load sample
  loadSample: async (url: string, name?: string) => {
    const { engine } = get();
    if (!engine) return;

    set({ isLoading: true });
    try {
      await engine.loadSample(url, name);
      set({ params: engine.getParams(), isLoading: false });
    } catch (error) {
      console.error('Failed to load sample:', error);
      set({ isLoading: false });
    }
  },

  // Playback
  play: () => {
    const { engine } = get();
    if (!engine) return;
    engine.start();
    set({ isPlaying: true });
  },

  stop: () => {
    const { engine } = get();
    if (!engine) return;
    engine.stop();
    set({ isPlaying: false });
  },

  triggerSlice: (index: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.triggerSlice(index);
  },

  // Parameter setters
  setPitch: (semitones: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setPitch(semitones);
    set({ params: engine.getParams() });
  },

  setTimeStretch: (ratio: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setTimeStretch(ratio);
    set({ params: engine.getParams() });
  },

  setStartPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setStartPoint(point);
    set({ params: engine.getParams() });
  },

  setEndPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setEndPoint(point);
    set({ params: engine.getParams() });
  },

  setLoop: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;
    engine.setLoop(enabled);
    set({ params: engine.getParams() });
  },

  setReverse: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;
    engine.setReverse(enabled);
    set({ params: engine.getParams() });
  },

  setVolume: (db: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setVolume(db);
    set({ params: engine.getParams() });
  },

  // Slice management
  addSlice: (start: number, end: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.addSlice(start, end);
    set({ params: engine.getParams() });
  },

  removeSlice: (id: string) => {
    const { engine } = get();
    if (!engine) return;
    engine.removeSlice(id);
    set({ params: engine.getParams() });
  },

  autoSlice: (numSlices?: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.autoSlice(numSlices);
    set({ params: engine.getParams() });
  },

  setSelectedSlice: (index: number) => {
    set((state) => ({
      params: { ...state.params, selectedSlice: index },
    }));
  },

  // Utility
  getAnalyser: () => {
    const { engine } = get();
    return engine?.getAnalyser() ?? null;
  },

  getWaveformData: () => {
    const { engine } = get();
    return engine?.getWaveformData() ?? null;
  },
}));
```

**Step 2: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/ui/stores/sampler-store.ts
git commit -m "feat(sampling): add Zustand sampler store"
```

---

## Task 4: Waveform Editor Component

**Files:**
- Create: `src/ui/components/WaveformEditor.tsx`
- Modify: `src/ui/components/index.ts`

**Step 1: Create WaveformEditor component**

```typescript
// src/ui/components/WaveformEditor.tsx
/**
 * Waveform Editor
 * Visual sample editor with waveform display and slice markers
 */

import { useRef, useEffect, useCallback, useState } from 'react';

interface WaveformEditorProps {
  /** Waveform data (normalized peak values) */
  waveformData: Float32Array | null;
  /** Sample duration in seconds */
  duration: number;
  /** Start point (0-1) */
  startPoint: number;
  /** End point (0-1) */
  endPoint: number;
  /** Slice markers */
  slices: Array<{ id: string; start: number; end: number }>;
  /** Selected slice index */
  selectedSlice: number;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color */
  accentColor?: string;
  /** Callbacks */
  onStartPointChange?: (point: number) => void;
  onEndPointChange?: (point: number) => void;
  onSliceSelect?: (index: number) => void;
  onAddSlice?: (start: number, end: number) => void;
}

export function WaveformEditor({
  waveformData,
  duration,
  startPoint,
  endPoint,
  slices,
  selectedSlice,
  width = 600,
  height = 150,
  accentColor = '#4ade80',
  onStartPointChange,
  onEndPointChange,
  onSliceSelect,
  onAddSlice,
}: WaveformEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
  };

  // Draw waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 8;
    const waveHeight = height - padding * 2 - 20; // Leave room for time display
    const centerY = padding + waveHeight / 2;

    // Clear
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Draw selection region
    const startX = startPoint * width;
    const endX = endPoint * width;

    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.fillRect(startX, 0, endX - startX, height - 20);

    // Draw waveform
    if (waveformData && waveformData.length > 0) {
      ctx.beginPath();

      const barWidth = width / waveformData.length;
      for (let i = 0; i < waveformData.length; i++) {
        const x = i * barWidth;
        const amplitude = waveformData[i] * (waveHeight / 2);

        // Color based on selection
        const normalized = i / waveformData.length;
        const inSelection = normalized >= startPoint && normalized <= endPoint;

        ctx.fillStyle = inSelection ? accentColor : '#444';
        ctx.fillRect(x, centerY - amplitude, barWidth - 1, amplitude * 2);
      }
    } else {
      // No waveform - draw placeholder
      ctx.strokeStyle = '#333';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#555';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Drop sample here or click to load', width / 2, centerY);
    }

    // Draw slice markers
    slices.forEach((slice, index) => {
      const sliceStartX = (slice.start / duration) * width;
      const sliceEndX = (slice.end / duration) * width;

      ctx.strokeStyle = index === selectedSlice ? '#f97316' : '#666';
      ctx.lineWidth = index === selectedSlice ? 2 : 1;

      // Start line
      ctx.beginPath();
      ctx.moveTo(sliceStartX, 0);
      ctx.lineTo(sliceStartX, height - 20);
      ctx.stroke();

      // Slice number
      ctx.fillStyle = index === selectedSlice ? '#f97316' : '#888';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, (sliceStartX + sliceEndX) / 2, 12);
    });

    // Draw start/end handles
    ctx.fillStyle = accentColor;

    // Start handle
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX + 8, 10);
    ctx.lineTo(startX, 20);
    ctx.closePath();
    ctx.fill();

    // End handle
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX - 8, 10);
    ctx.lineTo(endX, 20);
    ctx.closePath();
    ctx.fill();

    // Draw time markers
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(startPoint * duration), startX + 4, height - 6);
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(endPoint * duration), endX - 4, height - 6);

    // Duration
    ctx.textAlign = 'center';
    ctx.fillText(formatTime(duration), width / 2, height - 6);

    // Hover position
    if (hoverX !== null) {
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText(formatTime((hoverX / width) * duration), hoverX, height - 24);
    }
  }, [waveformData, duration, startPoint, endPoint, slices, selectedSlice, width, height, accentColor, hoverX]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const startX = startPoint * width;
    const endX = endPoint * width;

    // Check if clicking near handles
    if (Math.abs(x - startX) < 10) {
      setIsDragging('start');
    } else if (Math.abs(x - endX) < 10) {
      setIsDragging('end');
    } else {
      // Check if clicking a slice
      const clickedSlice = slices.findIndex((slice) => {
        const sliceStartX = (slice.start / duration) * width;
        const sliceEndX = (slice.end / duration) * width;
        return x >= sliceStartX && x <= sliceEndX;
      });

      if (clickedSlice >= 0) {
        onSliceSelect?.(clickedSlice);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    setHoverX(x);

    if (isDragging) {
      const point = Math.max(0, Math.min(1, x / width));

      if (isDragging === 'start') {
        onStartPointChange?.(point);
      } else {
        onEndPointChange?.(point);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setIsDragging(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;

    const x = e.clientX - rect.left;
    const time = (x / width) * duration;

    // Add a slice at this position (1/8 of duration)
    const sliceDuration = duration / 8;
    onAddSlice?.(time, Math.min(time + sliceDuration, duration));
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        borderRadius: '8px',
        cursor: isDragging ? 'ew-resize' : 'crosshair',
        display: 'block',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    />
  );
}
```

**Step 2: Export from index.ts**

Add to `src/ui/components/index.ts`:

```typescript
export { WaveformEditor } from './WaveformEditor.tsx';
```

**Step 3: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/ui/components/WaveformEditor.tsx src/ui/components/index.ts
git commit -m "feat(sampling): add WaveformEditor component"
```

---

## Task 5: SamplerView (Sandbox)

**Files:**
- Create: `src/ui/views/SamplerView.tsx`
- Modify: `src/App.tsx` (add route)

**Step 1: Create SamplerView**

```typescript
// src/ui/views/SamplerView.tsx
/**
 * Sampler View
 * Sandbox for sample manipulation
 */

import { useEffect } from 'react';
import { useSamplerStore } from '../stores/sampler-store.ts';
import {
  Knob,
  WaveformEditor,
  SpectrumAnalyzer,
  InfoPanel,
} from '../components/index.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { SAMPLER_PARAM_RANGES } from '../../core/types.ts';

// Sample library for demo
const SAMPLE_LIBRARY = [
  { name: 'Drum Break', url: '/samples/drum-break.wav' },
  { name: 'Vocal Chop', url: '/samples/vocal-chop.wav' },
  { name: 'Bass Hit', url: '/samples/bass-hit.wav' },
  { name: 'Piano Loop', url: '/samples/piano-loop.wav' },
];

interface SamplerViewProps {
  onBack?: () => void;
}

export function SamplerView({ onBack }: SamplerViewProps) {
  const {
    params,
    isInitialized,
    isPlaying,
    isLoading,
    initEngine,
    loadSample,
    play,
    stop,
    setPitch,
    setTimeStretch,
    setStartPoint,
    setEndPoint,
    setLoop,
    setReverse,
    setVolume,
    addSlice,
    autoSlice,
    setSelectedSlice,
    triggerSlice,
    getWaveformData,
  } = useSamplerStore();

  // Initialize engine on mount
  useEffect(() => {
    if (!isInitialized) {
      initEngine();
    }
  }, [isInitialized, initEngine]);

  const formatSemitones = (v: number) => (v >= 0 ? `+${v}` : `${v}`) + 'st';
  const formatRatio = (v: number) => `${v.toFixed(2)}x`;
  const formatDb = (v: number) => `${v.toFixed(1)}dB`;

  return (
    <InfoPanelProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ← Back
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              Sampler
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {params.sampleName || 'No sample loaded'}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', gap: '24px' }}>
          {/* Left: Waveform and Controls */}
          <div style={{ flex: 1 }}>
            {/* Sample Library */}
            <Section title="Sample Library">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SAMPLE_LIBRARY.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => loadSample(sample.url, sample.name)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      background: params.sampleName === sample.name ? '#2a3a2a' : '#1a1a1a',
                      border: params.sampleName === sample.name ? '2px solid #4ade80' : '1px solid #333',
                      borderRadius: '4px',
                      color: params.sampleName === sample.name ? '#4ade80' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </Section>

            {/* Waveform Editor */}
            <Section title="Waveform">
              <WaveformEditor
                waveformData={getWaveformData()}
                duration={params.duration}
                startPoint={params.startPoint}
                endPoint={params.endPoint}
                slices={params.slices}
                selectedSlice={params.selectedSlice}
                width={500}
                height={150}
                onStartPointChange={setStartPoint}
                onEndPointChange={setEndPoint}
                onSliceSelect={setSelectedSlice}
                onAddSlice={addSlice}
              />

              {/* Transport */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={isPlaying ? stop : play}
                  disabled={!params.sampleUrl}
                  style={{
                    padding: '8px 24px',
                    background: isPlaying ? '#ef4444' : '#4ade80',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#000',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button
                  onClick={() => autoSlice(8)}
                  disabled={!params.sampleUrl}
                  style={{
                    padding: '8px 16px',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#888',
                    cursor: 'pointer',
                  }}
                >
                  Auto-Slice (8)
                </button>
              </div>
            </Section>

            {/* Pitch & Time */}
            <Section title="Pitch & Time">
              <div style={{ display: 'flex', gap: '24px' }}>
                <Knob
                  label="Pitch"
                  value={params.pitch}
                  min={SAMPLER_PARAM_RANGES.pitch.min}
                  max={SAMPLER_PARAM_RANGES.pitch.max}
                  step={SAMPLER_PARAM_RANGES.pitch.step}
                  onChange={setPitch}
                  formatValue={formatSemitones}
                  paramId="sampler.pitch"
                />
                <Knob
                  label="Stretch"
                  value={params.timeStretch}
                  min={SAMPLER_PARAM_RANGES.timeStretch.min}
                  max={SAMPLER_PARAM_RANGES.timeStretch.max}
                  step={SAMPLER_PARAM_RANGES.timeStretch.step}
                  onChange={setTimeStretch}
                  formatValue={formatRatio}
                  paramId="sampler.timeStretch"
                />
                <Knob
                  label="Volume"
                  value={params.volume}
                  min={SAMPLER_PARAM_RANGES.volume.min}
                  max={SAMPLER_PARAM_RANGES.volume.max}
                  step={SAMPLER_PARAM_RANGES.volume.step}
                  onChange={setVolume}
                  formatValue={formatDb}
                  paramId="sampler.volume"
                />
              </div>
            </Section>

            {/* Options */}
            <Section title="Options">
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                  <input
                    type="checkbox"
                    checked={params.loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    style={{ accentColor: '#4ade80' }}
                  />
                  Loop
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                  <input
                    type="checkbox"
                    checked={params.reverse}
                    onChange={(e) => setReverse(e.target.checked)}
                    style={{ accentColor: '#4ade80' }}
                  />
                  Reverse
                </label>
              </div>
            </Section>
          </div>

          {/* Right: Pads and Spectrum */}
          <div style={{ width: '300px' }}>
            {/* Slice Pads */}
            <Section title="Slice Pads">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <button
                    key={i}
                    onClick={() => triggerSlice(i)}
                    disabled={i >= params.slices.length}
                    style={{
                      aspectRatio: '1',
                      background: i === params.selectedSlice ? '#2a3a2a' : '#1a1a1a',
                      border: i === params.selectedSlice ? '2px solid #4ade80' : '1px solid #333',
                      borderRadius: '4px',
                      color: i < params.slices.length ? '#fff' : '#444',
                      cursor: i < params.slices.length ? 'pointer' : 'default',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </Section>

            {/* Spectrum */}
            <Section title="Spectrum">
              <SpectrumAnalyzer width={268} height={150} barCount={32} />
            </Section>
          </div>
        </div>

        <InfoPanel accentColor="#4ade80" />
      </div>
    </InfoPanelProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
```

**Step 2: Add route to App.tsx**

Find the routes/menu section in App.tsx and add a Sampler option. The exact changes depend on current App structure.

**Step 3: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/ui/views/SamplerView.tsx src/App.tsx
git commit -m "feat(sampling): add SamplerView sandbox"
```

---

## Task 6: Sample Assets

**Files:**
- Create: `public/samples/` directory with placeholder samples

**Step 1: Create sample directory structure**

```bash
mkdir -p public/samples
```

**Step 2: Add placeholder info file**

Create `public/samples/README.md`:
```markdown
# Sample Library

Add WAV files here for the sampler:
- drum-break.wav
- vocal-chop.wav
- bass-hit.wav
- piano-loop.wav
```

For now, we'll skip actual samples and handle the "no sample" state gracefully in the UI.

**Step 3: Commit**

```bash
git add public/samples/
git commit -m "chore(sampling): add sample directory structure"
```

---

## Task 7: Sampling Challenge Types

**Files:**
- Modify: `src/core/types.ts` (add SamplingChallenge type)
- Create: `src/data/challenges/sampling/sm1/` directory structure

**Step 1: Add SamplingChallenge type to types.ts**

Add after the Challenge interface:

```typescript
// ============================================
// Sampling Challenge Types
// ============================================

export interface SamplingChallenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to create */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Curriculum module (e.g., "SM1") */
  module: string;
  /** Challenge type */
  challengeType: 'recreate-kit' | 'tune-to-track' | 'chop-challenge' | 'flip-this' | 'clean-sample';
  /** Source sample URL */
  sourceSampleUrl: string;
  /** Target/reference sample URL (for comparison) */
  targetSampleUrl?: string;
  /** Target sampler params (for recreate challenges) */
  targetParams?: Partial<SamplerParams>;
  /** Expected slice count (for chop challenges) */
  expectedSlices?: number;
  /** Target key (for tune challenges) */
  targetKey?: string;
  /** Target BPM (for tune challenges) */
  targetBpm?: number;
  /** Progressive hints */
  hints: string[];
}
```

**Step 2: Create SM1 challenge directory**

```bash
mkdir -p src/data/challenges/sampling/sm1
```

**Step 3: Create first SM1 challenge**

Create `src/data/challenges/sampling/sm1/sm1-01-load-and-play.ts`:

```typescript
import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm1-01-load-and-play',
  title: 'Load and Play',
  description: 'Load a sample and trigger it. Learn the basics of sample playback.',
  difficulty: 1,
  module: 'SM1',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm1-01-source.wav',
  hints: [
    'Click on a sample in the library to load it.',
    'Press the Play button to hear the full sample.',
    'Try adjusting the start and end points to play a portion.',
  ],
};
```

**Step 4: Create SM1 index**

Create `src/data/challenges/sampling/sm1/index.ts`:

```typescript
export { challenge as sm1_01 } from './sm1-01-load-and-play.ts';
// More challenges will be added here
```

**Step 5: Commit**

```bash
git add src/core/types.ts src/data/challenges/sampling/
git commit -m "feat(sampling): add SamplingChallenge type and SM1 structure"
```

---

## Remaining Tasks (Summary)

The following tasks follow the same pattern. Create them as needed:

### Task 8-13: SM1-SM6 Challenges
- SM1: 4 challenges (load, trigger, pitch, layer)
- SM2: 4 challenges (kit building, velocity mapping)
- SM3: 4 challenges (time stretch, tune to key)
- SM4: 4 challenges (slicing, chopping)
- SM5: 4 challenges (flipping, creative sampling)
- SM6: 4 challenges (polish, cleanup)

### Task 14: Sampling Evaluation
- Create `src/core/sampling-evaluation.ts`
- Compare audio similarity between player sample and target
- Score based on pitch accuracy, timing, slice accuracy

### Task 15: SamplerChallengeView
- Create `src/ui/views/SamplerChallengeView.tsx`
- Similar to ChallengeView but for sampling challenges
- Show source sample, target comparison, scoring

### Task 16: Integration
- Add sampling track to curriculum menu
- Update challenge index to include sampling
- Test full flow

---

## Verification Checklist

After all tasks:

- [ ] `bun run build` passes with no errors
- [ ] `bun run test` passes (existing tests + new sampler tests)
- [ ] SamplerView loads and displays correctly
- [ ] Can load and play samples
- [ ] Can adjust pitch and see waveform respond
- [ ] Can add/remove slices
- [ ] Slice pads trigger correct regions
- [ ] SM1 challenges accessible from menu
