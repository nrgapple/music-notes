import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare } from 'lucide-react';
import type { AudioFile, PlaybackState, Note } from '@/types';
import { formatTime, decodeAudioFile, generateWaveformData, normalizeWaveform } from '@/utils/audio';


interface WaveformViewProps {
  audioFile: AudioFile;
  playbackState: PlaybackState;
  notes: Note[];
  onSeek: (time: number) => void;
  onAddNote: (timestamp: number) => void;
  selectedNote: Note | null;
  onSelectNote: (note: Note | null) => void;
}

export function WaveformView({
  audioFile,
  playbackState,
  notes,
  onSeek,
  onAddNote,
  selectedNote,
  onSelectNote
}: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  // Generate waveform data
  useEffect(() => {
    let isCancelled = false;

    const generateWaveform = async () => {
      if (!audioFile) return;

      setIsLoading(true);
      try {
        const audioBuffer = await decodeAudioFile(audioFile.file);
        if (isCancelled) return;

        const peaks = generateWaveformData(audioBuffer);
        const normalizedPeaks = normalizeWaveform(peaks);
        
        setWaveformData(normalizedPeaks);
      } catch (error) {
        console.error('Error generating waveform:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateWaveform();

    return () => {
      isCancelled = true;
    };
  }, [audioFile]);

  // Draw waveform
  useEffect(() => {
    if (!waveformData || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const container = containerRef.current;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    // Clear canvas with transparency to show visualizer background
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barWidth = width / waveformData.length;
    const maxBarHeight = height * 0.8;

    ctx.fillStyle = 'hsl(217.2 32.6% 17.5%)';
    
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barHeight = waveformData[i] * maxBarHeight;
      
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    }

    // Draw progress
    const progressX = (playbackState.currentTime / playbackState.duration) * width;
    
    // Draw played portion
    ctx.fillStyle = 'hsl(210 40% 98%)';
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      if (x > progressX) break;
      
      const barHeight = waveformData[i] * maxBarHeight;
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    }

    // Draw progress line
    ctx.strokeStyle = 'hsl(210 40% 98%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();

    // Draw note markers
    notes.forEach(note => {
      const noteX = (note.timestamp / playbackState.duration) * width;
      
      ctx.fillStyle = note.color || '#3b82f6';
      ctx.beginPath();
      ctx.arc(noteX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();

      if (selectedNote?.id === note.id) {
        ctx.strokeStyle = 'hsl(210 40% 98%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(noteX, centerY, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw hover indicator
    if (hoveredTime !== null) {
      const hoverX = (hoveredTime / playbackState.duration) * width;
      ctx.strokeStyle = 'hsl(210 40% 98%)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [waveformData, playbackState, notes, selectedNote, hoveredTime]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !playbackState.duration) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * playbackState.duration;

    // Check if clicking on a note
    const tolerance = 10; // pixels
    const clickedNote = notes.find(note => {
      const noteX = (note.timestamp / playbackState.duration) * rect.width;
      return Math.abs(clickX - noteX) <= tolerance;
    });

    if (clickedNote) {
      onSelectNote(selectedNote?.id === clickedNote.id ? null : clickedNote);
    } else {
      onSeek(time);
    }
  }, [playbackState.duration, notes, selectedNote, onSeek, onSelectNote]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !playbackState.duration) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * playbackState.duration;

    onAddNote(time);
  }, [playbackState.duration, onAddNote]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !playbackState.duration) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = mouseX / rect.width;
    const time = percentage * playbackState.duration;
    setHoveredTime(time);
  }, [playbackState.duration]);

  const handleMouseLeave = useCallback(() => {
    setHoveredTime(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">Generating waveform...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Waveform Timeline
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Double-click to add note</span>
          <Plus className="w-4 h-4" />
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative rounded-lg overflow-hidden cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          className="w-full h-full"
        />

        {/* Hover tooltip */}
        {hoveredTime !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-mono pointer-events-none"
          >
            {formatTime(hoveredTime)}
          </motion.div>
        )}

        {/* Note details panel */}
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-background/90 backdrop-blur border border-border rounded-lg p-4 max-w-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">
                {formatTime(selectedNote.timestamp)}
              </span>
              <button
                onClick={() => onSelectNote(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <p className="text-sm">{selectedNote.content}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
