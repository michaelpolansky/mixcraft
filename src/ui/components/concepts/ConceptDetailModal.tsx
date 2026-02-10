/**
 * Fixed overlay modal for viewing concept details mid-challenge.
 * Rendered at app level via ConceptModalContext.
 */

import { useState, useEffect } from 'react';
import { useConceptModal } from '../../context/ConceptModalContext.tsx';
import { ConceptDetailPanel } from './ConceptDetailPanel.tsx';
import type { Concept } from '../../../core/types.ts';

/** Lazy-loaded concepts module */
type ConceptsModule = typeof import('../../../data/concepts/concepts.ts');
let conceptsModule: ConceptsModule | null = null;

async function getConceptsModule(): Promise<ConceptsModule> {
  if (!conceptsModule) {
    conceptsModule = await import('../../../data/concepts/concepts.ts');
  }
  return conceptsModule;
}

export function ConceptDetailModal() {
  const { activeConceptId, closeConcept, openConcept } = useConceptModal();
  const [concept, setConcept] = useState<Concept | null>(null);

  useEffect(() => {
    if (!activeConceptId) {
      setConcept(null);
      return;
    }

    getConceptsModule().then((mod) => {
      const found = mod.concepts.find((c) => c.id === activeConceptId);
      setConcept(found ?? null);
    });
  }, [activeConceptId]);

  if (!activeConceptId || !concept) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[var(--z-modal)] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeConcept();
      }}
    >
      <div className="max-w-[600px] w-full max-h-[80vh] overflow-y-auto">
        <ConceptDetailPanel
          concept={concept}
          onConceptClick={(id) => openConcept(id)}
          onClose={closeConcept}
        />
      </div>
    </div>
  );
}
