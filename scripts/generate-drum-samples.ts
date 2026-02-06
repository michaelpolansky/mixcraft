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
 * Generate a clap sample
 */
async function generateClap(): Promise<Float32Array> {
  const duration = 0.3;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Multiple short bursts to simulate clap texture
    let clap = 0;
    const burstCount = 4;
    for (let b = 0; b < burstCount; b++) {
      const burstTime = t - b * 0.008;
      if (burstTime > 0 && burstTime < 0.02) {
        const burstEnv = Math.exp(-burstTime * 80);
        clap += (Math.random() * 2 - 1) * burstEnv * 0.4;
      }
    }

    // Main body with longer tail
    const bodyEnv = Math.exp(-t * 12);
    const body = (Math.random() * 2 - 1) * bodyEnv * 0.5;

    // Mid-frequency resonance
    const resonance = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 25) * 0.2;

    samples[i] = (clap + body + resonance) * 0.85;
  }

  return samples;
}

/**
 * Generate a rim shot sample
 */
async function generateRim(): Promise<Float32Array> {
  const duration = 0.15;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Sharp attack
    const clickEnv = Math.exp(-t * 200);
    const click = Math.sin(2 * Math.PI * 1800 * t) * clickEnv;

    // Body resonance
    const bodyEnv = Math.exp(-t * 40);
    const body = Math.sin(2 * Math.PI * 800 * t) * bodyEnv * 0.5;

    // High frequency ping
    const pingEnv = Math.exp(-t * 100);
    const ping = Math.sin(2 * Math.PI * 3500 * t) * pingEnv * 0.3;

    samples[i] = (click + body + ping) * 0.8;
  }

  return samples;
}

/**
 * Generate a tom sample
 */
function generateTom(pitch: number): () => Promise<Float32Array> {
  return async (): Promise<Float32Array> => {
    const duration = 0.4;
    const sampleCount = Math.floor(SAMPLE_RATE * duration);
    const samples = new Float32Array(sampleCount);

    for (let i = 0; i < sampleCount; i++) {
      const t = i / SAMPLE_RATE;

      // Pitch envelope: drops slightly
      const pitchEnv = pitch * (1 + 0.3 * Math.exp(-t * 30));

      // Amplitude envelope
      const ampEnv = Math.exp(-t * 6);

      // Main tone
      const tone = Math.sin(2 * Math.PI * pitchEnv * t) * ampEnv;

      // Attack transient
      const attackEnv = Math.exp(-t * 80);
      const attack = Math.sin(2 * Math.PI * pitch * 2 * t) * attackEnv * 0.3;

      // Slight noise for stick impact
      const noiseEnv = Math.exp(-t * 50);
      const noise = (Math.random() * 2 - 1) * noiseEnv * 0.15;

      samples[i] = (tone + attack + noise) * 0.8;
    }

    return samples;
  };
}

/**
 * Generate a crash cymbal sample
 */
async function generateCrash(): Promise<Float32Array> {
  const duration = 1.5;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Long decay envelope
    const env = Math.exp(-t * 2);

    // Multiple high-frequency components for shimmer
    const noise = Math.random() * 2 - 1;
    const tone1 = Math.sin(2 * Math.PI * 3000 * t + Math.sin(2 * Math.PI * 0.5 * t) * 0.1);
    const tone2 = Math.sin(2 * Math.PI * 4500 * t);
    const tone3 = Math.sin(2 * Math.PI * 6000 * t);
    const tone4 = Math.sin(2 * Math.PI * 8000 * t);
    const tone5 = Math.sin(2 * Math.PI * 10000 * t);

    // Initial attack brightness
    const attackEnv = Math.exp(-t * 10);
    const attack = (Math.random() * 2 - 1) * attackEnv * 0.5;

    samples[i] = (noise * 0.3 + tone1 * 0.2 + tone2 * 0.15 + tone3 * 0.1 + tone4 * 0.08 + tone5 * 0.05 + attack) * env * 0.6;
  }

  return samples;
}

/**
 * Generate a ride cymbal sample
 */
async function generateRide(): Promise<Float32Array> {
  const duration = 1.0;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Bell-like decay
    const env = Math.exp(-t * 3);

    // Metallic tones with slight detuning for richness
    const bell = Math.sin(2 * Math.PI * 2800 * t) * 0.4;
    const tone1 = Math.sin(2 * Math.PI * 5200 * t) * 0.2;
    const tone2 = Math.sin(2 * Math.PI * 7400 * t) * 0.15;
    const tone3 = Math.sin(2 * Math.PI * 9600 * t) * 0.1;

    // Subtle wash
    const noiseEnv = Math.exp(-t * 5);
    const noise = (Math.random() * 2 - 1) * noiseEnv * 0.15;

    // Stick attack
    const attackEnv = Math.exp(-t * 100);
    const attack = Math.sin(2 * Math.PI * 4000 * t) * attackEnv * 0.3;

    samples[i] = (bell + tone1 + tone2 + tone3 + noise + attack) * env * 0.55;
  }

  return samples;
}

/**
 * Generate an 808 kick sample
 */
async function generate808Kick(): Promise<Float32Array> {
  const duration = 0.8;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Deep pitch sweep: starts higher, drops to sub-bass
    const pitchEnv = 80 * Math.exp(-t * 20) + 40;

    // Long sustaining envelope
    const ampEnv = Math.exp(-t * 4);

    // Pure sine for that 808 sub
    const phase = 2 * Math.PI * pitchEnv * t;
    samples[i] = Math.sin(phase) * ampEnv * 0.95;

    // Sharp click at the start
    if (t < 0.01) {
      samples[i] += Math.sin(2 * Math.PI * 2000 * t) * (1 - t / 0.01) * 0.4;
    }
  }

  return samples;
}

/**
 * Generate a shaker sample
 */
async function generateShaker(): Promise<Float32Array> {
  const duration = 0.15;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Quick attack, medium decay
    const env = t < 0.02
      ? t / 0.02
      : Math.exp(-(t - 0.02) * 20);

    // High-frequency filtered noise
    const noise = Math.random() * 2 - 1;

    // Add some high harmonics for brightness
    const bright = Math.sin(2 * Math.PI * 8000 * t) * 0.2 +
                   Math.sin(2 * Math.PI * 12000 * t) * 0.1;

    samples[i] = (noise * 0.6 + bright) * env * 0.5;
  }

  return samples;
}

/**
 * Generate a cowbell sample
 */
async function generateCowbell(): Promise<Float32Array> {
  const duration = 0.4;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Metallic decay
    const env = Math.exp(-t * 8);

    // Two slightly detuned tones for that cowbell clang
    const freq1 = 560;
    const freq2 = 845;
    const tone1 = Math.sin(2 * Math.PI * freq1 * t) * 0.6;
    const tone2 = Math.sin(2 * Math.PI * freq2 * t) * 0.4;

    // Harmonics
    const harm1 = Math.sin(2 * Math.PI * freq1 * 2 * t) * 0.15;
    const harm2 = Math.sin(2 * Math.PI * freq2 * 2 * t) * 0.1;

    // Click attack
    const attackEnv = Math.exp(-t * 150);
    const attack = (Math.random() * 2 - 1) * attackEnv * 0.3;

    samples[i] = (tone1 + tone2 + harm1 + harm2 + attack) * env * 0.7;
  }

  return samples;
}

/**
 * Generate a clave sample
 */
async function generateClave(): Promise<Float32Array> {
  const duration = 0.1;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Sharp woody attack
    const env = Math.exp(-t * 60);

    // High-pitched woody tone
    const freq = 2500;
    const tone = Math.sin(2 * Math.PI * freq * t);
    const harm = Math.sin(2 * Math.PI * freq * 2.7 * t) * 0.3;

    samples[i] = (tone + harm) * env * 0.75;
  }

  return samples;
}

/**
 * Generate a tambourine sample
 */
async function generateTambourine(): Promise<Float32Array> {
  const duration = 0.3;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / SAMPLE_RATE;

    // Jingle decay
    const env = Math.exp(-t * 12);

    // Multiple jingles (high-frequency metallic tones)
    const jingle1 = Math.sin(2 * Math.PI * 7000 * t) * 0.2;
    const jingle2 = Math.sin(2 * Math.PI * 9000 * t) * 0.15;
    const jingle3 = Math.sin(2 * Math.PI * 11000 * t) * 0.1;
    const jingle4 = Math.sin(2 * Math.PI * 6000 * t) * 0.15;

    // Noise component
    const noise = (Math.random() * 2 - 1) * 0.4;

    // Hand slap transient
    const slapEnv = Math.exp(-t * 40);
    const slap = (Math.random() * 2 - 1) * slapEnv * 0.3;

    samples[i] = (jingle1 + jingle2 + jingle3 + jingle4 + noise + slap) * env * 0.55;
  }

  return samples;
}

/**
 * Main generation function
 */
async function main() {
  console.log('Generating drum samples...\n');

  const samples = [
    // Core kit
    { name: 'kick', generate: generateKick },
    { name: 'snare', generate: generateSnare },
    { name: 'hihat-closed', generate: generateHihatClosed },
    { name: 'hihat-open', generate: generateHihatOpen },
    { name: 'clap', generate: generateClap },
    { name: 'rim', generate: generateRim },
    // Toms
    { name: 'tom-high', generate: generateTom(200) },
    { name: 'tom-mid', generate: generateTom(130) },
    { name: 'tom-low', generate: generateTom(80) },
    // Cymbals
    { name: 'crash', generate: generateCrash },
    { name: 'ride', generate: generateRide },
    // 808
    { name: '808-kick', generate: generate808Kick },
    // Percussion
    { name: 'shaker', generate: generateShaker },
    { name: 'cowbell', generate: generateCowbell },
    { name: 'clave', generate: generateClave },
    { name: 'tambourine', generate: generateTambourine },
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
