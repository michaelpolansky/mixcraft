/**
 * FM Synthesis control panel
 * Provides controls for FM synthesis parameters including
 * oscillators, modulation, envelope, and output
 */

import type { FMSynthParams, OscillatorType } from '../../core/types.ts';
import { PARAM_RANGES, FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';
import { Knob, WaveformSelector } from './index.ts';
import { CarrierModulatorViz } from './CarrierModulatorViz.tsx';

interface FMSynthPanelProps {
  params: FMSynthParams;
  onHarmonicityChange: (value: number) => void;
  onHarmonicityPreset: (preset: number) => void;
  onModulationIndexChange: (value: number) => void;
  onCarrierTypeChange: (type: OscillatorType) => void;
  onModulatorTypeChange: (type: OscillatorType) => void;
  onModEnvAmountChange: (value: number) => void;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

/**
 * Section container with title
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FMSynthPanel({
  params,
  onHarmonicityChange,
  onHarmonicityPreset,
  onModulationIndexChange,
  onCarrierTypeChange,
  onModulatorTypeChange,
  onModEnvAmountChange,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  onVolumeChange,
}: FMSynthPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        background: '#0d0d0d',
        borderRadius: '16px',
      }}
    >
      {/* Section 1: Oscillators */}
      <Section title="Oscillators">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Waveform visualization */}
          <CarrierModulatorViz
            carrierType={params.carrierType}
            modulatorType={params.modulatorType}
            harmonicity={params.harmonicity}
            modulationIndex={params.modulationIndex}
          />

          {/* Waveform selectors */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: '#00ff88',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Carrier
              </span>
              <WaveformSelector
                value={params.carrierType}
                onChange={onCarrierTypeChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: '#ff8800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Modulator
              </span>
              <WaveformSelector
                value={params.modulatorType}
                onChange={onModulatorTypeChange}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Section 2: Modulation */}
      <Section title="Modulation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Harmonicity with preset buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Knob
                value={params.harmonicity}
                min={FM_PARAM_RANGES.harmonicity.min}
                max={FM_PARAM_RANGES.harmonicity.max}
                step={FM_PARAM_RANGES.harmonicity.step}
                label="Harmonicity"
                onChange={onHarmonicityChange}
                formatValue={(v) => `${v.toFixed(1)}x`}
              />

              {/* Preset buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    color: '#555',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Presets
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {HARMONICITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onHarmonicityPreset(preset)}
                      style={{
                        width: '28px',
                        height: '28px',
                        background: Math.abs(params.harmonicity - preset) < 0.05
                          ? '#2a3a2a'
                          : '#1a1a1a',
                        border: Math.abs(params.harmonicity - preset) < 0.05
                          ? '2px solid #4ade80'
                          : '1px solid #333',
                        borderRadius: '4px',
                        color: Math.abs(params.harmonicity - preset) < 0.05
                          ? '#4ade80'
                          : '#888',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mod Index and Mod Env Amount */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <Knob
              value={params.modulationIndex}
              min={FM_PARAM_RANGES.modulationIndex.min}
              max={FM_PARAM_RANGES.modulationIndex.max}
              step={FM_PARAM_RANGES.modulationIndex.step}
              label="Mod Index"
              onChange={onModulationIndexChange}
              formatValue={(v) => v.toFixed(1)}
            />

            <Knob
              value={params.modulationEnvelopeAmount}
              min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
              max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
              step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
              label="Mod Env"
              onChange={onModEnvAmountChange}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        </div>
      </Section>

      {/* Section 3: Envelope */}
      <Section title="Envelope">
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Knob
            value={params.amplitudeEnvelope.attack}
            min={PARAM_RANGES.attack.min}
            max={PARAM_RANGES.attack.max}
            step={PARAM_RANGES.attack.step}
            label="Attack"
            onChange={onAttackChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
          />

          <Knob
            value={params.amplitudeEnvelope.decay}
            min={PARAM_RANGES.decay.min}
            max={PARAM_RANGES.decay.max}
            step={PARAM_RANGES.decay.step}
            label="Decay"
            onChange={onDecayChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
          />

          <Knob
            value={params.amplitudeEnvelope.sustain}
            min={PARAM_RANGES.sustain.min}
            max={PARAM_RANGES.sustain.max}
            step={PARAM_RANGES.sustain.step}
            label="Sustain"
            onChange={onSustainChange}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <Knob
            value={params.amplitudeEnvelope.release}
            min={PARAM_RANGES.release.min}
            max={PARAM_RANGES.release.max}
            step={PARAM_RANGES.release.step}
            label="Release"
            onChange={onReleaseChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
          />
        </div>
      </Section>

      {/* Section 4: Output */}
      <Section title="Output">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Knob
            value={params.volume}
            min={PARAM_RANGES.volume.min}
            max={PARAM_RANGES.volume.max}
            step={PARAM_RANGES.volume.step}
            label="Volume"
            onChange={onVolumeChange}
            formatValue={(v) => `${v.toFixed(1)} dB`}
          />
        </div>
      </Section>
    </div>
  );
}
