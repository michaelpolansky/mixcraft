/**
 * Visual score indicator bar
 */

interface ScoreBarProps {
  score: number;
  label: string;
  feedback?: string;
}

export function ScoreBar({ score, label, feedback }: ScoreBarProps) {
  // Color based on score
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
          {label}
        </span>
        <span style={{ fontSize: '12px', color, fontFamily: 'monospace' }}>
          {score}%
        </span>
      </div>

      {/* Bar background */}
      <div
        style={{
          height: '8px',
          background: '#1a1a1a',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Bar fill */}
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: color,
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>

      {/* Feedback text */}
      {feedback && (
        <div
          style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '4px',
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
