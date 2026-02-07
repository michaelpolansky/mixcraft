/**
 * Additive Synthesizer View
 * Horizontal signal-flow layout: HARMONICS → AMP → FX → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
import {
  Knob,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  HarmonicBarsVisualizer,
  EnvelopeVisualizer,
  XYPad,
} from '../components/index.ts';
import { ADDITIVE_PRESETS } from '../../data/presets/additive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';

// Stage colors following signal flow
const COLORS = {
  harmonics: '#06b6d4',
  amp: '#22c55e',
  effects: '#8b5cf6',
  output: '#f97316',
};

export function AdditiveSynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setHarmonic,
    applyPreset,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
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
  } = useAdditiveSynthStore();

  // Bottom strip state
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

  // Get analyser for spectrum visualization
  const getAnalyser = useCallback(() => {
    return engine?.getAnalyser() ?? null;
  }, [engine]);

  // Format helpers
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // Harmonic presets
  const HARMONIC_PRESETS = [
    { label: 'Saw', key: 'saw' as const },
    { label: 'Square', key: 'square' as const },
    { label: 'Triangle', key: 'triangle' as const },
    { label: 'Organ', key: 'organ' as const },
  ];

  // XY Pad - controls fundamental (H1) and brightness (sum of high harmonics)
  // X = fundamental volume, Y = high harmonic mix
  const xRange: [number, number] = [0, 1];
  const yRange: [number, number] = [0, 1];

  const normalizeValue = (value: number, min: number, max: number) => (value - min) / (max - min);
  const denormalizeValue = (normalized: number, min: number, max: number) => min + normalized * (max - min);

  // Calculate current XY values from harmonics
  const fundamentalLevel = params.harmonics[0] ?? 1;
  const highHarmonicsMix = params.harmonics.slice(4).reduce((sum, h) => sum + h, 0) / 4; // avg of H5-H8

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
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#06b6d4' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Additive Synthesizer</p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #06b6d4, #0891b2)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
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
            <h1 style={{ fontSize: '20px', fontWeight: 300, margin: 0, color: '#06b6d4' }}>
              MIXCRAFT
            </h1>
            <span style={{ fontSize: '11px', color: '#666' }}>Additive Synthesizer</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PresetDropdown
              presets={ADDITIVE_PRESETS}
              currentPreset={currentPreset}
              onSelect={loadPreset}
              accentColor="#06b6d4"
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
          <SpectrumAnalyzer getAnalyser={getAnalyser} width={window.innerWidth - 48} height={80} barCount={100} />
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
          {/* HARMONICS Stage - extra wide for the bars */}
          <StageCard title="HARMONICS" color={COLORS.harmonics} extraWide>
            <HarmonicBarsVisualizer
              harmonics={params.harmonics}
              onHarmonicChange={setHarmonic}
              width={400}
              height={140}
              accentColor={COLORS.harmonics}
            />
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>PRESETS</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {HARMONIC_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    style={{
                      padding: '4px 8px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = COLORS.harmonics;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.color = '#888';
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
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
              <MiniSlider label="A" value={params.amplitudeEnvelope.attack} min={0.001} max={2} onChange={setAmplitudeAttack} color={COLORS.amp} />
              <MiniSlider label="D" value={params.amplitudeEnvelope.decay} min={0.001} max={2} onChange={setAmplitudeDecay} color={COLORS.amp} />
              <MiniSlider label="S" value={params.amplitudeEnvelope.sustain} min={0} max={1} onChange={setAmplitudeSustain} color={COLORS.amp} />
              <MiniSlider label="R" value={params.amplitudeEnvelope.release} min={0.001} max={4} onChange={setAmplitudeRelease} color={COLORS.amp} />
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
          <Sequencer engine={engine} accentColor="#06b6d4" />
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
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.harmonics}` : '2px solid transparent',
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
                borderBottom: bottomMode === 'keys' ? `2px solid ${COLORS.harmonics}` : '2px solid transparent',
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
                octave={3}
                octaves={bottomExpanded ? 3 : 1}
              />
            ) : (
              <XYPad
                xValue={fundamentalLevel}
                yValue={highHarmonicsMix}
                xLabel="Fundamental"
                yLabel="Brightness"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setHarmonic(0, v)}
                onYChange={(v) => {
                  // Adjust high harmonics (H5-H8) proportionally
                  for (let i = 4; i < 8; i++) {
                    setHarmonic(i, v);
                  }
                }}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.harmonics}
                formatXValue={formatPercent}
                formatYValue={formatPercent}
              />
            )}
          </div>
        </div>

        <InfoPanel accentColor="#06b6d4" />
      </div>
    </InfoPanelProvider>
  );
}

// Stage card component
function StageCard({
  title,
  color,
  wide = false,
  extraWide = false,
  children
}: {
  title: string;
  color: string;
  wide?: boolean;
  extraWide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#111',
      border: `1px solid ${color}40`,
      borderRadius: '8px',
      padding: '12px',
      minWidth: extraWide ? '400px' : wide ? '280px' : '180px',
      flex: extraWide ? '3 1 400px' : wide ? '2 1 280px' : '1 1 180px',
      maxWidth: extraWide ? '500px' : wide ? '400px' : '240px',
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
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
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
          background: color,
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
