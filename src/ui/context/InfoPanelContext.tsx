/**
 * Info Panel Context
 * Tracks which parameter is currently hovered for the info panel
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface InfoPanelContextType {
  hoveredParam: string | null;
  setHoveredParam: (paramId: string | null) => void;
}

const InfoPanelContext = createContext<InfoPanelContextType | null>(null);

export function InfoPanelProvider({ children }: { children: ReactNode }) {
  const [hoveredParam, setHoveredParamState] = useState<string | null>(null);

  const setHoveredParam = useCallback((paramId: string | null) => {
    setHoveredParamState(paramId);
  }, []);

  return (
    <InfoPanelContext.Provider value={{ hoveredParam, setHoveredParam }}>
      {children}
    </InfoPanelContext.Provider>
  );
}

export function useInfoPanel() {
  const context = useContext(InfoPanelContext);
  if (!context) {
    // Return a no-op version if used outside provider
    return {
      hoveredParam: null,
      setHoveredParam: () => {},
    };
  }
  return context;
}
