/**
 * Inline clickable concept reference.
 * Used in hints and results to open concept details mid-challenge.
 */

import { useConceptModal } from '../../context/ConceptModalContext.tsx';

interface ConceptLinkProps {
  conceptId: string;
  children: React.ReactNode;
}

export function ConceptLink({ conceptId, children }: ConceptLinkProps) {
  const { openConcept } = useConceptModal();

  return (
    <button
      onClick={() => openConcept(conceptId)}
      className="inline text-success cursor-pointer bg-none border-none p-0 font-inherit text-inherit underline decoration-success/40 hover:decoration-success/80 transition-colors"
    >
      {children}
    </button>
  );
}
