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
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [floatingPositions, setFloatingPositions] = useState<Map<string, {x: number, y: number}>>(new Map());

  const activeNotes = useMemo(() => {
    if (!isPlaying) return [];
    
    // Show notes that are within 2 seconds of current time (reduced from 3 for less flicker)
    const tolerance = 2;
    return notes.filter(note => 
      Math.abs(note.timestamp - currentTime) <= tolerance
    ).sort((a, b) => Math.abs(a.timestamp - currentTime) - Math.abs(b.timestamp - currentTime));
  }, [notes, currentTime, isPlaying]);

  // Generate floating positions for active notes
  useEffect(() => {
    const newPositions = new Map();
    
    activeNotes.forEach((note, index) => {
      const existing = floatingPositions.get(note.id);
      
      if (!existing) {
        // Generate initial position - spread notes around the screen
        const angle = (index * 137.5) % 360; // Golden angle for natural distribution
        const radius = 20 + (index % 3) * 15; // Vary distance from center
        const centerX = 50; // Center of viewport
        const centerY = 50;
        
        const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
        const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
        
        newPositions.set(note.id, {
          x: Math.max(10, Math.min(90, x)), // Keep within viewport bounds
          y: Math.max(15, Math.min(85, y))
        });
      } else {
        newPositions.set(note.id, existing);
      }
    });
    
    setFloatingPositions(newPositions);
  }, [activeNotes.map(n => n.id).join(',')]); // Only update when notes change

  // Gentle drift animation for positions
  useEffect(() => {
    if (activeNotes.length === 0) return;
    
    const interval = setInterval(() => {
      setFloatingPositions(prev => {
        const updated = new Map();
        
        activeNotes.forEach(note => {
          const existing = prev.get(note.id);
          if (existing) {
            // Gentle drift
            const driftX = (Math.random() - 0.5) * 3;
            const driftY = (Math.random() - 0.5) * 3;
            
            updated.set(note.id, {
              x: Math.max(10, Math.min(90, existing.x + driftX)),
              y: Math.max(15, Math.min(85, existing.y + driftY))
            });
          }
        });
        
        return updated;
      });
    }, 3000); // Update every 3 seconds for smooth drift
    
    return () => clearInterval(interval);
  }, [activeNotes.length]);

  // Beat effect with intensity flicker
  useEffect(() => {
    if (onBeat) {
      // Set high intensity for beat flicker
      setBeatIntensity(1);
      
      // Create fewer particles on beat for less distraction
      const newParticles = Array.from({length: 2}, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      
      setParticles(prev => [...prev, ...newParticles]);
      
      // Fade out beat intensity over time
      const fadeOut = setInterval(() => {
        setBeatIntensity(prev => {
          const newIntensity = Math.max(0, prev - 0.1);
          if (newIntensity <= 0) {
            clearInterval(fadeOut);
          }
          return newIntensity;
        });
      }, 50);
      
      // Remove particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 2000);
    }
  }, [onBeat]);

  if (!isPlaying || activeNotes.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {activeNotes.map((note, index) => {
        const position = floatingPositions.get(note.id) || { x: 50, y: 50 };
        const isExactMatch = Math.abs(note.timestamp - currentTime) < 0.5;
        const timeUntilNote = note.timestamp - currentTime;
        const isPrimary = index === 0;
        
        return (
          <motion.div
            key={note.id}
            initial={{ 
              opacity: 0, 
              scale: 0.3,
              rotateX: -90,
            }}
            animate={{ 
              opacity: isPrimary ? 0.95 : 0.75, 
              scale: isExactMatch ? (isPrimary ? 1.05 : 0.9) : (isPrimary ? 1 : 0.8),
              rotateX: 0,
              x: onBeat ? [0, 5, -5, 0] : 0,
              y: onBeat ? [0, -3, 3, 0] : 0,
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.3,
              rotateX: 90,
            }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.8,
              x: {
                duration: onBeat ? 0.4 : 2,
                ease: "easeInOut",
                repeat: onBeat ? 0 : Infinity,
                repeatType: "reverse"
              },
              y: {
                duration: onBeat ? 0.4 : 2.5,
                ease: "easeInOut", 
                repeat: onBeat ? 0 : Infinity,
                repeatType: "reverse"
              }
            }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: `drop-shadow(0 0 ${isExactMatch ? '25px' : '12px'} hsl(var(--flume-electric) / ${0.3 + beatIntensity * 0.5})) brightness(${1 + beatIntensity * 0.3})`,
            }}
          >
            <div 
              className={`glass rounded-xl shadow-2xl overflow-hidden ${isPrimary ? 'max-w-md' : 'max-w-xs'}`}
              style={{
                borderColor: `hsl(var(--flume-electric) / ${0.3 + beatIntensity * 0.7})`,
                background: `linear-gradient(135deg, 
                  hsl(var(--background) / ${0.8 + beatIntensity * 0.2}), 
                  hsl(var(--muted) / ${0.3 + beatIntensity * 0.4}))`
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50 relative">
                <motion.div 
                  className={`${isPrimary ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}
                  animate={{
                    scale: isExactMatch ? [1, 1.1, 1] : 1,
                    rotate: onBeat ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    scale: { duration: 1, repeat: isExactMatch ? Infinity : 0, ease: "easeInOut" },
                    rotate: { duration: 0.4, ease: "easeOut" }
                  }}
                >
                  {isExactMatch ? (
                    <Zap className={`${isPrimary ? 'w-4 h-4' : 'w-3 h-3'} text-primary`} />
                  ) : (
                    <MessageSquare className={`${isPrimary ? 'w-4 h-4' : 'w-3 h-3'} text-primary`} />
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-primary">Note</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-mono text-muted-foreground truncate">
                      {formatTime(note.timestamp)}
                    </span>
                  </div>
                  
                  {!isExactMatch && isPrimary && (
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
                  className={`${isPrimary ? 'w-3 h-3' : 'w-2 h-2'} rounded-full relative`}
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
                    boxShadow: `0 0 ${10 + beatIntensity * 20}px ${isExactMatch 
                      ? `hsl(var(--flume-green) / ${0.5 + beatIntensity * 0.5})` 
                      : timeUntilNote > 0 
                        ? `hsl(var(--flume-orange) / ${0.5 + beatIntensity * 0.5})` 
                        : `hsl(var(--flume-electric) / ${0.5 + beatIntensity * 0.5})`}`,
                    filter: `brightness(${1 + beatIntensity * 0.5})`
                  }}
                />
                
                {/* Background particles */}
                {isPrimary && (
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
                )}
              </div>

              {/* Content */}
              <div className={`px-3 py-2 relative ${isPrimary ? 'px-4 py-3' : ''}`}>
                <motion.p 
                  className={`${isPrimary ? 'text-sm' : 'text-xs'} leading-relaxed relative z-10`}
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
                    textShadow: isExactMatch 
                      ? `0 0 ${10 + beatIntensity * 15}px hsl(var(--flume-electric) / ${0.3 + beatIntensity * 0.5})` 
                      : `0 0 ${beatIntensity * 8}px hsl(var(--flume-electric) / ${beatIntensity * 0.4})`,
                    color: `hsl(var(--foreground) / ${0.9 + beatIntensity * 0.1})`,
                    ...(!isPrimary && {
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden'
                    })
                  }}
                >
                  {note.content}
                </motion.p>
                
                {/* Content background effect */}
                {isPrimary && (
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
                )}
              </div>

              {/* Multiple notes indicator - only show on primary note */}
              {activeNotes.length > 1 && isPrimary && (
                <motion.div 
                  className="px-3 py-2 border-t border-border/50 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
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
        );
      })}
    </AnimatePresence>
  );
}

