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
    <div
      className="min-h-[60px]"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {hints.slice(0, hintsRevealed).map((hint, i) => (
        <div
          key={i}
          className="text-text-tertiary text-md mb-2 pl-3 border-l-2 border-(--accent)/25"
        >
          {hint}
        </div>
      ))}

      {hintsRevealed < hints.length && (
        <button
          onClick={onRevealHint}
          className="bg-none border border-border-medium rounded-sm text-text-muted cursor-pointer text-base py-1.5 px-3"
        >
          Reveal Hint ({hintsRevealed + 1}/{hints.length})
        </button>
      )}
    </div>
  );
}
