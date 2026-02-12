# MIXCRAFT — Product Specification

**Version 2.0 | February 2026**

*Learn Sound Design, Production, and Mixing Through Play.*

---

## Table of Contents

1. Executive Summary
2. Product Vision
3. Game Overview
4. Sound Design Module
5. Production Module
6. Mixing Module
7. Audio Engine
8. Visualization System
9. Evaluation System
10. AI Feedback System
11. User Interface
12. Technical Architecture
13. Content Requirements
14. Development Roadmap
15. Business Model
16. Risks & Mitigations
17. Success Metrics

---

## 1. Executive Summary

MIXCRAFT is a game that teaches music production through interactive challenges and AI-powered feedback. Players learn sound design, production techniques, and mixing by doing, with an AI mentor that hears their work and provides personalized guidance.

The product spans three interconnected disciplines: Sound Design (synthesis and sound creation), Production (arrangement and layering), and Mixing (balance, EQ, compression, and effects). Players can enter at any point, but the curriculum flows naturally from synthesis through production to mixing.

The core innovation is AI that analyzes actual audio and explains what it hears in plain language. Like having a professional producer looking over your shoulder, but accessible to everyone at a fraction of the cost of private mentorship.

---

## 2. Product Vision

### 2.1 Mission Statement

Make music production learnable through play. Give everyone access to the kind of personalized feedback that only expensive mentorship provides.

### 2.2 Success Criteria

| Criterion | Target | Measurement |
|---|---|---|
| Problem identification skill | Can identify and fix common issues after 10 hours | In-game assessment challenges |
| Conceptual understanding | Reports "I finally understand" moments | Post-session survey |
| Session engagement | >45 minutes average | Session analytics |
| Curriculum completion | >50% complete fundamentals | Progress analytics |
| Professional validation | Positive educator/producer reception | Review panel feedback |

### 2.3 Target Audience

**Primary:** Aspiring music producers (16-35) who want to learn but find DAWs overwhelming. Bedroom producers stuck at demo quality who know something is wrong with their mixes but cannot identify what.

**Secondary:** Musicians who want to understand production better. Singers, songwriters, and instrumentalists who want their recordings to sound professional.

**Tertiary:** Audio engineering students seeking structured practice with intelligent feedback beyond what classroom settings provide.

**Not target:** Professional engineers (they do not need this) and pure consumers (not interested in making music).

### 2.4 Competitive Landscape

| Product | What It Does | MIXCRAFT Differentiator |
|---|---|---|
| Syntorial ($129) | Synthesis tutorials, call-and-response | Gamified with AI feedback; covers full production chain, not just synthesis |
| YouTube tutorials | Passive video instruction | Interactive; hears YOUR audio; personalized feedback |
| GarageBand tutorials | Static, one-size-fits-all guidance | Adaptive difficulty; AI-powered analysis; progressive curriculum |
| Actual DAWs (Ableton, Logic) | Powerful but no guidance | Structured learning path with intelligent feedback |
| Guitar Hero / Rocksmith | Performance games | MIXCRAFT teaches creation and production, not performance |
| Splice / Sample packs | Pre-made sounds | MIXCRAFT teaches you to make and shape sounds yourself |

---

## 3. Game Overview

### 3.1 Core Loop

The gameplay follows a six-phase loop: CHALLENGE (receive audio with specific problems or a target to match), LISTEN (hear the audio and see visualizations), ADJUST (apply synthesis parameters, EQ, compression, or effects), FEEDBACK (AI analyzes your work and explains what it hears), LEARN (understand why your choices worked or did not), ADVANCE (progress to harder challenges and unlock new tools).

### 3.2 Five-Track Structure

MIXCRAFT teaches five interconnected disciplines that build on each other. Sound Design teaches synthesis, filters, envelopes, and modulation, answering "what does this sound like?" Production teaches layering, arrangement, frequency stacking, and space, answering "how do sounds work together?" Mixing teaches EQ, compression, reverb, stereo imaging, and levels, answering "how do I make this sound good?" Sampling teaches sample manipulation, chopping, pitch/time shifting, and creative reuse, answering "how do I transform existing sounds?" Drum Sequencing teaches step sequencing, groove, velocity, and genre patterns, answering "how do I build rhythms?" Players can enter at any point but the curriculum flows naturally from sound design through to mixing.

### 3.3 Design Pillars

**Real Audio:** Players work with actual audio, not abstractions. They hear the problems, hear the fixes, and develop their ears through direct experience.

**Visible Sound:** Every tool is visualized. See the spectrum, see the dynamics, see what compression does to a waveform. Visualization is the primary teaching mechanism.

**Intelligent Feedback:** AI does not just grade pass/fail. It explains what you did, what happened sonically, and how to improve. Like a mentor in the room.

**Progressive Mastery:** Start with one knob. End with full mixing sessions. Skills build on each other. Tool complexity unlocks as understanding develops. Each challenge exposes exactly the controls relevant to its lesson — early challenges show only waveform selection, later ones progressively add filter, envelope, LFO, and effects controls. Visualizations are also per-challenge: a filter lesson shows the filter response curve alongside the spectrum analyzer.

---

## 4. Sound Design Module

Sound design is the recommended entry point. It teaches foundational concepts (harmonics, filtering, envelopes) that make mixing intuitive later. It has lower content requirements (synthesis generates its own audio), clearer success criteria, and more immediate creative reward.

### 4.1 Synthesis Engine

Built on Tone.js, the synthesis engine provides subtractive synthesis (MonoSynth, PolySynth with oscillator, filter, and envelope), FM synthesis (FMSynth with carrier/modulator, ratios, and modulation index), AM synthesis (AMSynth), sampling (Sampler with pitch shifting, time stretching, slicing), and modular building blocks (Oscillator, Filter, Envelope, LFO) that can be freely connected.

All synth parameters are exposed to the UI and automatable. Players interact with visual controls that map directly to synthesis parameters.

### 4.2 Concepts Taught

| Concept | What Players Learn | How It Connects Forward |
|---|---|---|
| Oscillators | Waveform shapes create different harmonic content | Understanding harmonics is foundation of EQ |
| Filters | Removing frequencies shapes tone and character | Filters ARE simplified EQ; same principles |
| Envelopes (ADSR) | Attack/decay/sustain/release shape sound over time | Compression manipulates dynamics similarly |
| LFOs / Modulation | Periodic changes create movement and interest | Modulation effects (chorus, flanger) use same principle |
| FM Synthesis | Frequency relationships create complex timbres | Understanding harmonics and inharmonics |
| Effects chain | Distortion, chorus, reverb shape character | Same effects used in mixing context |
| Layering | Combining sounds for thickness and complexity | Core production and mixing skill |

### 4.3 Sound Design Challenges

| Challenge Type | Given | Goal | Evaluation Method |
|---|---|---|---|
| Recreate This Sound | Target sound (plays on demand) | Build it from scratch using synth | Spectral + temporal similarity |
| Design For Purpose | Description (e.g., "punchy kick") | Create a sound matching the description | AI assessment of intent match |
| Fix This Patch | Synth patch with problems | Identify and fix issues | Problem detection + improvement |
| Layer These Sounds | Two or more weak sounds | Combine into one strong sound | Resulting sound quality score |
| Make It Move | Static, boring sound | Add interest through modulation | Movement analysis + AI assessment |

### 4.4 Sound Design Curriculum

#### Subtractive Synthesis (SD1-SD17, 86 challenges)

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| SD1 | Oscillator Fundamentals | 4 | Waveform recognition, harmonic content, per-control granularity (only relevant knobs visible) |
| SD2 | Filter Basics | 4 | Filter types, cutoff, resonance, tone shaping |
| SD3 | Envelopes | 4 | ADSR on amplitude, percussive vs sustained, filter envelope |
| SD4 | Modulation | 4 | LFOs, vibrato, tremolo, filter modulation |
| SD5 | Effects in Sound Design | 4 | Distortion for harmonics, chorus for width, reverb for character |
| SD6 | Synthesis Techniques | 6 | Subtractive classics, combined techniques |
| SD7 | Genre Sound Design | 6 | EDM basses, hip-hop, ambient textures, rock amp sim |
| SD10 | Arpeggiator | 6 | Pattern-based sequencing, up/down/random modes, tempo sync |
| SD11 | Unison & Supersaw | 6 | Voice stacking, detuning, stereo spread |
| SD12 | Oscillator 2 | 6 | Dual-oscillator layering, detuning, mix balance |
| SD13 | Sub Oscillator | 6 | Sub bass reinforcement, octave selection |
| SD14 | Noise Shaping | 6 | White/pink/brown noise, transient design, texture |
| SD15 | Glide & Portamento | 6 | Pitch sliding, legato, glide time |
| SD16 | Velocity Sensitivity | 6 | Dynamic expression, velocity-to-filter mapping |
| SD17 | Combined Techniques | 6 | Multi-concept challenges using all synthesis tools |

#### FM Synthesis (SD8, 12 challenges)

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| SD8 | FM Synthesis | 12 | Harmonicity ratios, modulation index, carrier/modulator waveforms, FM bells and basses |

#### Additive Synthesis (SD9, 12 challenges)

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| SD9 | Additive Synthesis | 12 | Harmonic drawbars, Fourier synthesis, organ timbres, spectral shaping |

| **Total** | | **110** | |

SD1-SD4 challenges use per-control visibility — each challenge specifies exactly which knobs are available, with per-challenge visualization arrays showing relevant viz panels (oscilloscope, filter response, envelope shape, etc.).

---

## 5. Production Module

The production module bridges sound design and mixing. Players learn how individual sounds work together in context, covering frequency allocation, layering, arrangement, rhythm, and spatial placement.

### 5.1 Production Curriculum

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| P1 | Frequency Stacking | 4 | Each element owns a frequency range; avoiding collisions |
| P2 | Layering | 4 | Combining sounds for thickness; attack + body + sub |
| P3 | Arrangement Energy | 4 | Build and release; adding/removing elements; frequency density |
| P4 | Rhythm and Groove | 4 | Timing relationships; swing and feel; percussion layering |
| P5 | Space and Depth | 4 | Front to back placement; reverb as arrangement tool; mono vs stereo |
| **Total** | | **20** | |

---

## 5a. Sampling Module

The sampling module teaches sample manipulation, chopping, pitch/time shifting, and creative reuse. Players work with a waveform editor to slice, tune, and transform audio samples.

### 5a.1 Sampling Curriculum

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| SM1 | Sample Basics | 4 | Start/end points, fade in/out, basic editing |
| SM2 | Chopping | 4 | Slice markers, chop-challenge workflow |
| SM3 | Pitch Shifting | 4 | Tuning samples, pitch shifting, tune-to-track |
| SM4 | Time Stretch | 4 | Time stretching, tempo matching |
| SM5 | Creative Flipping | 4 | Flip-this challenges, creative reuse |
| SM6 | Sample Cleaning | 4 | Clean-sample challenges, noise removal |
| **Total** | | **24** | |

---

## 5b. Drum Sequencing Module

The drum sequencing module teaches step sequencing, groove, velocity dynamics, and genre-specific patterns. Players work with a step grid and velocity lanes to build drum patterns.

### 5b.1 Drum Sequencing Curriculum

| Module | Concept | Challenges | Key Skills |
|---|---|---|---|
| DS1 | Grid Basics | 4 | 16-step sequencing, kick/snare placement |
| DS2 | Hi-hats | 4 | Open/closed hat patterns, offbeat rhythms |
| DS3 | Groove & Swing | 4 | Swing amount, humanization, feel |
| DS4 | Velocity | 4 | Per-step dynamics, accent patterns |
| DS5 | Genre Patterns | 4 | Hip-hop, house, drum & bass, trap patterns |
| DS6 | Loop Construction | 4 | Full kit patterns, fills, transitions |
| **Total** | | **24** | |

---

## 6. Mixing Module

The mixing module is the largest and most detailed, covering the full spectrum of mixing skills from basic frequency concepts through professional mastering.

### 6.1 Audio Effects

Effects use progressive complexity. Beginner versions expose 2-3 parameters. Advanced versions expose the full parameter set. This prevents overwhelm while allowing deep control as skills develop.

| Effect | Beginner Parameters | Advanced Parameters |
|---|---|---|
| EQ | Frequency, Gain (3 bands) | Frequency, Gain, Q (8 bands), dynamic EQ, M/S mode |
| Compressor | Threshold, Amount | Threshold, Ratio, Attack, Release, Knee, Makeup Gain |
| Reverb | Size, Mix | Pre-delay, Decay, Damping, Mix, Width, EQ |
| Delay | Time, Feedback, Mix | Time, Feedback, Filter, Ping-pong, Sync, Mix |
| Saturation | Drive | Drive, Mix, Character type |
| Limiter | Ceiling | Threshold, Release, Ceiling, True Peak |

### 6.2 Difficulty Progression

| Level | Scope | Description |
|---|---|---|
| 1: Single Tool | One effect on one sound | Fix an obvious problem with large tolerances |
| 2: Single Track | Multiple effects on one sound | Multiple problems with tighter tolerances |
| 3: Two Elements | Balance two competing sounds | Frequency carving, dynamics interaction, musical context |
| 4: Full Mix | Multiple tracks | Full mixing decisions with realistic complexity |
| 5: Mastering | Finished mixes | Subtle adjustments to professional standards |

### 6.3 Mixing Curriculum

#### Fundamentals (Levels 1-2): 32 Challenges

| Module | Concept | Challenges |
|---|---|---|
| F1 | Frequency basics | 4 |
| F2 | EQ cuts (subtractive) | 4 |
| F3 | EQ boosts (additive) | 4 |
| F4 | Dynamics basics | 4 |
| F5 | Compression attack/release | 4 |
| F6 | Reverb basics | 4 |
| F7 | Delay basics | 4 |
| F8 | Levels and gain staging | 4 |

#### Intermediate (Levels 2-3): 42 Challenges

| Module | Concept | Challenges |
|---|---|---|
| I1 | Kick and bass relationship | 6 |
| I2 | Vocal presence and clarity | 6 |
| I3 | Drum punch and impact | 6 |
| I4 | Stereo width and imaging | 6 |
| I5 | Depth and space (reverb/delay) | 6 |
| I6 | Balance and level relationships | 6 |
| I7 | Track dynamics (per-track compression) | 6 |

#### Advanced (Levels 3-4): 36 Challenges

| Module | Concept | Challenges |
|---|---|---|
| A1 | Frequency mastery | 8 |
| A2 | Stereo mastery | 8 |
| A3 | Depth and space | 8 |
| A4 | Advanced dynamics | 4 |
| A5 | Integration | 8 |

#### Mastery (Levels 4-5): 32 Challenges

| Module | Concept | Challenges |
|---|---|---|
| M1 | Full mix | 8 |
| M2 | Genre mixing | 8 |
| M3 | Automation concepts | 8 |
| M4 | Troubleshooting | 8 |

Total hand-crafted challenges across all five tracks: **320** (110 sound design + 20 production + 142 mixing + 24 sampling + 24 drum sequencing). AI-generated challenges provide unlimited additional practice.

---

## 7. Audio Engine

### 7.1 Playback System

Built on Web Audio API with Tone.js for higher-level abstractions. Supports multiple simultaneous tracks (8+), real-time effect processing, low-latency playback (<10ms), and seamless looping. Must work across Chrome, Firefox, Safari, and Edge.

### 7.2 Synthesis System

Tone.js provides all required synthesis capabilities: MonoSynth and PolySynth for subtractive synthesis, FMSynth and AMSynth for frequency/amplitude modulation, Sampler and GrainPlayer for sample-based synthesis, and individual Oscillator, Filter, Envelope, and LFO nodes for modular construction. All parameters are exposed, automatable, and mappable to UI controls.

### 7.3 Analysis System

#### Real-Time Analysis (60fps)

| Analysis | Method | Use |
|---|---|---|
| Spectrum | FFT (2048 samples) | Frequency display, problem highlighting |
| Level meters | RMS + Peak detection | Volume monitoring |
| Waveform | Sample visualization | Time-domain display |
| Stereo field | L/R correlation | Stereo balance indicator |

#### Offline Analysis (After Changes)

| Analysis | Method | Use |
|---|---|---|
| Spectral balance | Averaged FFT | EQ evaluation |
| Dynamic range | Crest factor | Compression evaluation |
| Loudness | ITU-R BS.1770 (LUFS) | Level challenges |
| Problem detection | CNN on mel-spectrogram | Issue identification |
| Sound features | Meyda.js extraction | Sound design evaluation |

### 7.4 Sound Feature Extraction

For sound design evaluation, Meyda.js extracts spectral features (centroid for brightness, spread, rolloff, flatness), temporal features (attack time, decay, sustain level, release), harmonic features (harmonicity, inharmonicity, fundamental frequency), and dynamic features (RMS envelope, peak level, crest factor). These features feed into AI evaluation for subjective criteria like "does this sound punchy?"

---

## 8. Visualization System

Making sound visible is the core educational tool. All visualizations are rendered via Canvas 2D with no custom art assets required.

### 8.1 Spectrum Analyzer

Real-time frequency display with linear or logarithmic scale, adjustable resolution, peak hold, reference curve overlay, and color-coded frequency range labels (sub bass, bass, low mids, mids, high mids, highs, air). Problem regions are highlighted with red tinting. Cursor shows frequency and nearest musical note name.

### 8.2 Waveform Display

Time-domain visualization with zoomable timeline, transient highlighting, clipping indicators, before/after comparison mode, and RMS envelope overlay.

### 8.3 Dynamics Visualization

Input level, output level, gain reduction meter, attack/release timing visualization, and compression transfer curve display. Shows players exactly what the compressor is doing to dynamics in real time.

### 8.4 Synth Visualization

For the sound design module: waveform shape display (oscilloscope), filter response curve, envelope shape visualization, LFO waveform display, effects chain visualization, and real-time spectrum of the synthesized sound. Players see how each parameter change affects the sound visually.

Each challenge specifies which visualization panels to show via a `ChallengeVisualization` array. For example, a filter lesson shows the filter response curve alongside the spectrum analyzer, while an oscillator lesson shows the oscilloscope. This per-challenge approach ensures students see the visualizations most relevant to the concept being taught. When no per-challenge override is set, visualizations fall back to module-based defaults (SD1=oscilloscope, SD2=filter, SD3=envelope, SD4=LFO, SD5=effects).

### 8.5 A/B Comparison

Instant toggle between before and after. Reference track comparison overlay. Level-matched comparison to prevent louder-is-better bias. Blind A/B testing mode for ear training. This is essential for developing critical listening skills.

### 8.6 Visualization Modes

Players toggle focus: Spectrum Focus (large spectrum, small waveform), Waveform Focus (large waveform, small spectrum), Comparison Focus (side-by-side before/after), Reference Focus (mix vs reference overlay), and Minimal (maximum workspace with small visualizations).

---

## 9. Evaluation System

### 9.1 Technical Metrics

| Metric | Measurement Method | Used For |
|---|---|---|
| Spectral similarity | Correlation of averaged FFTs | Reference matching, sound recreation |
| Temporal similarity | Envelope correlation | Sound design evaluation |
| Dynamic range | Crest factor, LUFS range | Compression challenges |
| Loudness | Integrated LUFS (ITU-R BS.1770) | Level challenges |
| Frequency balance | Energy per frequency band | EQ challenges |
| Stereo correlation | L/R correlation coefficient | Stereo challenges |
| Clipping | Samples over 0dBFS | Quality check (always active) |

### 9.2 Problem Detection Model

A CNN trained on mel-spectrograms performs multi-label classification of common audio problems. The model is approximately 5MB and runs client-side via TensorFlow.js with inference under 100ms.

| Problem | Detection Signature | Training Examples |
|---|---|---|
| Mud | 200-500Hz energy excess | ~1,000 |
| Boxiness | 300-600Hz vocal excess | ~1,000 |
| Harshness | 2-5kHz energy excess | ~1,000 |
| Sibilance | 6-10kHz vocal transient excess | ~1,000 |
| Thin | Low frequency energy deficit | ~1,000 |
| Dull | High frequency energy deficit | ~1,000 |
| Over-compressed | Low dynamic range, pumping | ~1,000 |
| Clipping | Digital overs detected | ~1,000 |

### 9.3 Quality Assessment Model

A CNN regression model predicting production quality score (0-100). Trained on approximately 5,000 labeled examples (professional mixes rated high, amateur mixes rated low). Approximately 10MB, runs client-side. Used for overall mix evaluation and the Rescue the Mix challenge type.

### 9.4 Scoring System

| Component | Points | Notes |
|---|---|---|
| Problem fixed | 100 | Per problem identified and resolved |
| Target achieved | 100 | Technical target met within tolerance |
| Reference matched | 50-100 | Scaled by spectral/dynamic similarity |
| No new problems introduced | 50 | Bonus for clean work |
| Elegant solution (fewer moves) | 25 bonus | Rewards efficiency |

Star rating: 1 star for passing threshold, 2 stars for 80% score, 3 stars for 95% score.

---

## 10. AI Feedback System

The AI feedback system is the core differentiator. It provides the personalized, contextual guidance that only expensive private mentorship offers. AI explains what it hears in plain language, adapting to the player's skill level.

### 10.1 Real-Time Guidance

Light-touch feedback as the player works. Triggered by significant parameter changes, problems introduced, problems fixed, or target approach. Feedback is short (1-2 sentences), specific to the action taken, directional (moving toward or away from goal), and non-blocking (appears in sidebar). Uses a hybrid of rule-based systems for common situations and LLM for novel situations.

Example: Player boosts 3kHz by 6dB on a vocal. AI responds: "Good instinct adding presence. But you have gone a bit far; the vocal is starting to sound harsh. Try pulling back to +3dB or using a wider Q."

### 10.2 Post-Challenge Analysis

Detailed breakdown after each challenge submission. Includes: result summary (score, stars, pass/fail), what you did (tool settings and changes made), what happened sonically (AI explanation of the audio impact and trade-offs), what could be better (specific suggestions and alternative approaches), and concept connection (the production principle this challenge teaches and links to deeper learning).

The analysis uses Claude API with structured prompts that include before/after audio features, tool settings, challenge goal, detected changes, and player level. The LLM generates natural language feedback appropriate to the player's experience level.

### 10.3 Intent Interpretation

Natural language input for describing sonic goals. Players can say "make it warmer," "the drums need more punch," "it sounds muddy," or "I want it to sound like [reference]." The AI maps natural language to specific sonic characteristics, suggests tools and techniques, and checks the player's work against stated intent. This bridges the gap between what players feel and the technical vocabulary they have not yet learned.

### 10.4 Adaptive Explanations

Explanations match player level automatically. A beginner hears: "This knob controls how fast the compressor reacts. Slower means more punch, faster means smoother." An intermediate player hears: "Your attack time of 5ms is catching the transient. For drums, 20-50ms lets the initial hit through." An advanced player hears: "At 5ms attack, you are getting 3dB of gain reduction on the transient itself. The 30ms release is causing inter-sample pumping on the 16th notes." Player level is determined by completed challenges, tool usage patterns, vocabulary in questions, and response to explanations.

### 10.5 Sound Design Feedback

For sound design challenges, the AI evaluates synthesized sounds against target descriptions using extracted audio features (spectral centroid, attack time, harmonicity, etc.). It provides feedback on which parameters to adjust, what direction to move them, why the change will help achieve the target, and what to listen for. Sound comparison uses spectral correlation (60% weight) and temporal envelope correlation (40% weight) for objective scoring, supplemented by AI assessment for subjective criteria.

---

## 11. User Interface

### 11.1 Visual Design Language

The interface looks like professional audio software, not a cartoon. Dark background with glowing visualizations. Green waveforms, colorful spectrum bars, clean knobs with arc indicators. Monospace text for numerical values, clean sans-serif for labels. The aesthetic says "studio tool" rather than "toy." No custom art assets required; all visuals are programmatic.

### 11.2 Progressive Tool Interfaces

Tool complexity increases as skills develop at both the module level and the individual challenge level.

**Sound Design:** Each synth section (Oscillator, Filter, Envelope, LFO, Effects, Output) accepts either `true` (show all controls) or a per-control object (e.g., `{ waveform: true, octave: true }`) specifying exactly which knobs to display. Module defaults progressively add sections (SD1=Oscillator+Output, SD2 adds Filter, SD3 adds Envelopes, SD4 adds LFO, SD5+ shows all), while individual challenges can override to show a cross-section of controls from any section. For example, sd1-02 "Buzzy Bass" is an SD1 challenge but shows filter cutoff and resonance alongside the oscillator controls.

**Mixing EQ:** Beginner EQ (Fundamentals) shows three fixed bands (Low, Mid, High) with simple gain sliders. Intermediate EQ shows four parametric bands (lowshelf, 2x peak, highshelf) with frequency, gain, and Q controls per band. Advanced challenges use the same parametric EQ. A backward-compatible conversion function translates parametric settings to equivalent 3-band values for evaluation.

### 11.3 Main Views

**Challenge View:** Top: spectrum analyzer with problem region highlighting. Middle-left: waveform with playhead. Middle-right: active tool controls. Bottom: transport (play, A/B, reference) with level meter. Sidebar: AI guidance messages. Submit button for evaluation.

**Synth View:** Top row: oscillator sections (waveform select, tuning). Middle row: filter (type, cutoff, resonance) and filter envelope. Bottom row: amplitude envelope and LFO. Below: spectrum visualization of synthesized sound. Transport with play/hold and A/B target comparison.

**Results View:** Score and star rating. Before/after spectrum comparison. AI analysis (what you did, what happened, what could be better, concept connection). Retry, Next Challenge, and Return to Menu buttons.

**Curriculum View:** Track-based organization (Sound Design, Production, Mixing). Module cards with completion status and star counts. Locked/unlocked visual states. Progress bars per track. Practice Mode for AI-generated challenges.

**Sandbox:** Full mixing environment with all tools unlocked. Synth playground. Import own audio (premium feature). No objectives.

### 11.4 Accessibility

High contrast mode. Colorblind-safe color palettes. Full keyboard navigation for all controls. Screen reader support for text elements. Closed captions describing audio content for hearing-impaired users (focus on visual learning through spectrum/waveform). Adjustable text size.

---

## 12. Technical Architecture

### 12.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Language | TypeScript (strict mode) | Type safety; shared types frontend/backend |
| Frontend | React 18+ | Mature ecosystem; component model |
| State | Zustand | Simple, performant state management |
| Audio | Tone.js + Web Audio API | Full-featured synthesis and processing |
| Visualization | Canvas 2D | Sufficient for spectrums, waveforms, meters |
| ML (client) | TensorFlow.js | Browser-native inference for problem detection |
| Feature extraction | Meyda.js | Audio feature extraction for sound evaluation |
| Build | Vite | Fast development cycle; lazy-loaded views via React.lazy + Suspense |
| Backend | Node.js | Same language as frontend |
| API | tRPC | End-to-end type safety |
| Database | PostgreSQL (Supabase) | Managed; accounts, progress, leaderboards |
| CDN | Cloudflare R2 | Cost-effective audio file delivery |
| LLM | Claude API | High-quality feedback generation |
| Hosting | Vercel (frontend) + Railway (backend) | Simple deployment |

### 12.2 Architecture Overview

**Game Client:** React UI, Tone.js audio engine, Canvas 2D visualizations, TensorFlow.js for local analysis (problem detection, quality assessment), Meyda.js for feature extraction, Zustand state, IndexedDB for local persistence.

**Backend Services:** Feedback Generator (LLM), Challenge Generator (LLM + rules), Curriculum Engine (lightweight ML for player modeling), Content Delivery via CDN (audio stems, references, challenges), PostgreSQL for accounts, progress, and leaderboards.

**Latency Strategy:** Hybrid approach. Instant feedback (rule-based, local) for clipping detection, level imbalance, and basic problem identification. Deep feedback (server-side, 2-5 second latency) for detailed analysis and natural language explanation. Streaming partial results as available. Players get immediate visual feedback with detailed AI analysis arriving moments later.

### 12.3 Performance Requirements

| Metric | Target | Notes |
|---|---|---|
| Audio latency | <10ms | Critical for responsive parameter adjustment |
| Spectrum update | 60fps | Real-time frequency visualization |
| Problem detection | <100ms | Client-side TensorFlow.js inference |
| LLM feedback | <5 seconds | Acceptable for post-change deep analysis |
| Initial load | <5 seconds | Including Tone.js and TF.js model download |
| Audio file streaming | <2 seconds to playback | CDN-delivered stems |

---

## 13. Content Requirements

### 13.1 Audio Stems

| Category | Track Count | Stems Per Track | Notes |
|---|---|---|---|
| Pop/Rock drums | 20 | 8-12 | Multi-mic recordings |
| Electronic drums | 15 | 6-10 | Synthesized and sampled |
| Bass | 30 | 1-3 | DI + amp combinations |
| Guitars | 25 | 1-4 | Clean, driven, acoustic |
| Synths | 30 | 1-3 | Pads, leads, basses |
| Vocals | 25 | 1-2 | Lead and backing |
| Full songs | 20 | 8-24 | Complete multitracks for mixing |
| **Total** | **~165 tracks** | **~400 stems** | |

All stems must be professional quality (24-bit, 48kHz), clean (problems are added programmatically for challenges), and genre-diverse. Sourcing: commissioned work-for-hire from producers ($50-100 per multitrack song) and licensed sample library content. Estimated audio content cost: $2,000-3,000.

### 13.2 Sound Design Content

Sound design challenges require minimal external audio because synthesis generates its own content. Target sounds for "Recreate This Sound" challenges can be synthesized and stored as presets. The synth engine itself provides all necessary content. A library of approximately 200 target sounds across genres covers the curriculum.

### 13.3 Reference Library

100 professional mix references across pop (20), rock (15), hip-hop (15), electronic (15), R&B (10), country (10), jazz (10), and classical (5). Licensed as 30-60 second snippets. Focus on sonic character across multiple eras and production styles. Estimated licensing cost: $2,000-5,000.

### 13.4 Challenge Authoring

320 hand-crafted challenges (110 sound design + 20 production + 142 mixing + 24 sampling + 24 drum sequencing). Each requires title, description, target parameters or audio assignment, goal and evaluation criteria, three progressive hints, and concept tags. Sound design challenges additionally specify per-control visibility and visualization panel overrides. Approximately 50 additional templates for AI challenge generation.

### 13.5 Educational Content

Approximately 50 concept explanations (EQ, compression, synthesis, etc.) in a searchable Concept Library with standalone view (`#/concepts`), deep links, and inline concept link markers (`[[concept-id|display text]]`) in challenge hints. 100 glossary entries for production terminology. Concept modal accessible from anywhere in the app. Adaptive curriculum uses player model to analyze score breakdowns, identify weaknesses, and recommend challenges.

---

## 14. Development Roadmap

**Actual development:** All 320 challenges, five tracks, AI feedback, user accounts, and progressive tool complexity were built in 37 sessions over 8 days (Feb 4-11, 2026). The original 10-month roadmap was dramatically compressed through rapid iteration.

| Phase | Sessions | Deliverable | Details |
|---|---|---|---|
| Synth Engine | 1-2 | Synth + first challenges | Tone.js integration, subtractive synth UI, waveform/spectrum viz, sound analysis (Meyda.js), SD1 (4 challenges) |
| Sound Design Core | 3-4 | 32 sound design challenges | SD2-SD7, AI feedback (tRPC + Claude), filter/envelope/LFO/effects modules |
| Mixing Track | 6-9 | 142 mixing challenges | F1-F8, I1-I7, A1-A5, M1-M4 across four difficulty tiers |
| Production + Sampling + Drums | 10-15 | 68 more challenges | Production (P1-P5), Sampling (SM1-SM6), Drum Sequencing (DS1-DS6), 16 synthesized drum samples |
| Advanced Synthesis | 16-25 | 78 more SD challenges | FM/Additive AI feedback, SD10-SD17, arpeggiator, unison, mod matrix, LFO2, pan |
| Infrastructure | 26-30 | Auth, routing, errors | Supabase auth, cloud sync, error boundaries, hash routing, component decomposition |
| Curriculum + Polish | 31-33 | Concept Library + adaptive | Concept Library, player model, progressive tool complexity, per-control visibility, per-challenge visualizations |
| Track Dynamics + Decomposition | 34-35 | I7 module + view decomposition | I7 Track Dynamics (6 challenges), per-track compression, view decomposition (5 views), Tailwind migration |
| Performance + Docs | 36-37 | Optimization + documentation | Tailwind migration (793→103 inline styles), React.memo (9 components), format function extraction, timer throttling |

### 14.1 AI Development Status

| Phase | Feature | Status | Details |
|---|---|---|---|
| 1 | Rule-based evaluation | Complete | Deterministic scoring for all 5 tracks (spectral, parameter, goal-based) |
| 2 | LLM feedback (Claude API) | Complete | Separate endpoints for subtractive, FM, additive, mixing, production, sampling, drum sequencing |
| 3 | Adaptive curriculum | Complete | Player model with skill scoring, weakness detection, personalized recommendations |
| 4 | Intent understanding | Future | Natural language sonic goals |
| 5 | Challenge generation | Future | AI-generated challenges for unlimited practice |

---

## 15. Business Model

### 15.1 Pricing Strategy

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | Sound design fundamentals (32 challenges), mixing fundamentals (32 challenges), basic tools, 5 AI analyses per day |
| Premium Monthly | $14.99/month | Full curriculum (188 challenges), all tools, unlimited AI feedback, AI-generated challenges, sandbox, import own audio |
| Premium Annual | $99/year | All premium features (37% savings) |
| Lifetime | $249 one-time | All premium features forever |

### 15.2 Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Free users | 50,000 | 150,000 | 300,000 |
| Premium conversion | 5% | 7% | 8% |
| Premium subscribers | 2,500 | 10,500 | 24,000 |
| Annual revenue per subscriber | $80 | $85 | $90 |
| Total revenue | $200,000 | $893,000 | $2,160,000 |

### 15.3 Operating Costs

| Category | Monthly | Annual |
|---|---|---|
| Hosting (Vercel) | $200 | $2,400 |
| Database (Supabase) | $100 | $1,200 |
| CDN / Audio delivery (Cloudflare R2) | $300 | $3,600 |
| LLM API (Claude) | $1,000 | $12,000 |
| Audio licensing (ongoing) | $200 | $2,400 |
| **Total** | **$1,800** | **$21,600** |

LLM costs managed through aggressive response caching (common problems have cached explanations), rate limiting on free tier, and batching analysis calls (one per challenge completion, not per parameter change). At moderate projections, the product is profitable within Year 1.

---

## 16. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| Audio latency issues across browsers | Medium | High | Extensive browser testing; fallback rendering modes; Tone.js handles most edge cases |
| AI explanations feel generic | Medium | Medium | Fine-tune prompts per challenge type; A/B test variations; include specific audio features in prompt |
| Content feels repetitive | Medium | Medium | AI generation for variety; regular content updates; community challenge sharing |
| Sound design too niche as entry point | Low | Medium | Allow mixing-first path; placement test option; clear track descriptions |
| LLM API costs spike at scale | Medium | Medium | Aggressive caching; rate limiting free tier; local rule-based fallback |
| Web Audio limitations on mobile | Medium | Medium | Focus on desktop first; progressive enhancement for mobile; clear platform requirements |
| Audio content piracy | Medium | Low | Streaming-only delivery; watermarking; server-side processing for premium content |
| Scope creep across three tracks | High | Medium | Ship sound design first as standalone; add tracks incrementally; each track is self-contained |

---

## 17. Success Metrics

### 17.1 Engagement

| Metric | Target |
|---|---|
| Day 1 retention | >60% |
| Day 7 retention | >35% |
| Day 30 retention | >20% |
| Average session length | >45 minutes |
| Challenges completed (free users) | >15 |
| Challenges completed (premium users) | >50 |
| Sound design module completion | >40% |

### 17.2 Learning

| Metric | Target |
|---|---|
| Module completion rate | >40% |
| Score improvement over first 20 challenges | >30% |
| Player survey: "I learned something" | >85% agree |
| Concept quiz accuracy | >70% |
| Can identify problem in blind test after 10 hours | >60% |

### 17.3 Business

| Metric | Target |
|---|---|
| Premium conversion | >5% |
| Monthly premium churn | <8% |
| Lifetime value to customer acquisition cost (LTV:CAC) | >3:1 |
| Net Promoter Score | >50 |
| App/site review rating | >4.5 stars |
