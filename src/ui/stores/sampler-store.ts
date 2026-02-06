/**
 * Zustand store for sampler state management
 * Bridges React UI with the SamplerEngine
 */

import { create } from 'zustand';
import type { SamplerParams, SampleSlice } from '../../core/types.ts';
import { DEFAULT_SAMPLER_PARAMS } from '../../core/types.ts';
import { SamplerEngine, createSamplerEngine } from '../../core/sampler-engine.ts';

interface SamplerStore {
  // State
  engine: SamplerEngine | null;
  isInitialized: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  params: SamplerParams;

  // Initialization
  initEngine: () => void;

  // Sample loading
  loadSample: (url: string, name?: string) => Promise<void>;

  // Playback control
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

  // Cleanup
  dispose: () => void;
}

export const useSamplerStore = create<SamplerStore>((set, get) => ({
  // Initial state
  engine: null,
  isInitialized: false,
  isPlaying: false,
  isLoading: false,
  params: { ...DEFAULT_SAMPLER_PARAMS },

  // Initialize the sampler engine
  initEngine: () => {
    const existingEngine = get().engine;
    if (existingEngine) {
      existingEngine.dispose();
    }
    const engine = createSamplerEngine(get().params);
    set({ engine });
  },

  // Load a sample from URL
  loadSample: async (url: string, name?: string) => {
    const { engine } = get();
    if (!engine) return;

    set({ isLoading: true });

    try {
      // Ensure audio context is started
      await engine.ensureStarted();
      set({ isInitialized: true });

      // Load the sample
      await engine.loadSample(url, name ?? 'Sample');

      // Sync params from engine
      set({ params: engine.getParams(), isLoading: false });
    } catch (error) {
      console.error('Failed to load sample:', error);
      set({ isLoading: false });
    }
  },

  // Start playback
  play: () => {
    const { engine, isInitialized } = get();
    if (!engine || !isInitialized || !engine.loaded) return;

    engine.start();
    set({ isPlaying: true });
  },

  // Stop playback
  stop: () => {
    const { engine } = get();
    if (!engine) return;

    engine.stop();
    set({ isPlaying: false });
  },

  // Trigger a specific slice
  triggerSlice: (index: number) => {
    const { engine, isInitialized } = get();
    if (!engine || !isInitialized) return;

    engine.triggerSlice(index);
    set({ isPlaying: true });
  },

  // Set pitch shift in semitones
  setPitch: (semitones: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setPitch(semitones);
    set({ params: engine.getParams() });
  },

  // Set time stretch ratio
  setTimeStretch: (ratio: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setTimeStretch(ratio);
    set({ params: engine.getParams() });
  },

  // Set start point (0-1 normalized)
  setStartPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setStartPoint(point);
    set({ params: engine.getParams() });
  },

  // Set end point (0-1 normalized)
  setEndPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setEndPoint(point);
    set({ params: engine.getParams() });
  },

  // Enable/disable loop mode
  setLoop: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;

    engine.setLoop(enabled);
    set({ params: engine.getParams() });
  },

  // Enable/disable reverse playback
  setReverse: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverse(enabled);
    set({ params: engine.getParams() });
  },

  // Set volume in dB
  setVolume: (db: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setVolume(db);
    set({ params: engine.getParams() });
  },

  // Add a new slice
  addSlice: (start: number, end: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.addSlice(start, end);
    set({ params: engine.getParams() });
  },

  // Remove a slice by ID
  removeSlice: (id: string) => {
    const { engine } = get();
    if (!engine) return;

    engine.removeSlice(id);
    set({ params: engine.getParams() });
  },

  // Automatically divide sample into equal slices
  autoSlice: (numSlices: number = 8) => {
    const { engine } = get();
    if (!engine) return;

    engine.autoSlice(numSlices);
    set({ params: engine.getParams() });
  },

  // Set the currently selected slice index
  setSelectedSlice: (index: number) => {
    const { params } = get();
    set({
      params: {
        ...params,
        selectedSlice: index,
      },
    });
  },

  // Get the analyser node for visualization
  getAnalyser: () => {
    const { engine } = get();
    return engine?.getAnalyser() ?? null;
  },

  // Get waveform data for visualization
  getWaveformData: () => {
    const { engine } = get();
    return engine?.getWaveformData() ?? null;
  },

  // Cleanup
  dispose: () => {
    const { engine } = get();
    if (engine) {
      engine.dispose();
      set({ engine: null, isInitialized: false, isPlaying: false });
    }
  },
}));
