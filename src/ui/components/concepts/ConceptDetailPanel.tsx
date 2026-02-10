/**
 * Expanded concept detail panel.
 * Shows full explanation, related concepts, and related challenges.
 */

import type { Concept, ConceptTrack } from '../../../core/types.ts';
import { cn } from '../../utils/cn.ts';

const TRACK_COLORS: Record<ConceptTrack, string> = {
  'sound-design': '#4ade80',
  'mixing': '#3b82f6',
  'production': '#a855f7',
  'sampling': '#d946ef',
  'drum-sequencing': '#f97316',
  'general': '#888888',
};

const TRACK_LABELS: Record<ConceptTrack, string> = {
  'sound-design': 'Sound Design',
  'mixing': 'Mixing',
  'production': 'Production',
  'sampling': 'Sampling',
  'drum-sequencing': 'Drums',
  'general': 'General',
};

interface ConceptDetailPanelProps {
  concept: Concept;
  onConceptClick: (id: string) => void;
  onChallengeClick?: (id: string) => void;
  onClose: () => void;
}

export function ConceptDetailPanel({
  concept,
  onConceptClick,
  onChallengeClick,
  onClose,
}: ConceptDetailPanelProps) {
  const color = TRACK_COLORS[concept.track];

  return (
    <div className="bg-bg-tertiary rounded-xl border border-border-medium p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary m-0 mb-1">{concept.title}</h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {TRACK_LABELS[concept.track]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="bg-none border-none text-text-muted cursor-pointer text-xl p-1 hover:text-text-primary"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Summary */}
      <p className="text-text-secondary text-base mb-4 leading-relaxed font-medium italic">
        {concept.summary}
      </p>

      {/* Explanation paragraphs */}
      <div className="mb-6">
        {concept.explanation.map((paragraph, i) => (
          <p key={i} className="text-text-tertiary text-sm leading-relaxed mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Related Concepts */}
      {concept.relatedConcepts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs uppercase text-text-muted mb-2 tracking-wider">Related Concepts</h4>
          <div className="flex flex-wrap gap-2">
            {concept.relatedConcepts.map((id) => (
              <button
                key={id}
                onClick={() => onConceptClick(id)}
                className={cn(
                  'text-sm px-3 py-1 rounded-full border border-border-medium bg-bg-secondary',
                  'cursor-pointer text-text-secondary hover:text-text-primary hover:border-border-bright',
                  'transition-colors'
                )}
              >
                {id.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Challenges */}
      {concept.relatedChallenges.length > 0 && onChallengeClick && (
        <div>
          <h4 className="text-xs uppercase text-text-muted mb-2 tracking-wider">Practice Challenges</h4>
          <div className="flex flex-wrap gap-2">
            {concept.relatedChallenges.map((id) => (
              <button
                key={id}
                onClick={() => onChallengeClick(id)}
                className={cn(
                  'text-sm px-3 py-1 rounded-full bg-success/10 border border-success/25',
                  'cursor-pointer text-success hover:bg-success/20',
                  'transition-colors'
                )}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
