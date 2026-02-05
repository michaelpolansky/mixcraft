/**
 * Simple media query hook for responsive design
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Convenience hook for mobile detection
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}

// Convenience hook for tablet detection
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1024px)');
}
