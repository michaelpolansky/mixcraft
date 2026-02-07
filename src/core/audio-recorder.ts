/**
 * AudioRecorder - Records audio from a Web Audio node
 * Uses ScriptProcessorNode to capture raw PCM samples and encodes to WAV format
 * Note: ScriptProcessorNode is deprecated but still widely supported
 */

const MAX_RECORDING_SECONDS = 30;
const SAMPLE_RATE = 44100;

/**
 * Encodes audio buffer data as a WAV file
 */
function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  // "RIFF"
  view.setUint8(0, 0x52); // R
  view.setUint8(1, 0x49); // I
  view.setUint8(2, 0x46); // F
  view.setUint8(3, 0x46); // F

  // File size
  view.setUint32(4, 36 + samples.length * 2, true);

  // "WAVE"
  view.setUint8(8, 0x57);  // W
  view.setUint8(9, 0x41);  // A
  view.setUint8(10, 0x56); // V
  view.setUint8(11, 0x45); // E

  // "fmt "
  view.setUint8(12, 0x66); // f
  view.setUint8(13, 0x6d); // m
  view.setUint8(14, 0x74); // t
  view.setUint8(15, 0x20); // (space)

  // Subchunk1Size (16 for PCM)
  view.setUint32(16, 16, true);

  // Audio format (1 = PCM)
  view.setUint16(20, 1, true);

  // Number of channels (1 = mono)
  view.setUint16(22, 1, true);

  // Sample rate
  view.setUint32(24, sampleRate, true);

  // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint32(28, sampleRate * 2, true);

  // Block align (NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true);

  // Bits per sample
  view.setUint16(34, 16, true);

  // "data"
  view.setUint8(36, 0x64); // d
  view.setUint8(37, 0x61); // a
  view.setUint8(38, 0x74); // t
  view.setUint8(39, 0x61); // a

  // Subchunk2Size
  view.setUint32(40, samples.length * 2, true);

  // Write the PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    // Clamp and convert to 16-bit integer
    const sample = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  return buffer;
}

/**
 * AudioRecorder class - records audio from a Web Audio node
 *
 * Captures raw audio data using ScriptProcessorNode and encodes to WAV format.
 * Maximum recording duration is 30 seconds.
 */
export class AudioRecorder {
  private audioContext: AudioContext;
  private sourceNode: AudioNode;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private recordedChunks: Float32Array[] = [];
  private _isRecording = false;
  private startTime = 0;
  private maxSamples: number;
  private totalSamples = 0;
  private onAutoStopCallback: (() => void) | null = null;

  constructor(sourceNode: AudioNode) {
    this.sourceNode = sourceNode;
    this.audioContext = sourceNode.context as AudioContext;
    this.maxSamples = MAX_RECORDING_SECONDS * (this.audioContext.sampleRate || SAMPLE_RATE);
  }

  /**
   * Returns whether recording is currently in progress
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Sets a callback for when recording auto-stops at the limit
   */
  onAutoStop(callback: () => void): void {
    this.onAutoStopCallback = callback;
  }

  /**
   * Starts recording audio
   */
  start(): void {
    if (this._isRecording) {
      return;
    }

    // Reset state
    this.recordedChunks = [];
    this.totalSamples = 0;
    this.startTime = performance.now();

    // Create ScriptProcessorNode for capturing audio
    // Using 4096 buffer size for good balance of latency and performance
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    // Audio processing callback
    this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this._isRecording) return;

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);

      // Check if we would exceed the max recording time
      const remainingSamples = this.maxSamples - this.totalSamples;

      if (remainingSamples <= 0) {
        // Already at limit, stop recording
        this._autoStop();
        return;
      }

      // Copy the data (may be partial if near the limit)
      const samplesToRecord = Math.min(inputData.length, remainingSamples);
      const chunk = new Float32Array(samplesToRecord);

      for (let i = 0; i < samplesToRecord; i++) {
        chunk[i] = inputData[i]!;
      }

      this.recordedChunks.push(chunk);
      this.totalSamples += samplesToRecord;

      // Auto-stop if we've reached the limit
      if (this.totalSamples >= this.maxSamples) {
        this._autoStop();
      }
    };

    // Connect: source -> scriptProcessor -> destination
    // The scriptProcessor must be connected to destination to work
    this.sourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);

    this._isRecording = true;
  }

  /**
   * Internal auto-stop when max duration reached
   */
  private _autoStop(): void {
    if (!this._isRecording) return;

    this._isRecording = false;
    this._cleanup();

    if (this.onAutoStopCallback) {
      this.onAutoStopCallback();
    }
  }

  /**
   * Cleans up the script processor
   */
  private _cleanup(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.sourceNode.disconnect(this.scriptProcessor);
      this.scriptProcessor = null;
    }
  }

  /**
   * Stops recording and returns the audio as a WAV Blob
   */
  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this._isRecording) {
        // Return existing recording if available
        const blob = this._createWavBlob();
        resolve(blob);
        return;
      }

      this._isRecording = false;
      this._cleanup();

      const blob = this._createWavBlob();
      resolve(blob);
    });
  }

  /**
   * Creates a WAV blob from the recorded chunks
   */
  private _createWavBlob(): Blob {
    // Merge all chunks into a single buffer
    const totalLength = this.recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const mergedBuffer = new Float32Array(totalLength);

    let offset = 0;
    for (const chunk of this.recordedChunks) {
      mergedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Encode as WAV
    const wavBuffer = encodeWAV(mergedBuffer, this.audioContext.sampleRate);

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Gets the elapsed recording time in seconds
   */
  getElapsedTime(): number {
    if (!this._isRecording) {
      // Return the duration of the recorded audio
      return this.totalSamples / (this.audioContext.sampleRate || SAMPLE_RATE);
    }
    return (performance.now() - this.startTime) / 1000;
  }

  /**
   * Gets the maximum recording time in seconds
   */
  getMaxTime(): number {
    return MAX_RECORDING_SECONDS;
  }

  /**
   * Disposes of the recorder and releases resources
   */
  dispose(): void {
    if (this._isRecording) {
      this._isRecording = false;
      this._cleanup();
    }
    this.recordedChunks = [];
    this.onAutoStopCallback = null;
  }
}

/**
 * Creates a new audio recorder instance
 */
export function createAudioRecorder(sourceNode: AudioNode): AudioRecorder {
  return new AudioRecorder(sourceNode);
}
