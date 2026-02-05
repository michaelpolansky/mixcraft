/**
 * 3-Band EQ Control
 * Vertical sliders for Low, Mid, High bands
 */

import type { EQParams } from '../../core/mixing-effects.ts';
import { EQ_RANGES } from '../../core/mixing-effects.ts';

interface EQControlProps {
  params: EQParams;
  onLowChange: (value: number) => void;
  onMidChange: (value: number) => void;
  onHighChange: (value: number) => void;
}

interface BandSliderProps {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

function BandSlider({ label, value, color, onChange }: BandSliderProps) {
  const { min, max } = EQ_RANGES.low; // Same range for all bands

  // Calculate fill height (0 at center, fills up or down)
  const centerPercent = 50;
  const valuePercent = ((value - min) / (max - min)) * 100;
  const fillHeight = Math.abs(valuePercent - centerPercent);
  const fillTop = value >= 0 ? centerPercent - fillHeight : centerPercent;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Value display */}
      <div
        style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: value === 0 ? '#666' : color,
          fontWeight: value === 0 ? 400 : 600,
        }}
      >
        {value > 0 ? '+' : ''}{value.toFixed(1)} dB
      </div>

      {/* Slider track */}
      <div
        style={{
          position: 'relative',
          width: '40px',
          height: '120px',
          background: '#1a1a1a',
          borderRadius: '4px',
          border: '1px solid #333',
          cursor: 'pointer',
        }}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const updateValue = (clientY: number) => {
            const y = clientY - rect.top;
            const percent = 1 - y / rect.height;
            const newValue = min + percent * (max - min);
            onChange(Math.round(newValue * 10) / 10);
          };

          updateValue(e.clientY);

          const handleMove = (moveEvent: MouseEvent) => {
            updateValue(moveEvent.clientY);
          };

          const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
          };

          window.addEventListener('mousemove', handleMove);
          window.addEventListener('mouseup', handleUp);
        }}
      >
        {/* Center line (0 dB) */}
        <div
          style={{
            position: 'absolute',
            left: '4px',
            right: '4px',
            top: '50%',
            height: '1px',
            background: '#444',
          }}
        />

        {/* Fill bar */}
        <div
          style={{
            position: 'absolute',
            left: '8px',
            right: '8px',
            top: `${fillTop}%`,
            height: `${fillHeight}%`,
            background: color,
            borderRadius: '2px',
            opacity: 0.6,
            transition: 'all 0.05s ease',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: '4px',
            right: '4px',
            top: `${100 - valuePercent}%`,
            height: '4px',
            background: color,
            borderRadius: '2px',
            transform: 'translateY(-50%)',
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#888',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function EQControl({
  params,
  onLowChange,
  onMidChange,
  onHighChange,
}: EQControlProps) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        3-Band EQ
      </div>

      {/* Sliders */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        <BandSlider
          label="Low"
          value={params.low}
          color="#f97316"
          onChange={onLowChange}
        />
        <BandSlider
          label="Mid"
          value={params.mid}
          color="#22c55e"
          onChange={onMidChange}
        />
        <BandSlider
          label="High"
          value={params.high}
          color="#3b82f6"
          onChange={onHighChange}
        />
      </div>

      {/* Frequency labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '8px',
        }}
      >
        <div style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#555' }}>
          &lt;400Hz
        </div>
        <div style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#555' }}>
          ~1kHz
        </div>
        <div style={{ width: '40px', textAlign: 'center', fontSize: '10px', color: '#555' }}>
          &gt;2.5kHz
        </div>
      </div>
    </div>
  );
}
