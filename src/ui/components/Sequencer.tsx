/**
 * Sequencer Component
 * Plays note sequences through synth engines with optional drum backing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SynthEngineInterface } from '../../core/synth-sequencer.ts';
import { SynthSequencer, createSynthSequencer } from '../../core/synth-sequencer.ts';
import type { NoteSequence } from '../../core/synth-sequencer.ts';
import { NOTE_SEQUENCES } from '../../data/sequences/note-sequences.ts';
import { cn } from '../utils/cn.ts';

interface SequencerProps {
  /** The synth engine to play notes through */
  engine: SynthEngineInterface | null;
  /** Accent color for the UI */
  accentColor?: string;
  /** Called when playback state changes */
  onPlaybackChange?: (isPlaying: boolean) => void;
}

/**
 * Sequencer component with sequence selector, play/stop, drums toggle
 */
export function Sequencer({
  engine,
  accentColor = '#4ade80',
  onPlaybackChange,
}: SequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [drumsEnabled, setDrumsEnabled] = useState(true);
  const [currentSequence, setCurrentSequence] = useState<NoteSequence>(NOTE_SEQUENCES[0]!);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const sequencerRef = useRef<SynthSequencer | null>(null);

  // Initialize sequencer on mount
  useEffect(() => {
    const sequencer = createSynthSequencer();
    sequencerRef.current = sequencer;

    // Initialize async
    sequencer.start().then(() => {
      setIsLoaded(true);
      // Load default sequence
      const defaultSequence = NOTE_SEQUENCES[0];
      if (defaultSequence) {
        sequencer.loadSequence(defaultSequence);
      }
    });

    // Set up note callback
    sequencer.onNoteChange((_note: string, index: number) => {
      setCurrentNoteIndex(index);
    });

    return () => {
      sequencer.dispose();
    };
  }, []);

  // Update synth engine when it changes
  useEffect(() => {
    if (sequencerRef.current && engine) {
      sequencerRef.current.setSynth(engine);
    }
  }, [engine]);

  // Handle sequence change
  const handleSequenceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const sequence = NOTE_SEQUENCES.find(s => s.id === e.target.value);
    if (sequence && sequencerRef.current) {
      // Stop current playback
      if (isPlaying) {
        sequencerRef.current.stop();
        setIsPlaying(false);
        onPlaybackChange?.(false);
      }

      setCurrentSequence(sequence);
      setCurrentNoteIndex(-1);
      sequencerRef.current.loadSequence(sequence);

      // Update drums enabled based on sequence
      if (sequence.withDrums) {
        sequencerRef.current.setDrumsEnabled(drumsEnabled);
      }
    }
  }, [isPlaying, drumsEnabled, onPlaybackChange]);

  // Handle play/stop
  const handlePlayStop = useCallback(async () => {
    if (!sequencerRef.current || !isLoaded || !engine) return;

    if (isPlaying) {
      sequencerRef.current.stop();
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
      onPlaybackChange?.(false);
    } else {
      sequencerRef.current.play();
      setIsPlaying(true);
      onPlaybackChange?.(true);
    }
  }, [isPlaying, isLoaded, engine, onPlaybackChange]);

  // Handle drums toggle
  const handleDrumsToggle = useCallback(() => {
    if (!sequencerRef.current) return;

    const newState = !drumsEnabled;
    setDrumsEnabled(newState);
    sequencerRef.current.setDrumsEnabled(newState);
  }, [drumsEnabled]);

  const canPlay = isLoaded && !!engine;

  // Render play icon (triangle) or stop icon (square)
  const renderPlayIcon = () => {
    if (isPlaying) {
      // Stop icon (square)
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <rect x="3" y="3" width="10" height="10" rx="1" />
        </svg>
      );
    }
    // Play icon (triangle)
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
        <path d="M4 2 L14 8 L4 14 Z" />
      </svg>
    );
  };

  return (
    <div
      className="flex flex-col gap-3 p-3 bg-bg-secondary rounded-md border border-border-medium"
      style={{ '--seq-accent': accentColor } as React.CSSProperties}
    >
      {/* Row 1: Sequence selector and play button */}
      <div className="flex items-center gap-3">
        <span className="text-base text-text-muted uppercase tracking-wide min-w-[60px]">Sequence</span>
        <select
          value={currentSequence.id}
          onChange={handleSequenceChange}
          className="flex-1 py-2 px-3 bg-bg-primary border border-border-medium rounded-sm text-text-primary text-md cursor-pointer"
        >
          {NOTE_SEQUENCES.map(seq => (
            <option key={seq.id} value={seq.id}>
              {seq.name} {seq.withDrums ? '(with drums)' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handlePlayStop}
          disabled={!canPlay}
          title={isPlaying ? 'Stop' : 'Play'}
          className={cn(
            'flex items-center justify-center w-10 h-10 border-none rounded-full cursor-pointer transition-all duration-100',
            !canPlay && 'opacity-50 cursor-not-allowed'
          )}
          style={{ background: isPlaying ? '#ef4444' : accentColor }}
        >
          {renderPlayIcon()}
        </button>
      </div>

      {/* Row 2: Tempo and drums toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 py-1.5 px-3 bg-bg-primary border border-border-medium rounded-sm text-md">
          <span className="text-text-muted">BPM:</span>
          <span className="text-text-primary font-medium">{currentSequence.tempo}</span>
        </div>
        <button
          onClick={handleDrumsToggle}
          disabled={!currentSequence.withDrums}
          title={currentSequence.withDrums ? 'Toggle drums' : 'This sequence has no drums'}
          className={cn(
            'flex items-center gap-2 py-1.5 px-3 rounded-sm text-md cursor-pointer transition-all duration-200 border',
            drumsEnabled
              ? 'bg-(--seq-accent)/20 border-(--seq-accent) text-(--seq-accent)'
              : 'bg-bg-primary border-border-medium text-text-muted',
            !currentSequence.withDrums && 'opacity-40 cursor-not-allowed'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="2" />
          </svg>
          Drums {drumsEnabled ? 'ON' : 'OFF'}
        </button>
        <div className="flex-1" />
      </div>

      {/* Note indicator - shows which notes are in the sequence */}
      {isPlaying && currentSequence.notes.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {currentSequence.notes.map((note, index) => (
            <div
              key={`${note.time}-${index}`}
              className={cn(
                'w-6 h-6 rounded-sm flex items-center justify-center text-[9px] font-semibold transition-all duration-[50ms]',
                index === currentNoteIndex
                  ? 'text-bg-primary'
                  : 'bg-border-medium text-text-muted'
              )}
              style={index === currentNoteIndex ? { background: accentColor } : undefined}
            >
              {note.note.replace(/\d/, '')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
