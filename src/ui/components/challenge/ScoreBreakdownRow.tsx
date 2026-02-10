/**
 * Single score breakdown row: label left, colored percentage right
 */

interface ScoreBreakdownRowProps {
  label: string;
  score: number;
}

export function ScoreBreakdownRow({ label, score }: ScoreBreakdownRowProps) {
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
      }}
    >
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <span
        style={{
          color,
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {Math.round(score)}%
      </span>
    </div>
  );
}
