/**
 * Info Panel Context
 * Tracks which parameter is currently hovered for the info panel
 * Also manages Help Mode for floating tooltips
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface HoverPosition {
  x: number;
  y: number;
}

interface InfoPanelContextType {
  hoveredParam: string | null;
  hoverPosition: HoverPosition | null;
  setHoveredParam: (paramId: string | null, position?: HoverPosition) => void;
  helpMode: boolean;
  setHelpMode: (enabled: boolean) => void;
  toggleHelpMode: () => void;
}

const InfoPanelContext = createContext<InfoPanelContextType | null>(null);

export function InfoPanelProvider({ children }: { children: ReactNode }) {
  const [hoveredParam, setHoveredParamState] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<HoverPosition | null>(null);
  const [helpMode, setHelpModeState] = useState(false);

  const setHoveredParam = useCallback((paramId: string | null, position?: HoverPosition) => {
    setHoveredParamState(paramId);
    setHoverPosition(position ?? null);
  }, []);

  const setHelpMode = useCallback((enabled: boolean) => {
    setHelpModeState(enabled);
  }, []);

  const toggleHelpMode = useCallback(() => {
    setHelpModeState((prev) => !prev);
  }, []);

  return (
    <InfoPanelContext.Provider value={{
      hoveredParam,
      hoverPosition,
      setHoveredParam,
      helpMode,
      setHelpMode,
      toggleHelpMode
    }}>
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
      hoverPosition: null,
      setHoveredParam: () => {},
      helpMode: false,
      setHelpMode: () => {},
      toggleHelpMode: () => {},
    };
  }
  return context;
}
