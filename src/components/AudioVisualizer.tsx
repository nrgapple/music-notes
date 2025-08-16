import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioVisualizerProps {
  audioElement?: HTMLAudioElement | null;
  isPlaying: boolean;
  onBeatDetected?: () => void;
  className?: string;
}

export function AudioVisualizer({ audioElement, isPlaying, onBeatDetected, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const lastBeatTime = useRef<number>(0);

  const initializeAnalyser = useCallback(() => {
    if (!audioElement) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array;
    } catch (error) {
      console.warn('Could not initialize audio analyser:', error);
    }
  }, [audioElement]);

  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // @ts-ignore - TypeScript has overly strict typing for Web Audio API
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas with subtle gradient for background mode
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsla(240, 8%, 3%, 0.05)');
    gradient.addColorStop(1, 'hsla(240, 8%, 6%, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Beat detection (focusing on bass frequencies for beat detection)
    const bass = dataArray.slice(0, 4).reduce((sum, val) => sum + val, 0) / 4;
    
    const currentTime = Date.now();
    const beatThreshold = 150;
    
    if (bass > beatThreshold && currentTime - lastBeatTime.current > 200) {
      lastBeatTime.current = currentTime;
      onBeatDetected?.();
    }

    // Draw frequency bars with Flume colors
    const barWidth = canvas.width / dataArray.length;
    const colors = [
      'hsl(200, 100%, 65%)', // Electric blue
      'hsl(280, 60%, 70%)',  // Purple
      'hsl(310, 70%, 65%)',  // Pink
      'hsl(25, 100%, 65%)',  // Orange
      'hsl(150, 70%, 65%)',  // Green
    ];

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.6; // Reduced height
      const x = i * barWidth;
      const y = canvas.height - barHeight;
      
      const colorIndex = Math.floor((i / dataArray.length) * colors.length);
      const opacity = Math.max(0.1, (dataArray[i] / 255) * 0.4); // More subtle opacity
      
      ctx.fillStyle = colors[colorIndex].replace('65%)', `65%, ${opacity})`);
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      
      // Subtle glow effect only for very high frequencies
      if (dataArray[i] > 230) {
        ctx.shadowColor = colors[colorIndex];
        ctx.shadowBlur = 10; // Reduced blur
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
      }
    }

    // Draw subtle particles for beat effect
    if (bass > beatThreshold) {
      const particleCount = Math.floor(bass / 60); // Reduced particle count
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1; // Smaller particles
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${200 + Math.random() * 160}, 70%, 65%, 0.3)`; // More transparent
        ctx.fill();
      }
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawVisualization);
    }
  }, [isPlaying, onBeatDetected]);

  useEffect(() => {
    if (audioElement && isPlaying) {
      initializeAnalyser();
    }
  }, [audioElement, isPlaying, initializeAnalyser]);

  useEffect(() => {
    if (isPlaying) {
      drawVisualization();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, drawVisualization]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full opacity-60"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />
      
      {/* Floating particles */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
