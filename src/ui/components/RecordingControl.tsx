/**
 * RecordingControl - UI for recording synth output
 * Features: record button, timer, stop, playback, and download
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../utils/cn.ts';
import { AudioRecorder, createAudioRecorder } from '../../core/audio-recorder.ts';

interface RecordingControlProps {
  /** Audio node to record from */
  sourceNode: AudioNode | null;
  /** Accent color for UI elements */
  accentColor?: string;
  /** Compact mode - vertical layout with just essential controls */
  compact?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'stopped';

/**
 * Formats seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RecordingControl({
  sourceNode,
  accentColor = '#ef4444',
  compact = false,
}: RecordingControlProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const maxTime = 30;

  // Cleanup object URL on unmount or when blob changes
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
      if (recorderRef.current) {
        recorderRef.current.dispose();
      }
    };
  }, []);

  // Update timer during recording
  useEffect(() => {
    if (state === 'recording' && recorderRef.current) {
      const updateTimer = () => {
        if (recorderRef.current) {
          setElapsedTime(recorderRef.current.getElapsedTime());
        }
        if (state === 'recording') {
          timerRef.current = requestAnimationFrame(updateTimer);
        }
      };
      timerRef.current = requestAnimationFrame(updateTimer);

      return () => {
        if (timerRef.current) {
          cancelAnimationFrame(timerRef.current);
        }
      };
    }
  }, [state]);

  // Handle auto-stop callback
  const handleAutoStop = useCallback(async () => {
    if (recorderRef.current) {
      const blob = await recorderRef.current.stop();
      setRecordedBlob(blob);
      setElapsedTime(recorderRef.current.getElapsedTime());
      setState('stopped');
    }
  }, []);

  // Start recording
  const handleStartRecording = useCallback(() => {
    if (!sourceNode) return;

    // Clean up previous recording
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setRecordedBlob(null);
    setIsPlaying(false);

    // Create new recorder
    recorderRef.current = createAudioRecorder(sourceNode);
    recorderRef.current.onAutoStop(handleAutoStop);
    recorderRef.current.start();

    setElapsedTime(0);
    setState('recording');
  }, [sourceNode, handleAutoStop]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    const blob = await recorderRef.current.stop();
    setRecordedBlob(blob);
    setElapsedTime(recorderRef.current.getElapsedTime());
    setState('stopped');
  }, []);

  // Play recorded audio
  const handlePlay = useCallback(() => {
    if (!recordedBlob) return;

    // Create object URL if needed
    if (!objectUrlRef.current) {
      objectUrlRef.current = URL.createObjectURL(recordedBlob);
    }

    // Create audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsPlaying(false);
    }

    audioRef.current.src = objectUrlRef.current;
    audioRef.current.play();
    setIsPlaying(true);
  }, [recordedBlob]);

  // Stop playback
  const handleStopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Download recording
  const handleDownload = useCallback(() => {
    if (!recordedBlob) return;

    // Create object URL if needed
    if (!objectUrlRef.current) {
      objectUrlRef.current = URL.createObjectURL(recordedBlob);
    }

    // Create download link
    const link = document.createElement('a');
    link.href = objectUrlRef.current;
    link.download = `mixcraft-recording-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [recordedBlob]);

  // Reset to idle state
  const handleNewRecording = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setRecordedBlob(null);
    setIsPlaying(false);
    setElapsedTime(0);
    setState('idle');
  }, []);

  const isDisabled = !sourceNode;

  // Compact vertical layout for narrow spaces
  if (compact) {
    return (
      <div
        className="flex flex-col items-center gap-2 p-2 bg-bg-tertiary rounded-md border border-border-medium"
        style={{ '--accent': accentColor } as React.CSSProperties}
      >
        {/* Record/Stop Button */}
        {state === 'idle' && (
          <button
            onClick={handleStartRecording}
            disabled={isDisabled}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border-none cursor-pointer',
              isDisabled && 'cursor-not-allowed'
            )}
            style={{
              background: isDisabled ? '#333' : accentColor,
              boxShadow: isDisabled ? 'none' : `0 2px 8px ${accentColor}40`,
            }}
            title="Start Recording"
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                background: isDisabled ? '#555' : '#fff',
                borderRadius: '50%',
              }}
            />
          </button>
        )}

        {state === 'recording' && (
          <button
            onClick={handleStopRecording}
            className="flex items-center justify-center w-9 h-9 rounded-full border-none cursor-pointer"
            style={{
              background: accentColor,
              animation: 'pulse 1.5s ease-in-out infinite',
              boxShadow: `0 2px 12px ${accentColor}60`,
            }}
            title="Stop Recording"
          >
            <div className="w-3 h-3 bg-white rounded-sm" />
          </button>
        )}

        {state === 'stopped' && (
          <button
            onClick={handleNewRecording}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer"
            style={{
              background: '#333',
              border: `2px solid ${accentColor}`,
            }}
            title="New Recording"
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                background: accentColor,
                borderRadius: '50%',
              }}
            />
          </button>
        )}

        {/* Timer */}
        <div
          className={cn(
            'font-mono text-xs text-center',
            state === 'recording' ? 'text-[var(--accent)]' : 'text-text-muted'
          )}
        >
          {formatTime(elapsedTime)}/{formatTime(maxTime)}
        </div>

        {/* Playback controls when stopped */}
        {state === 'stopped' && recordedBlob && (
          <div className="flex gap-1.5">
            <button
              onClick={isPlaying ? handleStopPlayback : handlePlay}
              className="flex items-center justify-center w-7 h-7 bg-border-medium border border-border-bright rounded cursor-pointer hover:bg-bg-quaternary"
              title={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="#fff">
                  <rect x="2" y="1" width="4" height="12" rx="1" />
                  <rect x="8" y="1" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="#fff">
                  <path d="M3 1.5v11l9-5.5z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-7 h-7 bg-success-light border-none rounded cursor-pointer hover:bg-success active:scale-[0.98]"
              title="Download WAV"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="#000">
                <path d="M7 9.5L3 5.5h2.5V1h3v4.5H11L7 9.5z" />
                <path d="M2 11v1.5h10V11H2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Pulse animation */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; box-shadow: 0 2px 12px ${accentColor}60; }
              50% { opacity: 0.8; box-shadow: 0 2px 20px ${accentColor}80; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 py-3 px-4 bg-bg-tertiary rounded-lg border border-border-medium"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Record/Stop Button */}
      {state === 'idle' && (
        <button
          onClick={handleStartRecording}
          disabled={isDisabled}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-transform duration-100 active:scale-95',
            isDisabled && 'cursor-not-allowed'
          )}
          style={{
            background: isDisabled ? '#333' : accentColor,
            boxShadow: isDisabled ? 'none' : `0 2px 8px ${accentColor}40`,
          }}
          title="Start Recording"
        >
          {/* Record icon (filled circle) */}
          <div
            style={{
              width: '16px',
              height: '16px',
              background: isDisabled ? '#555' : '#fff',
              borderRadius: '50%',
            }}
          />
        </button>
      )}

      {state === 'recording' && (
        <button
          onClick={handleStopRecording}
          className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-transform duration-100 active:scale-95"
          style={{
            background: accentColor,
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: `0 2px 12px ${accentColor}60`,
          }}
          title="Stop Recording"
        >
          {/* Stop icon (square) */}
          <div className="w-3.5 h-3.5 bg-white rounded-sm" />
        </button>
      )}

      {state === 'stopped' && (
        <button
          onClick={handleNewRecording}
          className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-transform duration-100 active:scale-95"
          style={{
            background: '#333',
            border: `2px solid ${accentColor}`,
          }}
          title="New Recording"
        >
          {/* Record icon (outline circle) */}
          <div
            style={{
              width: '16px',
              height: '16px',
              background: accentColor,
              borderRadius: '50%',
            }}
          />
        </button>
      )}

      {/* Timer Display */}
      <div
        className={cn(
          'font-mono text-lg min-w-[70px] text-center',
          state === 'recording' ? 'text-[var(--accent)]' : 'text-text-muted'
        )}
      >
        {formatTime(elapsedTime)}/{formatTime(maxTime)}
      </div>

      {/* Progress Bar */}
      <div className="flex-1 h-1.5 bg-border-medium rounded-full overflow-hidden min-w-[100px]">
        <div
          style={{
            width: `${Math.min((elapsedTime / maxTime) * 100, 100)}%`,
            height: '100%',
            background: state === 'recording'
              ? accentColor
              : state === 'stopped'
                ? '#4ade80'
                : '#555',
            borderRadius: '3px',
            transition: state === 'recording' ? 'none' : 'width 0.2s',
          }}
        />
      </div>

      {/* Playback Controls (only shown when stopped with recording) */}
      {state === 'stopped' && recordedBlob && (
        <>
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying ? handleStopPlayback : handlePlay}
            className="flex items-center justify-center w-8 h-8 bg-border-medium border border-border-bright rounded cursor-pointer hover:bg-bg-quaternary"
            title={isPlaying ? 'Stop Playback' : 'Play Recording'}
          >
            {isPlaying ? (
              // Pause icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff">
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              // Play icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff">
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-success-light border-none rounded text-bg-primary text-sm font-semibold cursor-pointer hover:bg-success active:scale-[0.98]"
            title="Download WAV"
          >
            {/* Download icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M7 9.5L3 5.5h2.5V1h3v4.5H11L7 9.5z" />
              <path d="M2 11v1.5h10V11H2z" />
            </svg>
            WAV
          </button>
        </>
      )}

      {/* Pulse animation for recording state */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 2px 12px ${accentColor}60;
            }
            50% {
              opacity: 0.8;
              box-shadow: 0 2px 20px ${accentColor}80;
            }
          }
        `}
      </style>
    </div>
  );
}
