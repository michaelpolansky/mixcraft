/**
 * Shared hook that normalizes mouse and touch events into a single drag interface.
 * Replaces per-component mousedown → document mousemove/mouseup patterns.
 *
 * Usage:
 *   const { onPointerDown } = usePointerDrag({ onStart, onMove, onEnd });
 *   <div onMouseDown={onPointerDown} onTouchStart={onPointerDown} />
 */

import { useCallback, useRef } from 'react';

interface PointerDragCallbacks {
  onStart?: (clientX: number, clientY: number) => void;
  onMove: (clientX: number, clientY: number) => void;
  onEnd?: () => void;
}

function getCoords(e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): { clientX: number; clientY: number } | null {
  if ('touches' in e) {
    const touch = e.touches[0] ?? (e as TouchEvent).changedTouches?.[0];
    if (!touch) return null;
    return { clientX: touch.clientX, clientY: touch.clientY };
  }
  return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
}

export function usePointerDrag({ onStart, onMove, onEnd }: PointerDragCallbacks) {
  const cleanupRef = useRef<(() => void) | null>(null);

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default on touch to stop iOS scroll/bounce
    if ('touches' in e) {
      e.preventDefault();
    }

    const coords = getCoords(e);
    if (!coords) return;

    onStart?.(coords.clientX, coords.clientY);
    onMove(coords.clientX, coords.clientY);

    const isTouch = 'touches' in e;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveCoords = getCoords(moveEvent);
      if (moveCoords) {
        onMove(moveCoords.clientX, moveCoords.clientY);
      }
    };

    const handleEnd = () => {
      onEnd?.();
      cleanup();
    };

    const cleanup = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }
      cleanupRef.current = null;
    };

    // Clean up any previous drag that wasn't properly ended
    cleanupRef.current?.();

    if (isTouch) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }

    cleanupRef.current = cleanup;
  }, [onStart, onMove, onEnd]);

  return { onPointerDown };
}
