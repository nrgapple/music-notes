import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Edit3, Trash2, MessageSquare, Play } from 'lucide-react';
import type { Note, PlaybackState } from '@/types';
import { formatTime } from '@/utils/audio';
import { cn } from '@/utils/cn';

interface ListViewProps {
  notes: Note[];
  playbackState: PlaybackState;
  onSeek: (time: number) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  selectedNote: Note | null;
  onSelectNote: (note: Note | null) => void;
}

export function ListView({
  notes,
  playbackState,
  onSeek,
  onUpdateNote,
  onDeleteNote,
  selectedNote,
  onSelectNote
}: ListViewProps) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEditStart = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const handleEditSave = (noteId: string) => {
    if (editContent.trim()) {
      onUpdateNote(noteId, { content: editContent.trim() });
    }
    setEditingNote(null);
    setEditContent('');
  };

  const handleEditCancel = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, noteId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave(noteId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const sortedNotes = [...notes].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Notes Timeline
        </h2>
        
        <div className="text-sm text-muted-foreground">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Switch to waveform view and double-click to add notes</p>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="space-y-3">
            <AnimatePresence>
              {sortedNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
                    selectedNote?.id === note.id
                      ? "bg-primary/5 border-primary"
                      : "bg-background hover:bg-muted/20"
                  )}
                  onClick={() => onSelectNote(selectedNote?.id === note.id ? null : note)}
                >
                  <div className="flex items-start gap-3">
                    {/* Timestamp and play button */}
                    <div className="flex flex-col items-center gap-2 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(note.timestamp);
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm font-mono transition-colors focus-ring"
                      >
                        <Clock className="w-3 h-3" />
                        {formatTime(note.timestamp)}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(note.timestamp);
                        }}
                        className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors focus-ring"
                      >
                        <Play className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>

                    {/* Note content */}
                    <div className="flex-1 min-w-0">
                      {editingNote === note.id ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, note.id)}
                          onBlur={() => handleEditSave(note.id)}
                          className="w-full p-2 bg-background border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <p 
                          className="text-sm leading-relaxed cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(note);
                          }}
                        >
                          {note.content}
                        </p>
                      )}

                      {/* Note metadata */}
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>
                          Created {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString()}
                        </span>
                        
                        {note.updatedAt > note.createdAt && (
                          <span>
                            Edited {note.updatedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(note);
                        }}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this note?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-ring"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Current time indicator */}
                  {Math.abs(playbackState.currentTime - note.timestamp) < 1 && playbackState.isPlaying && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-soft"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
