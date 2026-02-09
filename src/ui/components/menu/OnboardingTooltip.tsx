interface OnboardingTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

export function OnboardingTooltip({ visible, onDismiss }: OnboardingTooltipProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1e3a2f, #14532d)',
        border: '1px solid #22c55e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
      }}
    >
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#4ade80',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🎹</span>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#4ade80' }}>
            Welcome to MIXCRAFT!
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#a7f3d0', lineHeight: 1.5 }}>
            Learn sound design by ear. Each challenge plays a target sound - your goal is to recreate it using the synthesizer controls.
          </p>
          <div style={{ fontSize: '13px', color: '#86efac' }}>
            <strong>How to play:</strong> Listen to the target → Adjust knobs → Compare → Match the sound!
          </div>
        </div>
      </div>
    </div>
  );
}
