/**
 * EffectsChain
 * Reusable effects processor: Distortion -> Delay -> Chorus -> Reverb
 */

import * as Tone from 'tone';
import type {
  EffectsParams,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
} from './types.ts';
import { DEFAULT_EFFECTS } from './types.ts';

/**
 * Reusable effects chain for audio processing
 *
 * Signal flow:
 * input -> distortion (dry/wet) -> delay (dry/wet) -> chorus (dry/wet) -> reverb (dry/wet) -> output
 */
export class EffectsChain {
  private params: EffectsParams;

  // Effects nodes
  private distortion: Tone.Distortion;
  private distortionDry: Tone.Gain;
  private distortionWet: Tone.Gain;
  private delay: Tone.FeedbackDelay;
  private delayDry: Tone.Gain;
  private delayWet: Tone.Gain;
  private chorus: Tone.Chorus;
  private chorusDry: Tone.Gain;
  private chorusWet: Tone.Gain;
  private reverb: Tone.Reverb;
  private reverbDry: Tone.Gain;
  private reverbWet: Tone.Gain;

  // Connection points
  private inputGain: Tone.Gain;
  private outputGain: Tone.Gain;

  // Merge points for dry/wet
  private postDistortion: Tone.Gain;
  private postDelay: Tone.Gain;
  private postChorus: Tone.Gain;

  constructor(initialParams: Partial<EffectsParams> = {}) {
    this.params = {
      distortion: { ...DEFAULT_EFFECTS.distortion, ...initialParams.distortion },
      delay: { ...DEFAULT_EFFECTS.delay, ...initialParams.delay },
      reverb: { ...DEFAULT_EFFECTS.reverb, ...initialParams.reverb },
      chorus: { ...DEFAULT_EFFECTS.chorus, ...initialParams.chorus },
    };

    // Create input/output
    this.inputGain = new Tone.Gain(1);
    this.outputGain = new Tone.Gain(1);

    // Create distortion with dry/wet
    this.distortion = new Tone.Distortion(this.params.distortion.amount);
    this.distortionDry = new Tone.Gain(1 - this.params.distortion.mix);
    this.distortionWet = new Tone.Gain(this.params.distortion.mix);
    this.postDistortion = new Tone.Gain(1);

    // Create delay with dry/wet
    this.delay = new Tone.FeedbackDelay({
      delayTime: this.params.delay.time,
      feedback: this.params.delay.feedback,
    });
    this.delayDry = new Tone.Gain(1 - this.params.delay.mix);
    this.delayWet = new Tone.Gain(this.params.delay.mix);
    this.postDelay = new Tone.Gain(1);

    // Create chorus with dry/wet
    this.chorus = new Tone.Chorus({
      frequency: this.params.chorus.rate,
      depth: this.params.chorus.depth,
      wet: 1,
    }).start();
    this.chorusDry = new Tone.Gain(1 - this.params.chorus.mix);
    this.chorusWet = new Tone.Gain(this.params.chorus.mix);
    this.postChorus = new Tone.Gain(1);

    // Create reverb with dry/wet
    this.reverb = new Tone.Reverb({
      decay: this.params.reverb.decay,
      wet: 1,
    });
    this.reverbDry = new Tone.Gain(1 - this.params.reverb.mix);
    this.reverbWet = new Tone.Gain(this.params.reverb.mix);

    // Wire the chain
    this.wireChain();
  }

  private wireChain(): void {
    // Input -> Distortion stage
    this.inputGain.connect(this.distortionDry);
    this.inputGain.connect(this.distortion);
    this.distortion.connect(this.distortionWet);
    this.distortionDry.connect(this.postDistortion);
    this.distortionWet.connect(this.postDistortion);

    // Distortion -> Delay stage
    this.postDistortion.connect(this.delayDry);
    this.postDistortion.connect(this.delay);
    this.delay.connect(this.delayWet);
    this.delayDry.connect(this.postDelay);
    this.delayWet.connect(this.postDelay);

    // Delay -> Chorus stage
    this.postDelay.connect(this.chorusDry);
    this.postDelay.connect(this.chorus);
    this.chorus.connect(this.chorusWet);
    this.chorusDry.connect(this.postChorus);
    this.chorusWet.connect(this.postChorus);

    // Chorus -> Reverb stage
    this.postChorus.connect(this.reverbDry);
    this.postChorus.connect(this.reverb);
    this.reverb.connect(this.reverbWet);
    this.reverbDry.connect(this.outputGain);
    this.reverbWet.connect(this.outputGain);
  }

  /**
   * Get the input node to connect sources to
   */
  get input(): Tone.InputNode {
    return this.inputGain;
  }

  /**
   * Get the output node to connect to destination/analyser
   */
  get output(): Tone.OutputNode {
    return this.outputGain;
  }

  /**
   * Get current parameters
   */
  getParams(): EffectsParams {
    return {
      distortion: { ...this.params.distortion },
      delay: { ...this.params.delay },
      reverb: { ...this.params.reverb },
      chorus: { ...this.params.chorus },
    };
  }

  /**
   * Set distortion parameters
   */
  setDistortion(params: Partial<DistortionParams>): void {
    if (params.amount !== undefined) {
      this.params.distortion.amount = params.amount;
      this.distortion.distortion = params.amount;
    }
    if (params.mix !== undefined) {
      this.params.distortion.mix = params.mix;
      this.distortionDry.gain.value = 1 - params.mix;
      this.distortionWet.gain.value = params.mix;
    }
  }

  /**
   * Set delay parameters
   */
  setDelay(params: Partial<DelayParams>): void {
    if (params.time !== undefined) {
      this.params.delay.time = params.time;
      this.delay.delayTime.value = params.time;
    }
    if (params.feedback !== undefined) {
      this.params.delay.feedback = params.feedback;
      this.delay.feedback.value = params.feedback;
    }
    if (params.mix !== undefined) {
      this.params.delay.mix = params.mix;
      this.delayDry.gain.value = 1 - params.mix;
      this.delayWet.gain.value = params.mix;
    }
  }

  /**
   * Set reverb parameters
   */
  setReverb(params: Partial<ReverbParams>): void {
    if (params.decay !== undefined) {
      this.params.reverb.decay = params.decay;
      this.reverb.decay = params.decay;
    }
    if (params.mix !== undefined) {
      this.params.reverb.mix = params.mix;
      this.reverbDry.gain.value = 1 - params.mix;
      this.reverbWet.gain.value = params.mix;
    }
  }

  /**
   * Set chorus parameters
   */
  setChorus(params: Partial<ChorusParams>): void {
    if (params.rate !== undefined) {
      this.params.chorus.rate = params.rate;
      this.chorus.frequency.value = params.rate;
    }
    if (params.depth !== undefined) {
      this.params.chorus.depth = params.depth;
      this.chorus.depth = params.depth;
    }
    if (params.mix !== undefined) {
      this.params.chorus.mix = params.mix;
      this.chorusDry.gain.value = 1 - params.mix;
      this.chorusWet.gain.value = params.mix;
    }
  }

  /**
   * Set all parameters at once
   */
  setParams(params: Partial<EffectsParams>): void {
    if (params.distortion) this.setDistortion(params.distortion);
    if (params.delay) this.setDelay(params.delay);
    if (params.reverb) this.setReverb(params.reverb);
    if (params.chorus) this.setChorus(params.chorus);
  }

  /**
   * Connect output to a destination
   */
  connect(destination: Tone.InputNode): void {
    this.outputGain.connect(destination);
  }

  /**
   * Disconnect from all destinations
   */
  disconnect(): void {
    this.outputGain.disconnect();
  }

  /**
   * Dispose all nodes
   */
  dispose(): void {
    this.distortion.dispose();
    this.distortionDry.dispose();
    this.distortionWet.dispose();
    this.delay.dispose();
    this.delayDry.dispose();
    this.delayWet.dispose();
    this.chorus.dispose();
    this.chorusDry.dispose();
    this.chorusWet.dispose();
    this.reverb.dispose();
    this.reverbDry.dispose();
    this.reverbWet.dispose();
    this.inputGain.dispose();
    this.outputGain.dispose();
    this.postDistortion.dispose();
    this.postDelay.dispose();
    this.postChorus.dispose();
  }
}
