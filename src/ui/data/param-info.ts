/**
 * Parameter Information
 * Educational descriptions for all synth parameters
 * Used by InfoPanel to provide context-sensitive help
 */

export interface ParamInfo {
  name: string;
  description: string;
  tips?: string;
}

export const PARAM_INFO: Record<string, ParamInfo> = {
  // ===========================================
  // Subtractive Synthesis - Oscillator
  // ===========================================
  'oscillator.type': {
    name: 'Waveform',
    description: 'The basic shape of the sound wave. Each waveform has a different harmonic content.',
    tips: 'Sine = pure tone, no harmonics. Sawtooth = bright, all harmonics. Square = hollow, odd harmonics. Triangle = soft, few harmonics.',
  },
  'oscillator.octave': {
    name: 'Octave',
    description: 'Shifts the pitch up or down by octaves. Each octave doubles or halves the frequency.',
    tips: 'Use -1 or -2 for bass sounds, +1 or +2 for leads.',
  },
  'oscillator.detune': {
    name: 'Detune',
    description: 'Fine-tunes the pitch in cents (1/100th of a semitone). Creates thickness when layered.',
    tips: 'Subtle detune (5-15 cents) adds warmth. Heavy detune creates dissonance.',
  },

  // ===========================================
  // Subtractive Synthesis - Filter
  // ===========================================
  'filter.type': {
    name: 'Filter Type',
    description: 'Controls which frequencies are reduced. The core of subtractive synthesis.',
    tips: 'Lowpass = cuts highs (most common). Highpass = cuts lows. Bandpass = keeps only middle frequencies.',
  },
  'filter.cutoff': {
    name: 'Cutoff Frequency',
    description: 'The frequency where the filter starts working. Frequencies beyond this point are reduced.',
    tips: 'Lower cutoff = darker, muffled sound. Higher cutoff = brighter, more present.',
  },
  'filter.resonance': {
    name: 'Resonance',
    description: 'Boosts frequencies right at the cutoff point, creating a peak or "ring".',
    tips: 'Low resonance = smooth rolloff. High resonance = sharp, whistling quality. Classic acid bass uses high resonance.',
  },

  // ===========================================
  // Amplitude Envelope
  // ===========================================
  'amplitude.attack': {
    name: 'Attack',
    description: 'How quickly the sound reaches full volume after a note is played.',
    tips: 'Short (1-10ms) = percussive, snappy. Long (100ms+) = slow fade-in, pad-like.',
  },
  'amplitude.decay': {
    name: 'Decay',
    description: 'How quickly the sound drops from peak to sustain level.',
    tips: 'Short decay = plucky. Long decay = smooth transition to sustain.',
  },
  'amplitude.sustain': {
    name: 'Sustain',
    description: 'The volume level while a note is held, after attack and decay complete.',
    tips: 'High sustain = organ-like, holds steady. Low sustain = piano-like, fades while held.',
  },
  'amplitude.release': {
    name: 'Release',
    description: 'How quickly the sound fades after releasing a note.',
    tips: 'Short release = tight, staccato. Long release = smooth fade, good for pads.',
  },

  // ===========================================
  // Filter Envelope
  // ===========================================
  'filterEnv.attack': {
    name: 'Filter Attack',
    description: 'How quickly the filter cutoff moves after a note is played.',
    tips: 'Works with envelope amount to create timbral movement over time.',
  },
  'filterEnv.decay': {
    name: 'Filter Decay',
    description: 'How quickly the filter returns from peak to sustain position.',
    tips: 'Short decay with positive amount = classic "pluck" sound.',
  },
  'filterEnv.sustain': {
    name: 'Filter Sustain',
    description: 'Where the filter settles while holding a note.',
    tips: 'Combined with envelope amount, determines the held brightness.',
  },
  'filterEnv.release': {
    name: 'Filter Release',
    description: 'How the filter moves after releasing a note.',
    tips: 'Usually matches or exceeds amplitude release for natural decay.',
  },
  'filterEnv.amount': {
    name: 'Envelope Amount',
    description: 'How much the envelope affects the filter cutoff. Can be positive or negative.',
    tips: 'Positive = brighter on attack. Negative = darker on attack. Zero = no movement.',
  },

  // ===========================================
  // LFO
  // ===========================================
  'lfo.rate': {
    name: 'LFO Rate',
    description: 'How fast the LFO oscillates. Measured in Hz (cycles per second).',
    tips: 'Slow (0.1-1 Hz) = gentle movement. Fast (5-20 Hz) = vibrato or wobble.',
  },
  'lfo.depth': {
    name: 'LFO Depth',
    description: 'How much the LFO affects the filter cutoff.',
    tips: 'Subtle depth = gentle animation. High depth = dramatic sweeps or wobbles.',
  },
  'lfo.waveform': {
    name: 'LFO Waveform',
    description: 'The shape of the LFO modulation.',
    tips: 'Sine = smooth. Triangle = smooth. Square = abrupt changes. Sawtooth = ramp up/down.',
  },

  // ===========================================
  // Effects - Distortion
  // ===========================================
  'distortion.amount': {
    name: 'Distortion Amount',
    description: 'How much the signal is overdriven. Adds harmonics and grit.',
    tips: 'Low = subtle warmth. High = aggressive, fuzzy character.',
  },
  'distortion.mix': {
    name: 'Distortion Mix',
    description: 'Balance between clean (dry) and distorted (wet) signal.',
    tips: 'Lower mix preserves dynamics while adding edge.',
  },

  // ===========================================
  // Effects - Delay
  // ===========================================
  'delay.time': {
    name: 'Delay Time',
    description: 'The time between the original sound and its echo.',
    tips: 'Short (50-100ms) = slapback. Medium (200-500ms) = rhythmic. Long = ambient.',
  },
  'delay.feedback': {
    name: 'Delay Feedback',
    description: 'How much of the delayed signal feeds back, creating multiple echoes.',
    tips: 'Low = single echo. High = many repeating echoes. Very high = infinite/runaway.',
  },
  'delay.mix': {
    name: 'Delay Mix',
    description: 'Balance between dry signal and delayed signal.',
    tips: 'Subtle mix adds depth. High mix creates washy, ambient textures.',
  },

  // ===========================================
  // Effects - Reverb
  // ===========================================
  'reverb.decay': {
    name: 'Reverb Decay',
    description: 'How long the reverb tail lasts. Simulates room size.',
    tips: 'Short (0.5-1s) = small room. Medium (1-3s) = hall. Long (4s+) = cathedral.',
  },
  'reverb.mix': {
    name: 'Reverb Mix',
    description: 'Balance between dry signal and reverb.',
    tips: 'Subtle mix adds space. High mix creates distant, atmospheric sounds.',
  },

  // ===========================================
  // Effects - Chorus
  // ===========================================
  'chorus.rate': {
    name: 'Chorus Rate',
    description: 'Speed of the chorus modulation.',
    tips: 'Slow = lush, subtle movement. Fast = more obvious wobble.',
  },
  'chorus.depth': {
    name: 'Chorus Depth',
    description: 'Intensity of the pitch/delay modulation.',
    tips: 'Low = subtle thickening. High = dramatic detuning effect.',
  },
  'chorus.mix': {
    name: 'Chorus Mix',
    description: 'Balance between dry and chorused signal.',
    tips: 'Adds width and richness. Classic for pads and clean guitars.',
  },

  // ===========================================
  // Volume
  // ===========================================
  'volume': {
    name: 'Volume',
    description: 'Master output level in decibels (dB).',
    tips: 'Keep around -12dB to leave headroom. Adjust for balance in a mix.',
  },

  // ===========================================
  // FM Synthesis
  // ===========================================
  'fm.harmonicity': {
    name: 'Harmonicity',
    description: 'Ratio between modulator and carrier frequencies. The core of FM timbre.',
    tips: 'Integer values (1,2,3,4) = harmonic, musical tones. Non-integers (3.5, 7.1) = bell-like, inharmonic.',
  },
  'fm.modulationIndex': {
    name: 'Modulation Index',
    description: 'Depth of frequency modulation. Controls brightness and harmonic complexity.',
    tips: 'Low (0-2) = subtle harmonics. Medium (3-5) = rich tone. High (6-10) = aggressive, complex.',
  },
  'fm.carrierType': {
    name: 'Carrier Waveform',
    description: 'The waveform of the main oscillator that you hear.',
    tips: 'Sine is classic FM. Other waveforms add extra harmonics before modulation.',
  },
  'fm.modulatorType': {
    name: 'Modulator Waveform',
    description: 'The waveform that modulates the carrier frequency.',
    tips: 'Sine = classic FM. Other waveforms create more complex, harsh modulation.',
  },
  'fm.modulationEnvelopeAmount': {
    name: 'Mod Envelope Amount',
    description: 'How much the envelope affects modulation intensity over time.',
    tips: 'High amount = bright attack that mellows. Creates plucky, evolving timbres.',
  },

  // ===========================================
  // Additive Synthesis
  // ===========================================
  'additive.harmonic': {
    name: 'Harmonic',
    description: 'Amplitude of this harmonic partial. Harmonics are multiples of the fundamental frequency.',
    tips: 'Harmonic 1 = fundamental. Harmonic 2 = octave above. Harmonic 3 = octave + fifth.',
  },
  'additive.preset.saw': {
    name: 'Sawtooth Preset',
    description: 'All harmonics present with 1/n amplitude falloff.',
    tips: 'Bright, buzzy sound. Foundation of many synth leads and basses.',
  },
  'additive.preset.square': {
    name: 'Square Preset',
    description: 'Only odd harmonics (1, 3, 5, 7...) with 1/n amplitude.',
    tips: 'Hollow, woody sound. Classic for clarinets and retro game audio.',
  },
  'additive.preset.triangle': {
    name: 'Triangle Preset',
    description: 'Only odd harmonics with 1/n² amplitude (faster falloff).',
    tips: 'Soft, flute-like sound. Fewer high harmonics than square.',
  },
  'additive.preset.organ': {
    name: 'Organ Preset',
    description: 'Selected harmonics at specific levels, like Hammond drawbars.',
    tips: 'Classic organ registration. Adjust individual harmonics to taste.',
  },
};

/**
 * Get info for a parameter, with fallback
 */
export function getParamInfo(paramId: string): ParamInfo {
  return PARAM_INFO[paramId] ?? {
    name: paramId,
    description: 'Hover over controls to learn about them.',
    tips: '',
  };
}

/**
 * Default info shown when nothing is hovered
 */
export const DEFAULT_INFO: ParamInfo = {
  name: 'Info Panel',
  description: 'Hover over any control to learn what it does and how to use it.',
  tips: 'Each parameter shapes your sound in a different way. Experiment!',
};
