import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import type { Note } from '@/types';
import { formatTime } from '@/utils/audio';

interface NotePreviewProps {
  notes: Note[];
  currentTime: number;
  isPlaying: boolean;
}

export function NotePreview({ notes, currentTime, isPlaying }: NotePreviewProps) {
  const activeNotes = useMemo(() => {
    if (!isPlaying) return [];
    
    // Show notes that are within 2 seconds of current time
    const tolerance = 2;
    return notes.filter(note => 
      Math.abs(note.timestamp - currentTime) <= tolerance
    ).sort((a, b) => Math.abs(a.timestamp - currentTime) - Math.abs(b.timestamp - currentTime));
  }, [notes, currentTime, isPlaying]);

  const primaryNote = activeNotes[0];

  if (!isPlaying || !primaryNote) {
    return null;
  }

  const isExactMatch = Math.abs(primaryNote.timestamp - currentTime) < 0.5;
  const timeUntilNote = primaryNote.timestamp - currentTime;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={primaryNote.id}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: 0.4 
        }}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Note</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono text-muted-foreground">
                  {formatTime(primaryNote.timestamp)}
                </span>
              </div>
              
              {!isExactMatch && (
                <div className="text-xs text-muted-foreground mt-1">
                  {timeUntilNote > 0 
                    ? `Coming up in ${Math.abs(timeUntilNote).toFixed(1)}s`
                    : `${Math.abs(timeUntilNote).toFixed(1)}s ago`
                  }
                </div>
              )}
            </div>

            {/* Timing indicator */}
            <div className={`w-2 h-2 rounded-full ${
              isExactMatch 
                ? 'bg-green-500 animate-pulse' 
                : timeUntilNote > 0 
                  ? 'bg-yellow-500' 
                  : 'bg-blue-500'
            }`} />
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <motion.p 
              className="text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {primaryNote.content}
            </motion.p>
          </div>

          {/* Multiple notes indicator */}
          {activeNotes.length > 1 && (
            <div className="px-4 py-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                +{activeNotes.length - 1} more note{activeNotes.length > 2 ? 's' : ''} nearby
              </div>
            </div>
          )}
        </div>

        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl"
          animate={{ 
            scale: isExactMatch ? [1, 1.1, 1] : 1,
            opacity: isExactMatch ? [0.5, 0.8, 0.5] : 0.3
          }}
          transition={{ 
            duration: isExactMatch ? 2 : 0,
            repeat: isExactMatch ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
