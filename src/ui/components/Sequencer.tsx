/**
 * Sequencer Component
 * Plays note sequences through synth engines with optional drum backing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SynthEngineInterface } from '../../core/synth-sequencer.ts';
import { SynthSequencer, createSynthSequencer } from '../../core/synth-sequencer.ts';
import type { NoteSequence } from '../../core/synth-sequencer.ts';
import { NOTE_SEQUENCES } from '../../data/sequences/note-sequences.ts';

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

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    background: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    minWidth: '60px',
  };

  const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
  };

  const playButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: isPlaying ? '#ef4444' : accentColor,
    border: 'none',
    borderRadius: '50%',
    cursor: isLoaded && engine ? 'pointer' : 'not-allowed',
    opacity: isLoaded && engine ? 1 : 0.5,
    transition: 'transform 0.1s, background 0.2s',
  };

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: drumsEnabled ? accentColor + '30' : '#0a0a0a',
    border: `1px solid ${drumsEnabled ? accentColor : '#333'}`,
    borderRadius: '4px',
    color: drumsEnabled ? accentColor : '#666',
    fontSize: '12px',
    cursor: currentSequence.withDrums ? 'pointer' : 'not-allowed',
    opacity: currentSequence.withDrums ? 1 : 0.4,
    transition: 'all 0.2s',
  };

  const tempoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#888',
  };

  const noteIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '4px',
  };

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
    <div style={containerStyle}>
      {/* Row 1: Sequence selector and play button */}
      <div style={rowStyle}>
        <span style={labelStyle}>Sequence</span>
        <select
          value={currentSequence.id}
          onChange={handleSequenceChange}
          style={selectStyle}
        >
          {NOTE_SEQUENCES.map(seq => (
            <option key={seq.id} value={seq.id}>
              {seq.name} {seq.withDrums ? '(with drums)' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handlePlayStop}
          style={playButtonStyle}
          disabled={!isLoaded || !engine}
          title={isPlaying ? 'Stop' : 'Play'}
        >
          {renderPlayIcon()}
        </button>
      </div>

      {/* Row 2: Tempo and drums toggle */}
      <div style={rowStyle}>
        <div style={tempoStyle}>
          <span style={{ color: '#666' }}>BPM:</span>
          <span style={{ color: '#fff', fontWeight: 500 }}>{currentSequence.tempo}</span>
        </div>
        <button
          onClick={handleDrumsToggle}
          style={toggleStyle}
          disabled={!currentSequence.withDrums}
          title={currentSequence.withDrums ? 'Toggle drums' : 'This sequence has no drums'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="2" />
          </svg>
          Drums {drumsEnabled ? 'ON' : 'OFF'}
        </button>
        <div style={{ flex: 1 }} />
      </div>

      {/* Note indicator - shows which notes are in the sequence */}
      {isPlaying && currentSequence.notes.length > 0 && (
        <div style={noteIndicatorStyle}>
          {currentSequence.notes.map((note, index) => (
            <div
              key={`${note.time}-${index}`}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: index === currentNoteIndex ? accentColor : '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 600,
                color: index === currentNoteIndex ? '#000' : '#666',
                transition: 'all 0.05s',
              }}
            >
              {note.note.replace(/\d/, '')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
