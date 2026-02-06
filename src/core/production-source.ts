/**
 * Production Source System
 * Multi-layer audio mixing for production challenges
 */

import * as Tone from 'tone';
import type { ProductionLayer } from './types.ts';
import { createAudioSource, type AudioSource } from './audio-source.ts';

/**
 * Layer state managed by the production system
 */
export interface LayerState {
  id: string;
  name: string;
  volume: number;      // dB (-60 to +6)
  pan: number;         // -1 (left) to 1 (right)
  muted: boolean;
  solo: boolean;
  eqLow: number;       // -12 to +12 dB
  eqHigh: number;      // -12 to +12 dB
}

/**
 * Layer parameter ranges
 */
export const LAYER_RANGES = {
  volume: { min: -60, max: 6, default: 0 },
  pan: { min: -1, max: 1, default: 0 },
  eqLow: { min: -12, max: 12, default: 0 },
  eqHigh: { min: -12, max: 12, default: 0 },
} as const;

/**
 * Internal layer with audio nodes
 */
interface LayerNodes {
  source: AudioSource;
  gain: Tone.Gain;
  panner: Tone.Panner;
  eqLow: Tone.Filter;
  eqHigh: Tone.Filter;
  meter: Tone.Meter;
}

/**
 * Create default state from layer config
 */
function createDefaultLayerState(layer: ProductionLayer): LayerState {
  return {
    id: layer.id,
    name: layer.name,
    volume: layer.initialVolume ?? 0,
    pan: layer.initialPan ?? 0,
    muted: layer.initialMuted ?? false,
    solo: false,
    eqLow: 0,
    eqHigh: 0,
  };
}

/**
 * Production audio system with multiple layers
 *
 * Signal flow per layer:
 * Source → EQ Low Shelf → EQ High Shelf → Panner → Gain → Master
 */
export class ProductionSource {
  private layers: Map<string, LayerNodes> = new Map();
  private layerStates: Map<string, LayerState> = new Map();
  private master: Tone.Gain;
  private masterMeter: Tone.Meter;
  private analyser: Tone.Analyser;
  private _isPlaying: boolean = false;

  constructor(layerConfigs: ProductionLayer[]) {
    // Create master bus
    this.master = new Tone.Gain(1);
    this.masterMeter = new Tone.Meter();
    this.analyser = new Tone.Analyser('fft', 2048);

    this.master.connect(this.masterMeter);
    this.master.connect(this.analyser);

    // Create layers
    for (const config of layerConfigs) {
      this.addLayer(config);
    }
  }

  /**
   * Add a layer to the production system
   */
  private addLayer(config: ProductionLayer): void {
    // Create audio source
    const source = createAudioSource(config.sourceConfig);

    // Create channel strip nodes
    const eqLow = new Tone.Filter({
      type: 'lowshelf',
      frequency: 300,
      gain: 0,
    });

    const eqHigh = new Tone.Filter({
      type: 'highshelf',
      frequency: 3000,
      gain: 0,
    });

    const panner = new Tone.Panner(config.initialPan ?? 0);
    const gain = new Tone.Gain(Tone.dbToGain(config.initialVolume ?? 0));
    const meter = new Tone.Meter();

    // Connect chain: source → eqLow → eqHigh → panner → gain → meter → master
    source.connect(eqLow);
    eqLow.connect(eqHigh);
    eqHigh.connect(panner);
    panner.connect(gain);
    gain.connect(meter);
    meter.connect(this.master);

    // Store nodes
    this.layers.set(config.id, {
      source,
      gain,
      panner,
      eqLow,
      eqHigh,
      meter,
    });

    // Initialize state
    this.layerStates.set(config.id, createDefaultLayerState(config));
  }

  /**
   * Connect master output to destination
   */
  connect(destination: Tone.InputNode): void {
    this.master.connect(destination);
  }

  /**
   * Disconnect from destination
   */
  disconnect(): void {
    this.master.disconnect();
  }

  /**
   * Start all layers
   */
  start(): void {
    if (this._isPlaying) return;

    this._isPlaying = true;
    this.updateSoloState();

    for (const [id, layer] of this.layers) {
      const state = this.layerStates.get(id);
      if (state && !state.muted && this.shouldLayerSound(id)) {
        layer.source.start();
      }
    }
  }

  /**
   * Stop all layers
   */
  stop(): void {
    if (!this._isPlaying) return;

    this._isPlaying = false;
    for (const layer of this.layers.values()) {
      layer.source.stop();
    }
  }

  /**
   * Check if playing
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Get all layer states
   */
  getStates(): LayerState[] {
    return Array.from(this.layerStates.values());
  }

  /**
   * Get a specific layer's state
   */
  getState(layerId: string): LayerState | undefined {
    return this.layerStates.get(layerId);
  }

  /**
   * Set layer volume
   */
  setVolume(layerId: string, db: number): void {
    const layer = this.layers.get(layerId);
    const state = this.layerStates.get(layerId);
    if (!layer || !state) return;

    state.volume = Math.max(LAYER_RANGES.volume.min, Math.min(LAYER_RANGES.volume.max, db));
    layer.gain.gain.value = Tone.dbToGain(state.volume);
  }

  /**
   * Set layer pan
   */
  setPan(layerId: string, pan: number): void {
    const layer = this.layers.get(layerId);
    const state = this.layerStates.get(layerId);
    if (!layer || !state) return;

    state.pan = Math.max(LAYER_RANGES.pan.min, Math.min(LAYER_RANGES.pan.max, pan));
    layer.panner.pan.value = state.pan;
  }

  /**
   * Set layer mute state
   */
  setMuted(layerId: string, muted: boolean): void {
    const state = this.layerStates.get(layerId);
    const layer = this.layers.get(layerId);
    if (!state || !layer) return;

    state.muted = muted;

    if (this._isPlaying) {
      if (muted) {
        layer.source.stop();
      } else if (this.shouldLayerSound(layerId)) {
        layer.source.start();
      }
    }
  }

  /**
   * Set layer solo state
   */
  setSolo(layerId: string, solo: boolean): void {
    const state = this.layerStates.get(layerId);
    if (!state) return;

    state.solo = solo;
    this.updateSoloState();
  }

  /**
   * Set EQ low shelf gain
   */
  setEQlow(layerId: string, db: number): void {
    const layer = this.layers.get(layerId);
    const state = this.layerStates.get(layerId);
    if (!layer || !state) return;

    state.eqLow = Math.max(LAYER_RANGES.eqLow.min, Math.min(LAYER_RANGES.eqLow.max, db));
    layer.eqLow.gain.value = state.eqLow;
  }

  /**
   * Set EQ high shelf gain
   */
  setEQhigh(layerId: string, db: number): void {
    const layer = this.layers.get(layerId);
    const state = this.layerStates.get(layerId);
    if (!layer || !state) return;

    state.eqHigh = Math.max(LAYER_RANGES.eqHigh.min, Math.min(LAYER_RANGES.eqHigh.max, db));
    layer.eqHigh.gain.value = state.eqHigh;
  }

  /**
   * Check if any layer is soloed
   */
  private hasAnySolo(): boolean {
    for (const state of this.layerStates.values()) {
      if (state.solo) return true;
    }
    return false;
  }

  /**
   * Check if a layer should produce sound
   * (not muted, and either soloed or no solos active)
   */
  private shouldLayerSound(layerId: string): boolean {
    const state = this.layerStates.get(layerId);
    if (!state || state.muted) return false;

    const anySolo = this.hasAnySolo();
    return !anySolo || state.solo;
  }

  /**
   * Update all layers based on solo state
   */
  private updateSoloState(): void {
    if (!this._isPlaying) return;

    for (const [id, layer] of this.layers) {
      const state = this.layerStates.get(id);
      if (!state) continue;

      if (this.shouldLayerSound(id)) {
        // Should play - start if not already
        layer.source.start();
      } else {
        // Should be silent - stop
        layer.source.stop();
      }
    }
  }

  /**
   * Get layer meter value (for UI level meters)
   */
  getLayerLevel(layerId: string): number {
    const layer = this.layers.get(layerId);
    if (!layer) return -Infinity;
    return layer.meter.getValue() as number;
  }

  /**
   * Get master level
   */
  getMasterLevel(): number {
    return this.masterMeter.getValue() as number;
  }

  /**
   * Get spectrum data for visualization
   */
  getSpectrum(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  /**
   * Reset all layers to initial state
   */
  reset(configs: ProductionLayer[]): void {
    for (const config of configs) {
      const state = this.layerStates.get(config.id);
      if (state) {
        this.setVolume(config.id, config.initialVolume ?? 0);
        this.setPan(config.id, config.initialPan ?? 0);
        this.setMuted(config.id, config.initialMuted ?? false);
        this.setSolo(config.id, false);
        this.setEQlow(config.id, 0);
        this.setEQhigh(config.id, 0);
      }
    }
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.stop();

    for (const layer of this.layers.values()) {
      layer.source.dispose();
      layer.gain.dispose();
      layer.panner.dispose();
      layer.eqLow.dispose();
      layer.eqHigh.dispose();
      layer.meter.dispose();
    }

    this.master.dispose();
    this.masterMeter.dispose();
    this.analyser.dispose();

    this.layers.clear();
    this.layerStates.clear();
  }
}

/**
 * Create a production source from challenge layers
 */
export function createProductionSource(layers: ProductionLayer[]): ProductionSource {
  return new ProductionSource(layers);
}
