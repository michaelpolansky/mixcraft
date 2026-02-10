import type { ConceptTrack } from '../../core/types.ts';

export interface ConceptMetadata {
  id: string;
  title: string;
  track: ConceptTrack;
  summary: string;
  tags: string[];
}

export const conceptMetadata: ConceptMetadata[] = [
  // Sound Design
  { id: 'oscillator', title: 'Oscillator', track: 'sound-design', summary: 'An oscillator is the fundamental sound source in a synthesizer, generating a repeating waveform at a specific pitch.', tags: ['oscillator', 'waveform', 'pitch', 'tone generator', 'synthesis'] },
  { id: 'waveform', title: 'Waveform', track: 'sound-design', summary: 'A waveform describes the shape of an oscillator\'s repeating cycle, which determines its harmonic content and timbre.', tags: ['waveform', 'sine', 'sawtooth', 'square', 'triangle'] },
  { id: 'filter-cutoff', title: 'Filter Cutoff', track: 'sound-design', summary: 'The cutoff frequency determines the point at which a filter begins to attenuate frequencies in the audio signal.', tags: ['filter', 'cutoff', 'frequency', 'brightness', 'low-pass'] },
  { id: 'filter-resonance', title: 'Filter Resonance', track: 'sound-design', summary: 'Resonance boosts frequencies near the filter cutoff point, adding emphasis, character, and at high settings, a whistling quality.', tags: ['resonance', 'Q factor', 'filter', 'self-oscillation', 'emphasis'] },
  { id: 'filter-types', title: 'Filter Types', track: 'sound-design', summary: 'Different filter types (low-pass, high-pass, band-pass) remove different frequency ranges to shape the tonal character of a sound.', tags: ['filter', 'low-pass', 'high-pass', 'band-pass', 'frequency shaping'] },
  { id: 'amplitude-envelope', title: 'Amplitude Envelope', track: 'sound-design', summary: 'The amplitude envelope shapes how a sound\'s volume changes over time from the moment a note is pressed to after it is released.', tags: ['envelope', 'amplitude', 'ADSR', 'volume', 'dynamics'] },
  { id: 'adsr', title: 'ADSR Envelope', track: 'sound-design', summary: 'ADSR stands for Attack, Decay, Sustain, and Release, the four stages that define how a parameter changes over time.', tags: ['ADSR', 'attack', 'decay', 'sustain', 'release'] },
  { id: 'lfo', title: 'LFO (Low Frequency Oscillator)', track: 'sound-design', summary: 'An LFO generates a slow, repeating waveform used to modulate other parameters, creating movement and animation in a sound.', tags: ['LFO', 'modulation', 'vibrato', 'tremolo', 'movement'] },
  { id: 'modulation', title: 'Modulation', track: 'sound-design', summary: 'Modulation is the process of using one signal to control another, adding movement, expression, and evolving character to a sound.', tags: ['modulation', 'routing', 'mod matrix', 'expression', 'movement'] },
  { id: 'effects-chain', title: 'Effects Chain', track: 'sound-design', summary: 'An effects chain is a series of audio processors applied in sequence to shape, enhance, or transform a sound.', tags: ['effects', 'signal chain', 'processing', 'dry/wet', 'audio effects'] },
  { id: 'distortion', title: 'Distortion', track: 'sound-design', summary: 'Distortion adds harmonic overtones by clipping or saturating a signal, creating warmth at low levels and aggression at high levels.', tags: ['distortion', 'saturation', 'overdrive', 'clipping', 'harmonics'] },
  { id: 'delay', title: 'Delay', track: 'sound-design', summary: 'Delay creates echoes of the original signal at a set time interval, adding rhythmic depth and space.', tags: ['delay', 'echo', 'feedback', 'time-based', 'rhythmic'] },
  { id: 'reverb', title: 'Reverb', track: 'sound-design', summary: 'Reverb simulates the natural reflections of sound in a space, adding depth, dimension, and a sense of environment.', tags: ['reverb', 'space', 'ambience', 'decay', 'reflections'] },
  { id: 'chorus', title: 'Chorus', track: 'sound-design', summary: 'Chorus creates a thicker, wider sound by layering slightly detuned and delayed copies of the signal.', tags: ['chorus', 'detuning', 'width', 'thickness', 'modulation effect'] },
  { id: 'fm-synthesis', title: 'FM Synthesis', track: 'sound-design', summary: 'FM synthesis creates complex timbres by using one oscillator (the modulator) to modulate the frequency of another (the carrier).', tags: ['FM', 'frequency modulation', 'carrier', 'modulator', 'DX7'] },
  { id: 'harmonicity', title: 'Harmonicity', track: 'sound-design', summary: 'Harmonicity is the frequency ratio between the modulator and carrier oscillators in FM synthesis, determining the harmonic structure.', tags: ['harmonicity', 'FM', 'frequency ratio', 'carrier', 'modulator'] },
  { id: 'modulation-index', title: 'Modulation Index', track: 'sound-design', summary: 'The modulation index controls the depth of frequency modulation in FM synthesis, determining the brightness and complexity of the sound.', tags: ['modulation index', 'FM depth', 'sidebands', 'brightness', 'FM synthesis'] },
  { id: 'additive-synthesis', title: 'Additive Synthesis', track: 'sound-design', summary: 'Additive synthesis builds complex sounds by combining many individual sine wave partials, each with independent amplitude control.', tags: ['additive', 'harmonics', 'partials', 'Fourier', 'sine waves'] },
  { id: 'harmonics', title: 'Harmonics', track: 'sound-design', summary: 'Harmonics are integer multiples of a fundamental frequency that together define a sound\'s timbre and tonal character.', tags: ['harmonics', 'overtones', 'partials', 'timbre', 'spectrum'] },
  { id: 'noise', title: 'Noise', track: 'sound-design', summary: 'Noise generators produce random signals used for adding texture, breath, transients, and percussive character to synthesized sounds.', tags: ['noise', 'white noise', 'pink noise', 'texture', 'transient'] },

  // Mixing
  { id: 'eq', title: 'Equalization (EQ)', track: 'mixing', summary: 'EQ adjusts the level of specific frequency ranges in an audio signal, used to shape tone, fix problems, and create space in a mix.', tags: ['EQ', 'equalization', 'frequency', 'tone', 'mixing'] },
  { id: 'frequency-spectrum', title: 'Frequency Spectrum', track: 'mixing', summary: 'The frequency spectrum is the full range of audible frequencies from 20 Hz to 20 kHz, divided into regions with distinct sonic characteristics.', tags: ['spectrum', 'frequency range', 'Hz', 'bandwidth', 'analysis'] },
  { id: 'low-end', title: 'Low End', track: 'mixing', summary: 'The low end (20-250 Hz) encompasses sub-bass and bass frequencies that provide the foundation, weight, and physical impact of a mix.', tags: ['low end', 'bass', 'sub-bass', 'foundation', 'weight'] },
  { id: 'mid-range', title: 'Mid Range', track: 'mixing', summary: 'The midrange (250 Hz-4 kHz) carries the most musical information, including melody, speech intelligibility, and instrument definition.', tags: ['midrange', 'mids', 'presence', 'clarity', 'intelligibility'] },
  { id: 'high-end', title: 'High End', track: 'mixing', summary: 'The high end (4-20 kHz) adds brightness, airiness, detail, and sparkle to a mix.', tags: ['high end', 'treble', 'brightness', 'air', 'sparkle'] },
  { id: 'compression', title: 'Compression', track: 'mixing', summary: 'Compression reduces the dynamic range of audio by attenuating signals that exceed a threshold, evening out loud and quiet parts.', tags: ['compression', 'dynamics', 'dynamic range', 'gain reduction', 'compressor'] },
  { id: 'threshold', title: 'Threshold', track: 'mixing', summary: 'The threshold is the level above which a compressor begins to reduce gain, measured in decibels.', tags: ['threshold', 'compression', 'level', 'dB', 'dynamics'] },
  { id: 'ratio', title: 'Compression Ratio', track: 'mixing', summary: 'The ratio determines how much a compressor reduces the signal above the threshold, expressed as input-to-output proportion.', tags: ['ratio', 'compression', 'gain reduction', 'limiting', 'dynamics'] },
  { id: 'attack-release', title: 'Compressor Attack & Release', track: 'mixing', summary: 'Attack and release times control how quickly a compressor responds to signals exceeding the threshold and how quickly it recovers.', tags: ['attack', 'release', 'compression', 'transient', 'dynamics'] },
  { id: 'bus-compression', title: 'Bus Compression', track: 'mixing', summary: 'Bus compression applies gentle compression to grouped tracks or the master bus to glue elements together into a cohesive mix.', tags: ['bus compression', 'glue', 'mix bus', 'stereo bus', 'mastering'] },
  { id: 'panning', title: 'Panning', track: 'mixing', summary: 'Panning positions a sound in the stereo field between the left and right speakers, creating width and spatial separation.', tags: ['panning', 'stereo', 'left/right', 'spatial', 'positioning'] },
  { id: 'stereo-imaging', title: 'Stereo Imaging', track: 'mixing', summary: 'Stereo imaging refers to the overall spatial width and placement of sounds across the stereo field in a mix.', tags: ['stereo', 'imaging', 'width', 'spatial', 'panorama'] },
  { id: 'reverb-depth', title: 'Reverb & Depth', track: 'mixing', summary: 'Reverb creates a sense of front-to-back depth in a mix, placing sounds closer or farther from the listener.', tags: ['reverb', 'depth', 'front-to-back', 'space', 'dimension'] },
  { id: 'volume-balance', title: 'Volume Balance', track: 'mixing', summary: 'Volume balance is the relative loudness relationship between all tracks in a mix, forming the foundation of a good mix.', tags: ['volume', 'balance', 'levels', 'faders', 'gain'] },
  { id: 'gain-staging', title: 'Gain Staging', track: 'mixing', summary: 'Gain staging is the practice of managing signal levels at each point in the audio chain to maintain optimal headroom and signal quality.', tags: ['gain staging', 'headroom', 'level', 'signal flow', 'clipping'] },

  // Production
  { id: 'layering', title: 'Layering', track: 'production', summary: 'Layering combines multiple sounds playing together to create a thicker, richer, and more complex composite tone.', tags: ['layering', 'stacking', 'combining', 'thickness', 'production'] },
  { id: 'frequency-stacking', title: 'Frequency Stacking', track: 'production', summary: 'Frequency stacking assigns each sound layer to a specific frequency band, ensuring clarity and power in the combined result.', tags: ['frequency stacking', 'layering', 'spectrum', 'separation', 'production technique'] },
  { id: 'arrangement', title: 'Arrangement', track: 'production', summary: 'Arrangement is the organization of musical elements over time, determining which instruments play during each section of a song.', tags: ['arrangement', 'structure', 'sections', 'buildup', 'production'] },
  { id: 'stereo-width', title: 'Stereo Width', track: 'production', summary: 'Stereo width is the perceived horizontal spread of a mix, controlled through panning, stereo effects, and mid-side techniques.', tags: ['stereo width', 'wide', 'narrow', 'spatial', 'panorama'] },
  { id: 'mix-bus', title: 'Mix Bus', track: 'production', summary: 'The mix bus (or stereo bus) is the final summing point of all tracks in a mix, where master processing is applied.', tags: ['mix bus', 'stereo bus', 'master', 'summing', 'final output'] },

  // Sampling
  { id: 'sample-rate', title: 'Sample Rate', track: 'sampling', summary: 'The sample rate is how many times per second an audio signal is measured, determining the highest frequency that can be captured.', tags: ['sample rate', 'digital audio', 'Nyquist', 'resolution', 'Hz'] },
  { id: 'pitch-shifting', title: 'Pitch Shifting', track: 'sampling', summary: 'Pitch shifting changes the pitch of a sample without altering its playback speed, using time-domain or frequency-domain algorithms.', tags: ['pitch shifting', 'transpose', 'semitone', 'tuning', 'repitch'] },
  { id: 'time-stretching', title: 'Time Stretching', track: 'sampling', summary: 'Time stretching changes the duration of a sample without altering its pitch, enabling tempo-matching of loops and recordings.', tags: ['time stretch', 'tempo', 'duration', 'warping', 'granular'] },
  { id: 'slicing', title: 'Sample Slicing', track: 'sampling', summary: 'Slicing divides a sample into individual segments that can be triggered, rearranged, and played independently.', tags: ['slicing', 'chopping', 'segments', 'transient', 'beat slicing'] },
  { id: 'fades', title: 'Fades', track: 'sampling', summary: 'Fades gradually increase (fade-in) or decrease (fade-out) a signal\'s volume, used to smooth transitions and eliminate clicks.', tags: ['fade', 'crossfade', 'transition', 'click removal', 'smoothing'] },

  // Drum Sequencing
  { id: 'step-sequencing', title: 'Step Sequencing', track: 'drum-sequencing', summary: 'Step sequencing programs drum patterns by activating or deactivating steps on a grid, typically 16 steps per bar.', tags: ['step sequencer', 'drum machine', 'grid', 'pattern', 'TR-808'] },
  { id: 'velocity', title: 'Velocity', track: 'drum-sequencing', summary: 'Velocity controls how hard each note or step is played, affecting volume and often timbre for more expressive, human-like patterns.', tags: ['velocity', 'dynamics', 'expression', 'accent', 'ghost notes'] },
  { id: 'swing', title: 'Swing', track: 'drum-sequencing', summary: 'Swing shifts the timing of every other step slightly late, creating a shuffled, bouncy feel instead of a straight, rigid groove.', tags: ['swing', 'shuffle', 'timing', 'feel', 'groove'] },
  { id: 'groove', title: 'Groove', track: 'drum-sequencing', summary: 'Groove is the overall rhythmic feel of a pattern, created by the combination of timing, velocity, and pattern choices.', tags: ['groove', 'feel', 'rhythm', 'pocket', 'beat'] },
  { id: 'tempo', title: 'Tempo', track: 'drum-sequencing', summary: 'Tempo is the speed of the music measured in beats per minute (BPM), defining the pace and energy of a track.', tags: ['tempo', 'BPM', 'speed', 'pace', 'beats per minute'] },
];
