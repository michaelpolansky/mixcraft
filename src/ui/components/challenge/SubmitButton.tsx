/**
 * Full-width gradient submit button with loading state
 */

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isScoring?: boolean;
  label?: string;
  scoringLabel?: string;
  accentColor?: string;
  accentColorDark?: string;
}

export function SubmitButton({
  onClick,
  disabled = false,
  isScoring = false,
  label = 'Submit',
  scoringLabel = 'Scoring...',
  accentColor = '#22c55e',
  accentColorDark = '#16a34a',
}: SubmitButtonProps) {
  const isDisabled = disabled || isScoring;

  return (
    <div style={{ marginTop: 'auto' }}>
      <button
        onClick={onClick}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '16px 32px',
          background: isDisabled
            ? '#333'
            : `linear-gradient(145deg, ${accentColor}, ${accentColorDark})`,
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          cursor: isDisabled ? 'wait' : 'pointer',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        {isScoring ? scoringLabel : label}
      </button>
    </div>
  );
}
