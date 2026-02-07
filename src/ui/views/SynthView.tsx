/**
 * Main Synthesizer View
 * Horizontal signal-flow layout: OSC → FILTER → AMP → MOD → FX → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import {
  Knob,
  Slider,
  WaveformSelector,
  FilterTypeSelector,
  LFOWaveformSelector,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  OscillatorVisualizer,
  FilterVisualizer,
  EnvelopeVisualizer,
  LFOVisualizer,
  XYPad,
} from '../components/index.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';

// Stage colors following signal flow
const COLORS = {
  oscillator: '#3b82f6',
  filter: '#06b6d4',
  amp: '#22c55e',
  mod: '#eab308',
  effects: '#8b5cf6',
  output: '#f97316',
};

export function SynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setOscillatorType,
    setOctave,
    setDetune,
    setFilterType,
    setFilterCutoff,
    setFilterResonance,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
    setFilterEnvelopeAttack,
    setFilterEnvelopeDecay,
    setFilterEnvelopeSustain,
    setFilterEnvelopeRelease,
    setFilterEnvelopeAmount,
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setDistortionAmount,
    setDistortionMix,
    setDelayTime,
    setDelayFeedback,
    setDelayMix,
    setReverbDecay,
    setReverbMix,
    setChorusRate,
    setChorusDepth,
    setChorusMix,
    setVolume,
    resetToDefaults,
    currentPreset,
    loadPreset,
  } = useSynthStore();

  // Bottom strip state: 'keys' or 'xy'
  const [bottomMode, setBottomMode] = useState<'keys' | 'xy'>('keys');
  const [bottomExpanded, setBottomExpanded] = useState(false);

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Format helpers
  const formatHz = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`;
  const formatMs = (value: number) => value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // XY Pad handlers - maps to Filter Cutoff (X) and Resonance (Y)
  const xRange: [number, number] = [PARAM_RANGES.cutoff.min, PARAM_RANGES.cutoff.max];
  const yRange: [number, number] = [PARAM_RANGES.resonance.min, PARAM_RANGES.resonance.max];

  const normalizeValue = (value: number, min: number, max: number) => (value - min) / (max - min);
  const denormalizeValue = (normalized: number, min: number, max: number) => min + normalized * (max - min);

  // Not initialized - show start button
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#4ade80' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Subtractive Synthesizer</p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
          }}
        >
          Start Audio Engine
        </button>
        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Click to enable audio (browser requirement)
        </p>
      </div>
    );
  }

  return (
    <InfoPanelProvider>
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          paddingLeft: '120px', // Room for fixed menu button
          borderBottom: '1px solid #1a1a1a',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 300, margin: 0, color: '#4ade80' }}>
              MIXCRAFT
            </h1>
            <span style={{ fontSize: '11px', color: '#666' }}>Subtractive Synthesizer</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PresetDropdown
              presets={SUBTRACTIVE_PRESETS}
              currentPreset={currentPreset}
              onSelect={loadPreset}
              accentColor="#4ade80"
            />
            <button
              onClick={resetToDefaults}
              style={{
                padding: '6px 12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Spectrum Analyzer */}
        <div style={{ padding: '12px 24px', background: '#050508' }}>
          <SpectrumAnalyzer width={window.innerWidth - 48} height={80} barCount={100} />
        </div>

        {/* Signal Flow - Horizontal flex wrap */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'flex-start',
          overflow: 'auto',
        }}>
          {/* OSC Stage */}
          <StageCard title="OSC" color={COLORS.oscillator}>
            <OscillatorVisualizer
              waveform={params.oscillator.type}
              octave={params.oscillator.octave}
              detune={params.oscillator.detune}
              width={200}
              height={120}
              accentColor={COLORS.oscillator}
              compact
            />
            <div style={{ marginTop: '12px' }}>
              <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              <Knob label="Oct" value={params.oscillator.octave} min={-2} max={2} step={1} onChange={setOctave} formatValue={(v) => v >= 0 ? `+${v}` : `${v}`} size={40} paramId="oscillator.octave" />
              <Knob label="Detune" value={params.oscillator.detune} min={-100} max={100} step={1} onChange={setDetune} formatValue={(v) => `${v}`} size={40} paramId="oscillator.detune" />
            </div>
          </StageCard>

          {/* FILTER Stage */}
          <StageCard title="FILTER" color={COLORS.filter}>
            <FilterVisualizer
              filterType={params.filter.type}
              cutoff={params.filter.cutoff}
              resonance={params.filter.resonance}
              onCutoffChange={setFilterCutoff}
              onResonanceChange={setFilterResonance}
              width={200}
              height={120}
              accentColor={COLORS.filter}
              compact
            />
            <div style={{ marginTop: '12px' }}>
              <FilterTypeSelector value={params.filter.type} onChange={setFilterType} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              <Knob label="Cutoff" value={params.filter.cutoff} min={PARAM_RANGES.cutoff.min} max={PARAM_RANGES.cutoff.max} step={1} onChange={setFilterCutoff} formatValue={formatHz} logarithmic size={40} paramId="filter.cutoff" />
              <Knob label="Res" value={params.filter.resonance} min={0} max={20} step={0.1} onChange={setFilterResonance} formatValue={(v) => v.toFixed(1)} size={40} paramId="filter.resonance" />
            </div>
          </StageCard>

          {/* AMP Stage */}
          <StageCard title="AMP" color={COLORS.amp}>
            <EnvelopeVisualizer
              attack={params.amplitudeEnvelope.attack}
              decay={params.amplitudeEnvelope.decay}
              sustain={params.amplitudeEnvelope.sustain}
              release={params.amplitudeEnvelope.release}
              onAttackChange={setAmplitudeAttack}
              onDecayChange={setAmplitudeDecay}
              onSustainChange={setAmplitudeSustain}
              onReleaseChange={setAmplitudeRelease}
              width={200}
              height={120}
              accentColor={COLORS.amp}
              compact
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <MiniSlider label="A" value={params.amplitudeEnvelope.attack} min={0.001} max={2} onChange={setAmplitudeAttack} />
              <MiniSlider label="D" value={params.amplitudeEnvelope.decay} min={0.001} max={2} onChange={setAmplitudeDecay} />
              <MiniSlider label="S" value={params.amplitudeEnvelope.sustain} min={0} max={1} onChange={setAmplitudeSustain} />
              <MiniSlider label="R" value={params.amplitudeEnvelope.release} min={0.001} max={4} onChange={setAmplitudeRelease} />
            </div>
          </StageCard>

          {/* MOD Stage (Filter Env + LFO) */}
          <StageCard title="MOD" color={COLORS.mod}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>FILTER ENV</div>
                <EnvelopeVisualizer
                  attack={params.filterEnvelope.attack}
                  decay={params.filterEnvelope.decay}
                  sustain={params.filterEnvelope.sustain}
                  release={params.filterEnvelope.release}
                  onAttackChange={setFilterEnvelopeAttack}
                  onDecayChange={setFilterEnvelopeDecay}
                  onSustainChange={setFilterEnvelopeSustain}
                  onReleaseChange={setFilterEnvelopeRelease}
                  width={95}
                  height={60}
                  accentColor={COLORS.mod}
                  compact
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>LFO</div>
                <LFOVisualizer
                  waveform={params.lfo.waveform}
                  rate={params.lfo.rate}
                  depth={params.lfo.depth}
                  width={95}
                  height={60}
                  accentColor={COLORS.mod}
                  compact
                />
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <LFOWaveformSelector value={params.lfo.waveform} onChange={setLFOWaveform} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
              <Knob label="Amt" value={params.filterEnvelope.amount} min={-4} max={4} step={0.1} onChange={setFilterEnvelopeAmount} formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} size={36} paramId="filterEnv.amount" />
              <Knob label="Rate" value={params.lfo.rate} min={0.1} max={20} step={0.1} onChange={setLFORate} formatValue={(v) => `${v.toFixed(1)}`} size={36} paramId="lfo.rate" />
              <Knob label="Depth" value={params.lfo.depth} min={0} max={1} step={0.01} onChange={setLFODepth} formatValue={formatPercent} size={36} paramId="lfo.depth" />
            </div>
          </StageCard>

          {/* FX Stage */}
          <StageCard title="FX" color={COLORS.effects} wide>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <EffectMini
                name="DIST"
                color="#ef4444"
                knobs={[
                  { label: 'Amt', value: params.effects.distortion.amount, onChange: setDistortionAmount, max: 1 },
                  { label: 'Mix', value: params.effects.distortion.mix, onChange: setDistortionMix, max: 1 },
                ]}
              />
              <EffectMini
                name="DELAY"
                color="#3b82f6"
                knobs={[
                  { label: 'Time', value: params.effects.delay.time, onChange: setDelayTime, max: 1 },
                  { label: 'FB', value: params.effects.delay.feedback, onChange: setDelayFeedback, max: 0.9 },
                  { label: 'Mix', value: params.effects.delay.mix, onChange: setDelayMix, max: 1 },
                ]}
              />
              <EffectMini
                name="REVERB"
                color="#8b5cf6"
                knobs={[
                  { label: 'Decay', value: params.effects.reverb.decay, onChange: setReverbDecay, max: 10 },
                  { label: 'Mix', value: params.effects.reverb.mix, onChange: setReverbMix, max: 1 },
                ]}
              />
              <EffectMini
                name="CHORUS"
                color="#06b6d4"
                knobs={[
                  { label: 'Rate', value: params.effects.chorus.rate, onChange: setChorusRate, max: 10 },
                  { label: 'Depth', value: params.effects.chorus.depth, onChange: setChorusDepth, max: 1 },
                  { label: 'Mix', value: params.effects.chorus.mix, onChange: setChorusMix, max: 1 },
                ]}
              />
            </div>
          </StageCard>

          {/* OUTPUT Stage */}
          <StageCard title="OUTPUT" color={COLORS.output}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Knob
                label="Volume"
                value={params.volume}
                min={-40}
                max={0}
                step={0.5}
                onChange={setVolume}
                formatValue={formatDb}
                size={56}
                paramId="volume"
              />
              <RecordingControl
                sourceNode={engine?.getOutputNode() ?? null}
                accentColor={COLORS.output}
                compact
              />
            </div>
          </StageCard>
        </div>

        {/* Sequencer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #1a1a1a' }}>
          <Sequencer engine={engine} accentColor="#4ade80" />
        </div>

        {/* Bottom Control Strip */}
        <div style={{
          borderTop: '1px solid #1a1a1a',
          background: '#0d0d12',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
            <button
              onClick={() => setBottomMode('xy')}
              style={{
                padding: '8px 16px',
                background: bottomMode === 'xy' ? '#1a1a1a' : 'transparent',
                border: 'none',
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.filter}` : '2px solid transparent',
                color: bottomMode === 'xy' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              XY
            </button>
            <button
              onClick={() => setBottomMode('keys')}
              style={{
                padding: '8px 16px',
                background: bottomMode === 'keys' ? '#1a1a1a' : 'transparent',
                border: 'none',
                borderBottom: bottomMode === 'keys' ? `2px solid #4ade80` : '2px solid transparent',
                color: bottomMode === 'keys' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              KEYS
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setBottomExpanded(!bottomExpanded)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {bottomExpanded ? '▼' : '▲'}
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              height: bottomExpanded ? '140px' : '50px',
              transition: 'height 0.2s ease',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 24px',
            }}
            onClick={() => !bottomExpanded && setBottomExpanded(true)}
          >
            {bottomMode === 'keys' ? (
              <PianoKeyboard
                onNoteOn={playNote}
                onNoteOff={stopNote}
                octave={4}
                octaves={bottomExpanded ? 3 : 1}
              />
            ) : (
              <XYPad
                xValue={normalizeValue(params.filter.cutoff, xRange[0], xRange[1])}
                yValue={normalizeValue(params.filter.resonance, yRange[0], yRange[1])}
                xLabel="Cutoff"
                yLabel="Resonance"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setFilterCutoff(denormalizeValue(v, xRange[0], xRange[1]))}
                onYChange={(v) => setFilterResonance(denormalizeValue(v, yRange[0], yRange[1]))}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.filter}
                formatXValue={formatHz}
                formatYValue={(v) => v.toFixed(1)}
              />
            )}
          </div>
        </div>

        <InfoPanel />
      </div>
    </InfoPanelProvider>
  );
}

// Stage card component
function StageCard({
  title,
  color,
  wide = false,
  children
}: {
  title: string;
  color: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#111',
      border: `1px solid ${color}40`,
      borderRadius: '8px',
      padding: '12px',
      minWidth: wide ? '280px' : '180px',
      flex: wide ? '2 1 280px' : '1 1 180px',
      maxWidth: wide ? '400px' : '240px',
      alignSelf: 'flex-start',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: color,
        letterSpacing: '0.5px',
        marginBottom: '12px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// Mini slider for ADSR
function MiniSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '10px', color: '#666', width: '12px' }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: '4px',
          background: '#222',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          onChange(min + x * (max - min));
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${percent}%`,
          background: COLORS.amp,
          borderRadius: '2px',
        }} />
      </div>
    </div>
  );
}

// Mini effect control
function EffectMini({
  name,
  color,
  knobs,
}: {
  name: string;
  color: string;
  knobs: Array<{ label: string; value: number; onChange: (v: number) => void; max: number }>;
}) {
  return (
    <div>
      <div style={{ fontSize: '9px', color, marginBottom: '6px', fontWeight: 600 }}>{name}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {knobs.map((k) => (
          <Knob
            key={k.label}
            label={k.label}
            value={k.value}
            min={0}
            max={k.max}
            step={0.01}
            onChange={k.onChange}
            formatValue={(v) => `${Math.round((v / k.max) * 100)}%`}
            size={32}
            paramId={`effect.${name.toLowerCase()}.${k.label.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
