import { useState, useCallback } from 'react';
import { databaseService } from '@/services/database';
import type { Note } from '@/types';

export function useNoteManager(projectId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const loadNotes = useCallback(async () => {
    if (!projectId) {
      console.log('No projectId provided, skipping note loading');
      return;
    }
    
    try {
      console.log('Loading notes for project:', projectId);
      const projectNotes = await databaseService.getNotesByProject(projectId);
      console.log('Loaded notes:', projectNotes.length);
      setNotes(projectNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [projectId]);

  const addNote = useCallback(async (timestamp: number, content: string, color?: string) => {
    if (!projectId) {
      console.error('Cannot add note: no projectId provided');
      return;
    }

    try {
      console.log('Creating note:', { projectId, timestamp, content, color });
      const newNote = await databaseService.createNote(projectId, timestamp, content, color);
      console.log('Note created:', newNote);
      setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
      setSelectedNote(newNote);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  }, [projectId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Pick<Note, 'content' | 'color' | 'timestamp'>>) => {
    try {
      await databaseService.updateNote(id, updates);
      
      setNotes(prev => 
        prev.map(note => 
          note.id === id 
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      );

      if (selectedNote?.id === id) {
        setSelectedNote(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [selectedNote]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await databaseService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [selectedNote]);

  const getNotesAtTime = useCallback((time: number, tolerance: number = 0.5): Note[] => {
    return notes.filter(note => 
      Math.abs(note.timestamp - time) <= tolerance
    );
  }, [notes]);

  const getNotesByTimeRange = useCallback((startTime: number, endTime: number): Note[] => {
    return notes.filter(note => 
      note.timestamp >= startTime && note.timestamp <= endTime
    );
  }, [notes]);

  return {
    notes,
    selectedNote,
    setSelectedNote,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    getNotesAtTime,
    getNotesByTimeRange,
  };
}
