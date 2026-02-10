/**
 * Hints reveal panel for challenge views.
 * Supports [[concept-id|display text]] markers for inline concept links.
 */

import { parseConceptLinks, type HintSegment } from '../../utils/parse-concept-links.ts';
import { ConceptLink } from '../concepts/ConceptLink.tsx';

interface HintsPanelProps {
  hints: string[];
  hintsRevealed: number;
  onRevealHint: () => void;
  accentColor?: string;
}

function renderHint(hint: string, key: number) {
  const segments = parseConceptLinks(hint);
  // Optimization: if single text segment, render plain string (most common case)
  if (segments.length === 1 && segments[0]!.type === 'text') {
    return (
      <div
        key={key}
        className="text-text-tertiary text-md mb-2 pl-3 border-l-2 border-(--accent)/25"
      >
        {segments[0]!.value}
      </div>
    );
  }

  return (
    <div
      key={key}
      className="text-text-tertiary text-md mb-2 pl-3 border-l-2 border-(--accent)/25"
    >
      {segments.map((seg: HintSegment, i: number) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <ConceptLink key={i} conceptId={seg.conceptId}>
            {seg.label}
          </ConceptLink>
        )
      )}
    </div>
  );
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
      {hints.slice(0, hintsRevealed).map((hint, i) => renderHint(hint, i))}

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
