/**
 * Generate drum samples using Tone.js offline rendering
 * Run with: bun run scripts/generate-drum-samples.ts
 */

import * as Tone from 'tone';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const OUTPUT_DIR = './public/samples/drums';
const SAMPLE_RATE = 44100;

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert Float32Array to WAV buffer
 */
function float32ToWav(samples: Float32Array, sampleRate: number): Buffer {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(totalSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // PCM format
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bytesPerSample * 8, offset); offset += 2;

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Convert float samples to 16-bit integers
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Generate a kick drum sample
 */
async function generateKick(): Promise<Float32Array> {
  const duration = 0.5;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Pitch envelope: starts at 150Hz, drops to 50Hz
    const pitchEnv = 150 * Math.exp(-t * 40) + 50;

    // Amplitude envelope
    const ampEnv = Math.exp(-t * 8);

    // Sine wave with pitch envelope
    const phase = 2 * Math.PI * pitchEnv * t;
    samples[i] = Math.sin(phase) * ampEnv * 0.9;

    // Add a bit of click at the start
    if (t < 0.005) {
      samples[i] += Math.sin(2 * Math.PI * 1000 * t) * (1 - t / 0.005) * 0.3;
    }
  }

  return samples;
}

/**
 * Generate a snare drum sample
 */
async function generateSnare(): Promise<Float32Array> {
  const duration = 0.3;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Body: low frequency tone
    const bodyEnv = Math.exp(-t * 20);
    const body = Math.sin(2 * Math.PI * 180 * t) * bodyEnv * 0.5;

    // Snare wires: filtered noise
    const noiseEnv = Math.exp(-t * 15);
    const noise = (Math.random() * 2 - 1) * noiseEnv * 0.6;

    // Click transient
    const clickEnv = Math.exp(-t * 100);
    const click = Math.sin(2 * Math.PI * 400 * t) * clickEnv * 0.3;

    samples[i] = (body + noise + click) * 0.8;
  }

  return samples;
}

/**
 * Generate a closed hi-hat sample
 */
async function generateHihatClosed(): Promise<Float32Array> {
  const duration = 0.1;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Fast decay envelope
    const env = Math.exp(-t * 50);

    // High-frequency metallic noise
    const noise = Math.random() * 2 - 1;

    // Add some high-frequency tones for metallic character
    const tone1 = Math.sin(2 * Math.PI * 6000 * t) * 0.3;
    const tone2 = Math.sin(2 * Math.PI * 8000 * t) * 0.2;
    const tone3 = Math.sin(2 * Math.PI * 10000 * t) * 0.1;

    samples[i] = (noise * 0.5 + tone1 + tone2 + tone3) * env * 0.7;
  }

  return samples;
}

/**
 * Generate an open hi-hat sample
 */
async function generateHihatOpen(): Promise<Float32Array> {
  const duration = 0.5;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Slower decay for open hat
    const env = Math.exp(-t * 8);

    // High-frequency metallic noise
    const noise = Math.random() * 2 - 1;

    // Add some high-frequency tones for metallic character
    const tone1 = Math.sin(2 * Math.PI * 6000 * t) * 0.3;
    const tone2 = Math.sin(2 * Math.PI * 8000 * t) * 0.2;
    const tone3 = Math.sin(2 * Math.PI * 10000 * t) * 0.1;
    const tone4 = Math.sin(2 * Math.PI * 4500 * t) * 0.15;

    samples[i] = (noise * 0.5 + tone1 + tone2 + tone3 + tone4) * env * 0.6;
  }

  return samples;
}

/**
 * Main generation function
 */
async function main() {
  console.log('Generating drum samples...\n');

  const samples = [
    { name: 'kick', generate: generateKick },
    { name: 'snare', generate: generateSnare },
    { name: 'hihat-closed', generate: generateHihatClosed },
    { name: 'hihat-open', generate: generateHihatOpen },
  ];

  for (const { name, generate } of samples) {
    console.log(`  Generating ${name}.wav...`);
    const audioData = await generate();
    const wavBuffer = float32ToWav(audioData, SAMPLE_RATE);
    const outputPath = `${OUTPUT_DIR}/${name}.wav`;
    writeFileSync(outputPath, wavBuffer);
    console.log(`    Saved to ${outputPath} (${wavBuffer.length} bytes)`);
  }

  console.log('\nDone! All drum samples generated.');
}

main().catch(console.error);
