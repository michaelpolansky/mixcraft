/**
 * Concept Library & Glossary View
 *
 * Standalone view with:
 * - Search bar + track filter
 * - Two tabs: Concepts and Glossary
 * - Concept cards grid with expandable detail
 * - Alphabetical glossary
 */

import { useState, useEffect, useMemo } from 'react';
import type { Concept, ConceptTrack, GlossaryEntry } from '../../core/types.ts';
import type { ConceptMetadata } from '../../data/concepts/concept-metadata.ts';
import { conceptMetadata } from '../../data/concepts/concept-metadata.ts';
import { glossary } from '../../data/concepts/glossary.ts';
import { ConceptCard } from '../components/concepts/ConceptCard.tsx';
import { ConceptDetailPanel } from '../components/concepts/ConceptDetailPanel.tsx';
import { GlossaryList } from '../components/concepts/GlossaryList.tsx';
import { BackButton } from '../components/Button.tsx';
import { cn } from '../utils/cn.ts';

type Tab = 'concepts' | 'glossary';
type TrackFilter = 'all' | ConceptTrack;

/** Lazy-loaded full concepts data */
type ConceptsModule = typeof import('../../data/concepts/concepts.ts');
let conceptsModule: ConceptsModule | null = null;

async function getConceptsModule(): Promise<ConceptsModule> {
  if (!conceptsModule) {
    conceptsModule = await import('../../data/concepts/concepts.ts');
  }
  return conceptsModule;
}

interface ConceptLibraryViewProps {
  onBack: () => void;
  initialConceptId?: string;
  onStartChallenge?: (challengeId: string) => void;
}

export function ConceptLibraryView({ onBack, initialConceptId, onStartChallenge }: ConceptLibraryViewProps) {
  const [tab, setTab] = useState<Tab>('concepts');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(initialConceptId ?? null);
  const [fullConcepts, setFullConcepts] = useState<Concept[] | null>(null);

  // Load full concepts when a concept is selected
  useEffect(() => {
    if (selectedConceptId && !fullConcepts) {
      getConceptsModule().then((mod) => setFullConcepts(mod.concepts));
    }
  }, [selectedConceptId, fullConcepts]);

  // Auto-select concept from deep link
  useEffect(() => {
    if (initialConceptId) {
      setSelectedConceptId(initialConceptId);
    }
  }, [initialConceptId]);

  // Filter concepts metadata
  const filteredConcepts = useMemo(() => {
    const lower = search.toLowerCase();
    return conceptMetadata.filter((c: ConceptMetadata) => {
      if (trackFilter !== 'all' && c.track !== trackFilter) return false;
      if (!lower) return true;
      return (
        c.title.toLowerCase().includes(lower) ||
        c.summary.toLowerCase().includes(lower) ||
        c.tags.some((t: string) => t.toLowerCase().includes(lower))
      );
    });
  }, [search, trackFilter]);

  // Filter glossary
  const filteredGlossary = useMemo(() => {
    if (!search) return glossary;
    const lower = search.toLowerCase();
    return glossary.filter((g: GlossaryEntry) =>
      g.term.toLowerCase().includes(lower) ||
      g.definition.toLowerCase().includes(lower)
    );
  }, [search]);

  const selectedConcept = fullConcepts?.find((c) => c.id === selectedConceptId) ?? null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans py-6 px-4 md:p-12">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton onClick={onBack} />
          <h1 className="text-3xl font-light text-text-primary m-0">Concept Library</h1>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search concepts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-bg-secondary border border-border-medium rounded-md px-3 py-2 text-text-primary text-sm outline-none focus:border-interactive-focus"
          />
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as TrackFilter)}
            className="bg-bg-secondary border border-border-medium rounded-md px-3 py-2 text-text-primary text-sm outline-none focus:border-interactive-focus cursor-pointer"
          >
            <option value="all">All Tracks</option>
            <option value="sound-design">Sound Design</option>
            <option value="mixing">Mixing</option>
            <option value="production">Production</option>
            <option value="sampling">Sampling</option>
            <option value="drum-sequencing">Drum Sequencing</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border-medium">
          <button
            onClick={() => setTab('concepts')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer bg-none',
              tab === 'concepts'
                ? 'border-success text-success'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            Concepts ({filteredConcepts.length})
          </button>
          <button
            onClick={() => setTab('glossary')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer bg-none',
              tab === 'glossary'
                ? 'border-success text-success'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            Glossary ({filteredGlossary.length})
          </button>
        </div>

        {/* Content */}
        {tab === 'concepts' && (
          <>
            {/* Selected concept detail */}
            {selectedConcept && (
              <div className="mb-6">
                <ConceptDetailPanel
                  concept={selectedConcept}
                  onConceptClick={(id) => setSelectedConceptId(id)}
                  onChallengeClick={onStartChallenge}
                  onClose={() => setSelectedConceptId(null)}
                />
              </div>
            )}

            {/* Concept grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredConcepts.map((c: ConceptMetadata) => (
                <ConceptCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  summary={c.summary}
                  track={c.track}
                  onClick={(id) => setSelectedConceptId(id)}
                />
              ))}
            </div>

            {filteredConcepts.length === 0 && (
              <p className="text-text-muted text-center py-8">
                No concepts found matching "{search}"
              </p>
            )}
          </>
        )}

        {tab === 'glossary' && (
          <>
            <GlossaryList
              entries={filteredGlossary}
              onConceptClick={(id) => {
                setTab('concepts');
                setSelectedConceptId(id);
              }}
            />

            {filteredGlossary.length === 0 && (
              <p className="text-text-muted text-center py-8">
                No glossary terms found matching "{search}"
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
