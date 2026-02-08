/**
 * StackedModule - Vertically connects related StageCards
 */

import type { ReactNode } from 'react';

export interface StackedModuleProps {
  children: ReactNode;
}

export function StackedModule({ children }: StackedModuleProps) {
  return (
    <div className="flex flex-col gap-0 self-start">
      {children}
    </div>
  );
}
