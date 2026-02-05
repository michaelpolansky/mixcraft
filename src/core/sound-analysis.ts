/**
 * Sound Analysis for Comparison
 * Extracts perceptual audio features for scoring sound similarity
 */

/**
 * Features extracted from a sound for comparison
 */
export interface SoundFeatures {
  // Spectral features
  spectralCentroid: number;    // "brightness" - higher = brighter
  spectralSpread: number;      // how spread out the spectrum is
  spectralFlatness: number;    // tonal vs noise-like (0 = tonal, 1 = noise)

  // Temporal features
  attackTime: number;          // time to reach peak (in frames)
  sustainLevel: number;        // average level during sustain phase

  // Envelope shape (normalized RMS over time)
  rmsEnvelope: number[];

  // Average spectrum shape
  averageSpectrum: number[];
}

/**
 * Configuration for capture
 */
export interface CaptureConfig {
  /** Duration in milliseconds */
  durationMs: number;
  /** Number of frames to capture */
  frameCount: number;
}

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  durationMs: 500,
  frameCount: 20,
};

/**
 * Captures and analyzes sound from an analyser node
 * Triggers a note, captures spectrum data over time, then extracts features
 */
export async function captureAndAnalyze(
  analyserNode: AnalyserNode,
  triggerNote: () => void,
  releaseNote: () => void,
  config: CaptureConfig = DEFAULT_CAPTURE_CONFIG
): Promise<SoundFeatures> {
  const { durationMs, frameCount } = config;
  const frameInterval = durationMs / frameCount;

  const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
  const frames: number[][] = [];
  const rmsValues: number[] = [];

  return new Promise((resolve) => {
    // Start the note
    triggerNote();

    let framesCaptured = 0;

    const captureFrame = () => {
      // Get frequency data
      analyserNode.getByteFrequencyData(frequencyData);

      // Store a copy of the spectrum
      frames.push(Array.from(frequencyData));

      // Calculate RMS from frequency data (approximation)
      let sum = 0;
      for (let i = 0; i < frequencyData.length; i++) {
        const val = frequencyData[i] ?? 0;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / frequencyData.length);
      rmsValues.push(rms);

      framesCaptured++;

      if (framesCaptured < frameCount) {
        setTimeout(captureFrame, frameInterval);
      } else {
        // Done capturing, release the note
        releaseNote();

        // Extract features from captured data
        const features = extractFeaturesFromFrames(frames, rmsValues, analyserNode.frequencyBinCount);
        resolve(features);
      }
    };

    // Start capturing after a brief delay to let the note start
    setTimeout(captureFrame, 10);
  });
}

/**
 * Extract perceptual features from captured frame data
 */
function extractFeaturesFromFrames(
  frames: number[][],
  rmsValues: number[],
  binCount: number
): SoundFeatures {
  // Average spectrum across all frames
  const averageSpectrum: number[] = new Array(binCount).fill(0);

  for (const frame of frames) {
    for (let i = 0; i < binCount && i < frame.length; i++) {
      averageSpectrum[i] = (averageSpectrum[i] ?? 0) + (frame[i] ?? 0);
    }
  }

  for (let i = 0; i < averageSpectrum.length; i++) {
    averageSpectrum[i] = (averageSpectrum[i] ?? 0) / frames.length;
  }

  // Spectral centroid (brightness)
  let weightedSum = 0;
  let totalEnergy = 0;
  for (let i = 0; i < averageSpectrum.length; i++) {
    const energy = averageSpectrum[i] ?? 0;
    weightedSum += i * energy;
    totalEnergy += energy;
  }
  const spectralCentroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

  // Spectral spread
  let spreadSum = 0;
  for (let i = 0; i < averageSpectrum.length; i++) {
    const energy = averageSpectrum[i] ?? 0;
    const diff = i - spectralCentroid;
    spreadSum += diff * diff * energy;
  }
  const spectralSpread = totalEnergy > 0 ? Math.sqrt(spreadSum / totalEnergy) : 0;

  // Spectral flatness (geometric mean / arithmetic mean)
  let logSum = 0;
  let arithmeticSum = 0;
  let nonZeroCount = 0;
  for (const val of averageSpectrum) {
    const v = (val ?? 0) + 0.001; // Avoid log(0)
    logSum += Math.log(v);
    arithmeticSum += v;
    nonZeroCount++;
  }
  const geometricMean = Math.exp(logSum / nonZeroCount);
  const arithmeticMean = arithmeticSum / nonZeroCount;
  const spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;

  // Normalize RMS envelope
  const peakRms = Math.max(...rmsValues, 1);
  const rmsEnvelope = rmsValues.map(v => v / peakRms);

  // Attack time (frames to reach 90% of peak)
  const threshold = peakRms * 0.9;
  let attackTime = rmsValues.length;
  for (let i = 0; i < rmsValues.length; i++) {
    if ((rmsValues[i] ?? 0) >= threshold) {
      attackTime = i;
      break;
    }
  }

  // Sustain level (average of last half of frames)
  const sustainStart = Math.floor(rmsValues.length / 2);
  let sustainSum = 0;
  for (let i = sustainStart; i < rmsValues.length; i++) {
    sustainSum += rmsValues[i] ?? 0;
  }
  const sustainLevel = sustainSum / (rmsValues.length - sustainStart) / peakRms;

  return {
    spectralCentroid,
    spectralSpread,
    spectralFlatness,
    attackTime,
    sustainLevel,
    rmsEnvelope,
    averageSpectrum,
  };
}

/**
 * No-op init function for API compatibility
 */
export function initMeyda(_sampleRate: number, _bufferSize: number): void {
  // No longer using Meyda - using direct analyser data instead
}
