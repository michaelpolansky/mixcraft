/**
 * Hints reveal panel for challenge views
 */

interface HintsPanelProps {
  hints: string[];
  hintsRevealed: number;
  onRevealHint: () => void;
  accentColor?: string;
}

export function HintsPanel({
  hints,
  hintsRevealed,
  onRevealHint,
  accentColor = '#333',
}: HintsPanelProps) {
  return (
    <div style={{ minHeight: '60px' }}>
      {hints.slice(0, hintsRevealed).map((hint, i) => (
        <div
          key={i}
          style={{
            color: '#888',
            fontSize: '12px',
            marginBottom: '8px',
            paddingLeft: '12px',
            borderLeft: `2px solid ${accentColor}44`,
          }}
        >
          {hint}
        </div>
      ))}

      {hintsRevealed < hints.length && (
        <button
          onClick={onRevealHint}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#666',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '6px 12px',
          }}
        >
          Reveal Hint ({hintsRevealed + 1}/{hints.length})
        </button>
      )}
    </div>
  );
}
