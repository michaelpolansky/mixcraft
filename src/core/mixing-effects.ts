/**
 * Mixing Effects
 * EQ and Compressor for mixing challenges
 */

import * as Tone from 'tone';

/**
 * 3-Band EQ Parameters
 */
export interface EQParams {
  low: number;   // -12 to +12 dB
  mid: number;   // -12 to +12 dB
  high: number;  // -12 to +12 dB
}

/**
 * Simple Compressor Parameters (F4)
 */
export interface CompressorSimpleParams {
  threshold: number;  // -60 to 0 dB
  amount: number;     // 0 to 100 (percentage, maps to ratio)
}

/**
 * Full Compressor Parameters (F5)
 */
export interface CompressorFullParams extends CompressorSimpleParams {
  attack: number;   // 0.001 to 1 second
  release: number;  // 0.01 to 1 second
}

/**
 * EQ parameter ranges
 */
export const EQ_RANGES = {
  low: { min: -12, max: 12, default: 0 },
  mid: { min: -12, max: 12, default: 0 },
  high: { min: -12, max: 12, default: 0 },
};

/**
 * Compressor parameter ranges
 */
export const COMPRESSOR_RANGES = {
  threshold: { min: -60, max: 0, default: -24 },
  amount: { min: 0, max: 100, default: 0 },
  attack: { min: 0.001, max: 1, default: 0.03 },
  release: { min: 0.01, max: 1, default: 0.25 },
};

/**
 * Default EQ settings (flat)
 */
export const DEFAULT_EQ: EQParams = {
  low: 0,
  mid: 0,
  high: 0,
};

/**
 * Default compressor settings (off)
 */
export const DEFAULT_COMPRESSOR: CompressorFullParams = {
  threshold: 0,
  amount: 0,
  attack: 0.03,
  release: 0.25,
};

/**
 * 3-Band EQ using Tone.js EQ3
 */
export class MixingEQ {
  private eq: Tone.EQ3;
  private _params: EQParams = { ...DEFAULT_EQ };

  constructor() {
    this.eq = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 400,
      highFrequency: 2500,
    });
  }

  get input(): Tone.InputNode {
    return this.eq;
  }

  get output(): Tone.OutputNode {
    return this.eq;
  }

  get params(): EQParams {
    return { ...this._params };
  }

  setLow(db: number): void {
    this._params.low = Math.max(EQ_RANGES.low.min, Math.min(EQ_RANGES.low.max, db));
    this.eq.low.value = this._params.low;
  }

  setMid(db: number): void {
    this._params.mid = Math.max(EQ_RANGES.mid.min, Math.min(EQ_RANGES.mid.max, db));
    this.eq.mid.value = this._params.mid;
  }

  setHigh(db: number): void {
    this._params.high = Math.max(EQ_RANGES.high.min, Math.min(EQ_RANGES.high.max, db));
    this.eq.high.value = this._params.high;
  }

  setParams(params: Partial<EQParams>): void {
    if (params.low !== undefined) this.setLow(params.low);
    if (params.mid !== undefined) this.setMid(params.mid);
    if (params.high !== undefined) this.setHigh(params.high);
  }

  reset(): void {
    this.setParams(DEFAULT_EQ);
  }

  connect(destination: Tone.InputNode): void {
    this.eq.connect(destination);
  }

  disconnect(): void {
    this.eq.disconnect();
  }

  dispose(): void {
    this.eq.dispose();
  }
}

/**
 * Map amount percentage (0-100) to compression ratio (1:1 to 20:1)
 */
function amountToRatio(amount: number): number {
  // 0% = 1:1 (no compression), 100% = 20:1 (heavy compression)
  return 1 + (amount / 100) * 19;
}

/**
 * Compressor with progressive disclosure
 */
export class MixingCompressor {
  private compressor: Tone.Compressor;
  private _params: CompressorFullParams = { ...DEFAULT_COMPRESSOR };
  private _gainReduction: number = 0;

  constructor() {
    this.compressor = new Tone.Compressor({
      threshold: 0,
      ratio: 1,
      attack: 0.03,
      release: 0.25,
      knee: 6,
    });

    // Poll gain reduction for metering
    this._pollGainReduction();
  }

  private _pollGainReduction(): void {
    const poll = () => {
      if (this.compressor) {
        this._gainReduction = this.compressor.reduction;
      }
      requestAnimationFrame(poll);
    };
    poll();
  }

  get input(): Tone.InputNode {
    return this.compressor;
  }

  get output(): Tone.OutputNode {
    return this.compressor;
  }

  get params(): CompressorFullParams {
    return { ...this._params };
  }

  /**
   * Current gain reduction in dB (negative value)
   */
  get gainReduction(): number {
    return this._gainReduction;
  }

  setThreshold(db: number): void {
    this._params.threshold = Math.max(
      COMPRESSOR_RANGES.threshold.min,
      Math.min(COMPRESSOR_RANGES.threshold.max, db)
    );
    this.compressor.threshold.value = this._params.threshold;
  }

  setAmount(percent: number): void {
    this._params.amount = Math.max(
      COMPRESSOR_RANGES.amount.min,
      Math.min(COMPRESSOR_RANGES.amount.max, percent)
    );
    this.compressor.ratio.value = amountToRatio(this._params.amount);
  }

  setAttack(seconds: number): void {
    this._params.attack = Math.max(
      COMPRESSOR_RANGES.attack.min,
      Math.min(COMPRESSOR_RANGES.attack.max, seconds)
    );
    this.compressor.attack.value = this._params.attack;
  }

  setRelease(seconds: number): void {
    this._params.release = Math.max(
      COMPRESSOR_RANGES.release.min,
      Math.min(COMPRESSOR_RANGES.release.max, seconds)
    );
    this.compressor.release.value = this._params.release;
  }

  setParams(params: Partial<CompressorFullParams>): void {
    if (params.threshold !== undefined) this.setThreshold(params.threshold);
    if (params.amount !== undefined) this.setAmount(params.amount);
    if (params.attack !== undefined) this.setAttack(params.attack);
    if (params.release !== undefined) this.setRelease(params.release);
  }

  reset(): void {
    this.setParams(DEFAULT_COMPRESSOR);
  }

  connect(destination: Tone.InputNode): void {
    this.compressor.connect(destination);
  }

  disconnect(): void {
    this.compressor.disconnect();
  }

  dispose(): void {
    this.compressor.dispose();
  }
}
