/**
 * Hook for polling real-time modulated parameter values from the synth engine.
 * Returns current values for all modulation destinations at animation frame rate (~60fps).
 *
 * Use this to display oscillating/modulated values in the UI when LFO or envelope
 * modulation is active.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import type { ModDestination } from '../../core/types.ts';

export type ModulatedValues = Record<ModDestination, number>;

export function useModulatedValues(): ModulatedValues | null {
  const engine = useSynthStore((state) => state.engine);
  const [values, setValues] = useState<ModulatedValues | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const poll = useCallback(() => {
    if (engine) {
      setValues(engine.getModulatedValues());
    }
    animationRef.current = requestAnimationFrame(poll);
  }, [engine]);

  useEffect(() => {
    // Only poll when engine exists
    if (engine) {
      animationRef.current = requestAnimationFrame(poll);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [engine, poll]);

  return values;
}
