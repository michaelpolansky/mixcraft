/**
 * FM Synthesizer View
 * Horizontal signal-flow layout: FM → AMP → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  Knob,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  FMVisualizer,
  EnvelopeVisualizer,
  WaveformSelector,
  XYPad,
} from '../components/index.ts';
import { FM_PRESETS } from '../../data/presets/fm-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';

// Stage colors following signal flow
const COLORS = {
  fm: '#f97316',
  amp: '#22c55e',
  output: '#ef4444',
};

export function FMSynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setHarmonicity,
    setModulationIndex,
    setCarrierType,
    setModulatorType,
    setModulationEnvelopeAmount,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
    setVolume,
    resetToDefaults,
    currentPreset,
    loadPreset,
  } = useFMSynthStore();

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
  const formatMs = (value: number) => value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // XY Pad handlers - maps to Harmonicity (X) and Mod Index (Y)
  const xRange: [number, number] = [FM_PARAM_RANGES.harmonicity.min, FM_PARAM_RANGES.harmonicity.max];
  const yRange: [number, number] = [FM_PARAM_RANGES.modulationIndex.min, FM_PARAM_RANGES.modulationIndex.max];

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
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#f97316' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>FM Synthesizer</p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #f97316, #ea580c)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
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
            <h1 style={{ fontSize: '20px', fontWeight: 300, margin: 0, color: '#f97316' }}>
              MIXCRAFT
            </h1>
            <span style={{ fontSize: '11px', color: '#666' }}>FM Synthesizer</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PresetDropdown
              presets={FM_PRESETS}
              currentPreset={currentPreset}
              onSelect={loadPreset}
              accentColor="#f97316"
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
          {/* FM Stage - wider for the visualizer */}
          <StageCard title="FM SYNTHESIS" color={COLORS.fm} wide>
            <FMVisualizer
              carrierType={params.carrierType}
              modulatorType={params.modulatorType}
              harmonicity={params.harmonicity}
              modulationIndex={params.modulationIndex}
              width={320}
              height={120}
              accentColor={COLORS.fm}
              compact
            />

            {/* Carrier & Modulator Waveforms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '9px', color: COLORS.fm, marginBottom: '4px', fontWeight: 600 }}>CARRIER</div>
                <WaveformSelector value={params.carrierType} onChange={setCarrierType} />
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px', fontWeight: 600 }}>MODULATOR</div>
                <WaveformSelector value={params.modulatorType} onChange={setModulatorType} />
              </div>
            </div>

            {/* FM Parameters */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Knob
                  label="Harm"
                  value={params.harmonicity}
                  min={FM_PARAM_RANGES.harmonicity.min}
                  max={FM_PARAM_RANGES.harmonicity.max}
                  step={FM_PARAM_RANGES.harmonicity.step}
                  onChange={setHarmonicity}
                  formatValue={(v) => v.toFixed(2)}
                  size={40}
                  paramId="fm.harmonicity"
                />
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80px' }}>
                  {HARMONICITY_PRESETS.slice(0, 4).map((value) => (
                    <button
                      key={value}
                      onClick={() => setHarmonicity(value)}
                      style={{
                        padding: '2px 4px',
                        background: Math.abs(params.harmonicity - value) < 0.01 ? COLORS.fm : '#1a1a1a',
                        border: 'none',
                        borderRadius: '2px',
                        color: Math.abs(params.harmonicity - value) < 0.01 ? '#fff' : '#666',
                        cursor: 'pointer',
                        fontSize: '8px',
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <Knob
                label="Index"
                value={params.modulationIndex}
                min={FM_PARAM_RANGES.modulationIndex.min}
                max={FM_PARAM_RANGES.modulationIndex.max}
                step={FM_PARAM_RANGES.modulationIndex.step}
                onChange={setModulationIndex}
                formatValue={(v) => v.toFixed(1)}
                size={40}
                paramId="fm.modulationIndex"
              />
              <Knob
                label="Env"
                value={params.modulationEnvelopeAmount}
                min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
                max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
                step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
                onChange={setModulationEnvelopeAmount}
                formatValue={(v) => v.toFixed(1)}
                size={40}
                paramId="fm.modEnvAmount"
              />
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
          <Sequencer engine={engine} accentColor="#f97316" />
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
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.fm}` : '2px solid transparent',
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
                borderBottom: bottomMode === 'keys' ? `2px solid ${COLORS.fm}` : '2px solid transparent',
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
                xValue={normalizeValue(params.harmonicity, xRange[0], xRange[1])}
                yValue={normalizeValue(params.modulationIndex, yRange[0], yRange[1])}
                xLabel="Harmonicity"
                yLabel="Mod Index"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setHarmonicity(denormalizeValue(v, xRange[0], xRange[1]))}
                onYChange={(v) => setModulationIndex(denormalizeValue(v, yRange[0], yRange[1]))}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.fm}
                formatXValue={(v) => v.toFixed(2)}
                formatYValue={(v) => v.toFixed(1)}
              />
            )}
          </div>
        </div>

        <InfoPanel accentColor="#f97316" />
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
