/**
 * ConceptModalContext
 * Provides openConcept(id) / closeConcept() so any component can
 * open a concept detail modal mid-challenge without prop drilling.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConceptModalState {
  /** Currently open concept ID, or null if closed */
  activeConceptId: string | null;
  /** Open a concept detail modal */
  openConcept: (id: string) => void;
  /** Close the modal */
  closeConcept: () => void;
}

const ConceptModalContext = createContext<ConceptModalState | null>(null);

export function ConceptModalProvider({ children }: { children: ReactNode }) {
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  const openConcept = useCallback((id: string) => {
    setActiveConceptId(id);
  }, []);

  const closeConcept = useCallback(() => {
    setActiveConceptId(null);
  }, []);

  return (
    <ConceptModalContext.Provider value={{ activeConceptId, openConcept, closeConcept }}>
      {children}
    </ConceptModalContext.Provider>
  );
}

export function useConceptModal(): ConceptModalState {
  const ctx = useContext(ConceptModalContext);
  if (!ctx) {
    throw new Error('useConceptModal must be used within ConceptModalProvider');
  }
  return ctx;
}
