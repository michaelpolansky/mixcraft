/**
 * HarmonicBarsVisualizer - Interactive harmonic drawbars for additive synthesis
 * Shows 16 harmonics as draggable bars with frequency labels
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface HarmonicBarsVisualizerProps {
  harmonics: number[];  // 16 values, 0-1
  onHarmonicChange: (index: number, value: number) => void;
  width?: number;
  height?: number;
  accentColor?: string;
}

export const HarmonicBarsVisualizer: React.FC<HarmonicBarsVisualizerProps> = ({
  harmonics,
  onHarmonicChange,
  width = 600,
  height = 250,
  accentColor = '#06b6d4',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const padding = 40;
  const topPadding = 40;
  const bottomPadding = 30;
  const drawWidth = width - padding * 2;
  const drawHeight = height - topPadding - bottomPadding;
  const barCount = 16;
  const barWidth = (drawWidth / barCount) * 0.7;
  const barGap = (drawWidth / barCount) * 0.3;

  // Get bar x position
  const getBarX = useCallback((index: number): number => {
    return padding + index * (drawWidth / barCount) + barGap / 2;
  }, [padding, drawWidth, barGap]);

  // Get bar from x position
  const getBarIndex = useCallback((x: number): number | null => {
    const relX = x - padding;
    if (relX < 0 || relX > drawWidth) return null;
    const index = Math.floor(relX / (drawWidth / barCount));
    return index >= 0 && index < barCount ? index : null;
  }, [padding, drawWidth]);

  // Get value from y position
  const getValueFromY = useCallback((y: number): number => {
    const relY = y - topPadding;
    const normalized = 1 - (relY / drawHeight);
    return Math.max(0, Math.min(1, normalized));
  }, [topPadding, drawHeight]);

  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw label
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('HARMONICS', padding, 24);

    // Draw info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    const activeCount = harmonics.filter(h => h > 0.01).length;
    ctx.fillText(`${activeCount} active`, width - padding, 24);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = topPadding + (drawHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + drawWidth, y);
      ctx.stroke();
    }

    // Draw y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('100%', padding - 6, topPadding + 4);
    ctx.fillText('50%', padding - 6, topPadding + drawHeight / 2 + 3);
    ctx.fillText('0%', padding - 6, topPadding + drawHeight + 3);

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const x = getBarX(i);
      const value = harmonics[i] ?? 0;
      const barHeight = value * drawHeight;
      const y = topPadding + drawHeight - barHeight;

      const isHovered = hoverIndex === i;
      const isDragging = dragIndex === i;

      // Bar background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x, topPadding, barWidth, drawHeight);

      // Active bar
      if (value > 0.001) {
        // Gradient based on harmonic number
        const hue = (i / barCount) * 60; // 0 = cyan, 16 = greenish
        const saturation = isDragging || isHovered ? 100 : 80;
        const lightness = isDragging ? 60 : isHovered ? 55 : 50;

        ctx.fillStyle = `hsl(${180 + hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Glow effect for active bars
        if (value > 0.3) {
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 8;
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      // Hover/drag indicator
      if (isHovered || isDragging) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, topPadding - 1, barWidth + 2, drawHeight + 2);

        // Value tooltip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 10, y - 24, barWidth + 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(value * 100)}%`, x + barWidth / 2, y - 10);
      }

      // Harmonic number label
      ctx.fillStyle = isHovered || isDragging ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, x + barWidth / 2, height - 10);
    }

  }, [harmonics, width, height, accentColor, dragIndex, hoverIndex, padding, topPadding, drawWidth, drawHeight, barWidth, getBarX]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const index = getBarIndex(x);
    if (index !== null) {
      setDragIndex(index);
      const value = getValueFromY(y);
      onHarmonicChange(index, Math.round(value * 100) / 100);
    }
  }, [getBarIndex, getValueFromY, onHarmonicChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragIndex !== null) {
      const value = getValueFromY(y);
      onHarmonicChange(dragIndex, Math.round(value * 100) / 100);
    } else {
      setHoverIndex(getBarIndex(x));
    }
  }, [dragIndex, getBarIndex, getValueFromY, onHarmonicChange]);

  const handleMouseUp = useCallback(() => {
    setDragIndex(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragIndex(null);
    setHoverIndex(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        cursor: dragIndex !== null ? 'ns-resize' : hoverIndex !== null ? 'pointer' : 'default',
        borderRadius: 8,
        border: `1px solid ${accentColor}40`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};
