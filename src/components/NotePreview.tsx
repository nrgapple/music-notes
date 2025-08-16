import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap } from 'lucide-react';
import type { Note } from '@/types';
import { formatTime } from '@/utils/audio';

interface NotePreviewProps {
  notes: Note[];
  currentTime: number;
  isPlaying: boolean;
  onBeat?: boolean;
}

export function NotePreview({ notes, currentTime, isPlaying, onBeat }: NotePreviewProps) {

  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  const activeNotes = useMemo(() => {
    if (!isPlaying) return [];
    
    // Show notes that are within 3 seconds of current time for more dramatic effect
    const tolerance = 3;
    return notes.filter(note => 
      Math.abs(note.timestamp - currentTime) <= tolerance
    ).sort((a, b) => Math.abs(a.timestamp - currentTime) - Math.abs(b.timestamp - currentTime));
  }, [notes, currentTime, isPlaying]);

  const primaryNote = activeNotes[0];

  // Beat effect
  useEffect(() => {
    if (onBeat) {
      
      // Create particles on beat
      const newParticles = Array.from({length: 5}, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      
      setParticles(prev => [...prev, ...newParticles]);
      
      // Remove particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 2000);
    }
  }, [onBeat]);

  if (!isPlaying || !primaryNote) {
    return null;
  }

  const isExactMatch = Math.abs(primaryNote.timestamp - currentTime) < 0.5;
  const timeUntilNote = primaryNote.timestamp - currentTime;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={primaryNote.id}
        initial={{ 
          opacity: 0, 
          y: 100, 
          scale: 0.5,
          rotateX: -90,
        }}
        animate={{ 
          opacity: 1, 
          y: isExactMatch ? -20 : 0, 
          scale: isExactMatch ? 1.1 : 1,
          rotateX: 0,
          // Beat-synchronized movement
          x: onBeat ? [0, -10, 10, 0] : 0,
        }}
        exit={{ 
          opacity: 0, 
          y: -50, 
          scale: 0.8,
          rotateX: 90,
        }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 400,
          duration: 0.6,
          x: {
            duration: 0.3,
            ease: "easeOut"
          }
        }}
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none ${
          onBeat ? 'beat-pop' : ''
        }`}
        style={{
          filter: `drop-shadow(0 0 ${isExactMatch ? '30px' : '15px'} hsl(var(--flume-electric) / 0.4))`,
        }}
      >
        <div className="glass rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 relative">
            <motion.div 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flume-pulse"
              animate={{
                scale: isExactMatch ? [1, 1.2, 1] : 1,
                rotate: onBeat ? 360 : 0,
              }}
              transition={{
                scale: { duration: 0.5, repeat: isExactMatch ? Infinity : 0 },
                rotate: { duration: 0.3 }
              }}
            >
              {isExactMatch ? (
                <Zap className="w-4 h-4 text-primary" />
              ) : (
                <MessageSquare className="w-4 h-4 text-primary" />
              )}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-primary">Note</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono text-muted-foreground">
                  {formatTime(primaryNote.timestamp)}
                </span>
              </div>
              
              {!isExactMatch && (
                <motion.div 
                  className="text-xs text-muted-foreground mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {timeUntilNote > 0 
                    ? `Coming up in ${Math.abs(timeUntilNote).toFixed(1)}s`
                    : `${Math.abs(timeUntilNote).toFixed(1)}s ago`
                  }
                </motion.div>
              )}
            </div>

            {/* Enhanced timing indicator */}
            <motion.div 
              className={`w-3 h-3 rounded-full relative`}
              animate={{
                scale: isExactMatch ? [1, 1.5, 1] : 1,
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                scale: { duration: 0.8, repeat: isExactMatch ? Infinity : 0 },
                opacity: { duration: 1.5, repeat: Infinity }
              }}
              style={{
                background: isExactMatch 
                  ? 'hsl(var(--flume-green))' 
                  : timeUntilNote > 0 
                    ? 'hsl(var(--flume-orange))' 
                    : 'hsl(var(--flume-electric))',
                boxShadow: `0 0 10px ${isExactMatch 
                  ? 'hsl(var(--flume-green) / 0.5)' 
                  : timeUntilNote > 0 
                    ? 'hsl(var(--flume-orange) / 0.5)' 
                    : 'hsl(var(--flume-electric) / 0.5)'}`
              }}
            />
            
            {/* Background particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 rounded-full bg-primary"
                  style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    opacity: [0, 1, 0],
                    y: [-20, 20],
                    x: [-10, 10],
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 relative">
            <motion.p 
              className="text-sm leading-relaxed relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isExactMatch ? [1, 1.02, 1] : 1,
              }}
              transition={{ 
                delay: 0.2,
                scale: { duration: 1, repeat: isExactMatch ? Infinity : 0 }
              }}
              style={{
                textShadow: isExactMatch ? '0 0 10px hsl(var(--flume-electric) / 0.3)' : 'none'
              }}
            >
              {primaryNote.content}
            </motion.p>
            
            {/* Content background effect */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-20"
              style={{
                background: `linear-gradient(45deg, 
                  hsl(var(--flume-electric) / 0.1), 
                  hsl(var(--flume-purple) / 0.1), 
                  hsl(var(--flume-pink) / 0.1))`
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Multiple notes indicator */}
          {activeNotes.length > 1 && (
            <motion.div 
              className="px-4 py-2 border-t border-border/50 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <motion.div
                  className="w-1 h-1 rounded-full bg-secondary"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                +{activeNotes.length - 1} more note{activeNotes.length > 2 ? 's' : ''} nearby
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced animated background glow */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl blur-2xl"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--flume-electric) / 0.2) 0%, 
              hsl(var(--flume-purple) / 0.1) 50%, 
              transparent 100%)`
          }}
          animate={{ 
            scale: isExactMatch ? [1, 1.3, 1] : [1, 1.1, 1],
            opacity: isExactMatch ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            scale: { duration: isExactMatch ? 1.5 : 3, repeat: Infinity },
            opacity: { duration: isExactMatch ? 1.5 : 3, repeat: Infinity },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* Beat pulse effect */}
        {onBeat && (
          <motion.div
            className="absolute inset-0 -z-5 rounded-xl"
            style={{
              background: 'hsl(var(--flume-electric) / 0.3)',
            }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

