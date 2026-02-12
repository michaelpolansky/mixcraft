/**
 * FM Synthesis control panel
 * Provides controls for FM synthesis parameters including
 * oscillators, modulation, envelope, and output
 */

import type { FMSynthParams, OscillatorType } from '../../core/types.ts';
import { PARAM_RANGES, FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';
import { Knob, WaveformSelector, ModuleCard, MODULE_COLORS, WaveformIcon } from './index.ts';
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
    <div className="flex flex-col gap-4 p-4 bg-[#0d0d0d] rounded-2xl">
      {/* Section 1: Oscillators */}
      <ModuleCard
        title="Oscillators"
        color={MODULE_COLORS.oscillator}
        icon={<WaveformIcon type="sine" size={20} color={MODULE_COLORS.oscillator} />}
      >
        <div className="flex flex-col gap-4">
          {/* Waveform visualization */}
          <CarrierModulatorViz
            carrierType={params.carrierType}
            modulatorType={params.modulatorType}
            harmonicity={params.harmonicity}
            modulationIndex={params.modulationIndex}
          />

          {/* Waveform selectors */}
          <div className="flex justify-around gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-[#00ff88] uppercase tracking-wider">
                Carrier
              </span>
              <WaveformSelector
                value={params.carrierType}
                onChange={onCarrierTypeChange}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-[#ff8800] uppercase tracking-wider">
                Modulator
              </span>
              <WaveformSelector
                value={params.modulatorType}
                onChange={onModulatorTypeChange}
              />
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Section 2: Modulation */}
      <ModuleCard
        title="Modulation"
        color={MODULE_COLORS.modulation}
        icon={<WaveformIcon type="sine" size={20} color={MODULE_COLORS.modulation} />}
      >
        <div className="flex flex-col gap-4">
          {/* Harmonicity with preset buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Knob
                value={params.harmonicity}
                min={FM_PARAM_RANGES.harmonicity.min}
                max={FM_PARAM_RANGES.harmonicity.max}
                step={FM_PARAM_RANGES.harmonicity.step}
                label="Harmonicity"
                onChange={onHarmonicityChange}
                formatValue={(v) => `${v.toFixed(1)}x`}
                paramId="fm.harmonicity"
              />

              {/* Preset buttons */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#555] uppercase tracking-wider">
                  Presets
                </span>
                <div className="flex gap-1">
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
          <div className="flex gap-6 justify-center">
            <Knob
              value={params.modulationIndex}
              min={FM_PARAM_RANGES.modulationIndex.min}
              max={FM_PARAM_RANGES.modulationIndex.max}
              step={FM_PARAM_RANGES.modulationIndex.step}
              label="Mod Index"
              onChange={onModulationIndexChange}
              formatValue={(v) => v.toFixed(1)}
              paramId="fm.modulationIndex"
            />

            <Knob
              value={params.modulationEnvelopeAmount}
              min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
              max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
              step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
              label="Mod Env"
              onChange={onModEnvAmountChange}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              paramId="fm.modulationEnvelopeAmount"
            />
          </div>
        </div>
      </ModuleCard>

      {/* Section 3: Envelope */}
      <ModuleCard
        title="Envelope"
        color={MODULE_COLORS.ampEnvelope}
        icon={<WaveformIcon type="envelope" size={20} color={MODULE_COLORS.ampEnvelope} animated={false} />}
      >
        <div className="flex gap-4 justify-center">
          <Knob
            value={params.amplitudeEnvelope.attack}
            min={PARAM_RANGES.attack.min}
            max={PARAM_RANGES.attack.max}
            step={PARAM_RANGES.attack.step}
            label="Attack"
            onChange={onAttackChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.attack"
          />

          <Knob
            value={params.amplitudeEnvelope.decay}
            min={PARAM_RANGES.decay.min}
            max={PARAM_RANGES.decay.max}
            step={PARAM_RANGES.decay.step}
            label="Decay"
            onChange={onDecayChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.decay"
          />

          <Knob
            value={params.amplitudeEnvelope.sustain}
            min={PARAM_RANGES.sustain.min}
            max={PARAM_RANGES.sustain.max}
            step={PARAM_RANGES.sustain.step}
            label="Sustain"
            onChange={onSustainChange}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            paramId="amplitude.sustain"
          />

          <Knob
            value={params.amplitudeEnvelope.release}
            min={PARAM_RANGES.release.min}
            max={PARAM_RANGES.release.max}
            step={PARAM_RANGES.release.step}
            label="Release"
            onChange={onReleaseChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.release"
          />
        </div>
      </ModuleCard>

      {/* Section 4: Output */}
      <ModuleCard
        title="Output"
        color={MODULE_COLORS.output}
        icon={<WaveformIcon type="speaker" size={20} color={MODULE_COLORS.output} animated={false} />}
      >
        <div className="flex justify-center">
          <Knob
            value={params.volume}
            min={PARAM_RANGES.volume.min}
            max={PARAM_RANGES.volume.max}
            step={PARAM_RANGES.volume.step}
            label="Volume"
            onChange={onVolumeChange}
            formatValue={(v) => `${v.toFixed(1)} dB`}
            paramId="volume"
          />
        </div>
      </ModuleCard>
    </div>
  );
}
