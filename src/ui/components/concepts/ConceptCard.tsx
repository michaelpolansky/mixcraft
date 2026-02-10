/**
 * Concept card for the grid display.
 * Shows title, summary, and track badge.
 */

import type { ConceptTrack } from '../../../core/types.ts';
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

interface ConceptCardProps {
  id: string;
  title: string;
  summary: string;
  track: ConceptTrack;
  onClick: (id: string) => void;
}

export function ConceptCard({ id, title, summary, track, onClick }: ConceptCardProps) {
  const color = TRACK_COLORS[track];
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'bg-bg-secondary border border-border-medium rounded-lg p-4 text-left cursor-pointer',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright',
        'outline-none focus:ring-2 focus:ring-interactive-focus'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-text-primary m-0 flex-1">{title}</h3>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {TRACK_LABELS[track]}
        </span>
      </div>
      <p className="text-sm text-text-muted m-0 leading-relaxed">{summary}</p>
    </button>
  );
}
