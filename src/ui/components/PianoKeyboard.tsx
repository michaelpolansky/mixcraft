/**
 * Simple piano keyboard for playing notes
 */

import { useCallback, useEffect, useState, type ReactElement } from 'react';

interface PianoKeyboardProps {
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  /** Starting octave */
  octave?: number;
  /** Number of octaves to display */
  octaves?: number;
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

// Computer keyboard to note mapping (one octave)
const KEY_MAP: Record<string, string> = {
  a: 'C',
  w: 'C#',
  s: 'D',
  e: 'D#',
  d: 'E',
  f: 'F',
  t: 'F#',
  g: 'G',
  y: 'G#',
  h: 'A',
  u: 'A#',
  j: 'B',
  k: 'C+', // Next octave C
};

export function PianoKeyboard({
  onNoteOn,
  onNoteOff,
  octave = 4,
  octaves = 2,
}: PianoKeyboardProps) {
  // Track multiple held notes for arpeggiator support
  const [heldNotes, setHeldNotes] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback(
    (note: string) => {
      if (!heldNotes.has(note)) {
        setHeldNotes(prev => new Set([...prev, note]));
        onNoteOn(note);
      }
    },
    [heldNotes, onNoteOn]
  );

  const handleKeyUp = useCallback((note: string) => {
    setHeldNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    onNoteOff(note);
  }, [onNoteOff]);

  // Computer keyboard support
  useEffect(() => {
    const handleKeyboardDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const noteBase = KEY_MAP[key];
      if (noteBase) {
        const noteOctave = noteBase.includes('+') ? octave + 1 : octave;
        const noteName = noteBase.replace('+', '');
        handleKeyDown(`${noteName}${noteOctave}`);
      }
    };

    const handleKeyboardUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const noteBase = KEY_MAP[key];
      if (noteBase) {
        const noteOctave = noteBase.includes('+') ? octave + 1 : octave;
        const noteName = noteBase.replace('+', '');
        handleKeyUp(`${noteName}${noteOctave}`);
      }
    };

    window.addEventListener('keydown', handleKeyboardDown);
    window.addEventListener('keyup', handleKeyboardUp);

    return () => {
      window.removeEventListener('keydown', handleKeyboardDown);
      window.removeEventListener('keyup', handleKeyboardUp);
    };
  }, [octave, handleKeyDown, handleKeyUp]);

  const whiteKeyWidth = 36;
  const blackKeyWidth = 24;
  const whiteKeyHeight = 100;
  const blackKeyHeight = 60;

  const keys: ReactElement[] = [];
  const blackKeyElements: ReactElement[] = [];

  // Generate keys for each octave
  for (let o = 0; o < octaves; o++) {
    const currentOctave = octave + o;

    WHITE_KEYS.forEach((note, i) => {
      const fullNote = `${note}${currentOctave}`;
      const isActive = heldNotes.has(fullNote);
      const x = (o * 7 + i) * whiteKeyWidth;

      keys.push(
        <rect
          key={fullNote}
          x={x}
          y={0}
          width={whiteKeyWidth - 2}
          height={whiteKeyHeight}
          fill={isActive ? '#4ade80' : '#f5f5f5'}
          stroke="#333"
          strokeWidth="1"
          rx="4"
          style={{ cursor: 'pointer', touchAction: 'none' }}
          onMouseDown={() => handleKeyDown(fullNote)}
          onMouseUp={() => handleKeyUp(fullNote)}
          onMouseLeave={() => {
            if (heldNotes.has(fullNote)) handleKeyUp(fullNote);
          }}
          onTouchStart={(e) => { e.preventDefault(); handleKeyDown(fullNote); }}
          onTouchEnd={() => handleKeyUp(fullNote)}
          onTouchCancel={() => handleKeyUp(fullNote)}
        />
      );
    });

    BLACK_KEYS.forEach((note, i) => {
      if (note === null) return;
      const fullNote = `${note}${currentOctave}`;
      const isActive = heldNotes.has(fullNote);
      // Position black keys between white keys
      const x = (o * 7 + i) * whiteKeyWidth + whiteKeyWidth * 0.7;

      blackKeyElements.push(
        <rect
          key={fullNote}
          x={x}
          y={0}
          width={blackKeyWidth}
          height={blackKeyHeight}
          fill={isActive ? '#22c55e' : '#1a1a1a'}
          stroke="#000"
          strokeWidth="1"
          rx="2"
          style={{ cursor: 'pointer', touchAction: 'none' }}
          onMouseDown={() => handleKeyDown(fullNote)}
          onMouseUp={() => handleKeyUp(fullNote)}
          onMouseLeave={() => {
            if (heldNotes.has(fullNote)) handleKeyUp(fullNote);
          }}
          onTouchStart={(e) => { e.preventDefault(); handleKeyDown(fullNote); }}
          onTouchEnd={() => handleKeyUp(fullNote)}
          onTouchCancel={() => handleKeyUp(fullNote)}
        />
      );
    });
  }

  const totalWidth = octaves * 7 * whiteKeyWidth;

  return (
    <div className="bg-bg-tertiary p-3 rounded-lg border border-border-medium">
      <svg
        width={totalWidth}
        height={whiteKeyHeight}
        className="block"
      >
        {keys}
        {blackKeyElements}
      </svg>
      <div className="mt-2 text-xs text-text-muted text-center">
        Use keyboard: A-S-D-F-G-H-J-K (white) W-E-T-Y-U (black)
      </div>
    </div>
  );
}
