/**
 * Alphabetical glossary listing with term + definition.
 * "Learn more" link if relatedConcept exists.
 */

import type { GlossaryEntry } from '../../../core/types.ts';

interface GlossaryListProps {
  entries: GlossaryEntry[];
  onConceptClick: (id: string) => void;
}

export function GlossaryList({ entries, onConceptClick }: GlossaryListProps) {
  // Group by first letter
  const grouped = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const letter = entry.term[0]!.toUpperCase();
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(entry);
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([letter, items]) => (
        <div key={letter} className="mb-6">
          <h3 className="text-lg font-bold text-text-muted mb-2 border-b border-border-medium pb-1">
            {letter}
          </h3>
          {items.map((entry) => (
            <div key={entry.term} className="mb-3 pl-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-text-primary">{entry.term}</span>
                {entry.relatedConcept && (
                  <button
                    onClick={() => onConceptClick(entry.relatedConcept!)}
                    className="text-xs text-success cursor-pointer bg-none border-none hover:underline p-0"
                  >
                    Learn more
                  </button>
                )}
              </div>
              <p className="text-sm text-text-muted m-0 mt-0.5 leading-relaxed">
                {entry.definition}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
