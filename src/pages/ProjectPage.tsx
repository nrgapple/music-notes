import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { AudioPlayer } from '@/components/AudioPlayer';
import { WaveformView } from '@/components/WaveformView';
import { ListView } from '@/components/ListView';
import { NotePreview } from '@/components/NotePreview';
import { NoteModal } from '@/components/NoteModal';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { Header } from '@/components/Header';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useNoteManager } from '@/hooks/useNoteManager';
import { databaseService } from '@/services/database';
import type { AudioFile, ViewMode, Project, Note } from '@/types';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('waveform');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalTimestamp, setNoteModalTimestamp] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const {
    playbackState,
    audioElement,
    play,
    pause,
    seek,
    setVolume,
    loadAudio
  } = useAudioManager();

  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    loadNotes
  } = useNoteManager(currentProject?.id);

  // Load project when component mounts or projectId changes
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        navigate('/projects');
        return;
      }

      try {
        console.log('Loading project:', projectId);
        
        // Get project metadata
        const project = await databaseService.getProject(projectId);
        if (!project) {
          console.error('Project not found:', projectId);
          navigate('/projects');
          return;
        }

        // Load project with audio data
        const projectWithAudio = await databaseService.getProjectWithAudio(projectId);
        if (!projectWithAudio) {
          console.error('No audio data found for project:', projectId);
          navigate('/projects');
          return;
        }

        // Create audio file from stored data
        const blob = new Blob([projectWithAudio.fileData], { type: project.mimeType });
        const file = new File([blob], project.fileName, { type: project.mimeType });
        const url = URL.createObjectURL(blob);
        
        await loadAudio(url);
        const audioFileData: AudioFile = {
          file,
          url,
          name: project.fileName,
          duration: project.duration
        };

        setCurrentProject(project);
        setAudioFile(audioFileData);
        
        console.log('Project loaded successfully:', project.name);
      } catch (error) {
        console.error('Failed to load project:', error);
        navigate('/projects');
      }
    };

    loadProject();
  }, [projectId, navigate, loadAudio]);

  // Load notes when project changes
  useEffect(() => {
    if (currentProject) {
      loadNotes();
    }
  }, [currentProject, loadNotes]);

  const handleTogglePlayback = useCallback(() => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playbackState.isPlaying, play, pause]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handleAddNoteRequest = useCallback((timestamp?: number) => {
    const noteTime = timestamp !== undefined ? timestamp : playbackState.currentTime;
    setNoteModalTimestamp(noteTime);
    setShowNoteModal(true);
  }, [playbackState.currentTime]);

  const handleSaveNote = useCallback(async (content: string, color?: string) => {
    console.log('Saving note:', { content, color, timestamp: noteModalTimestamp, projectId: currentProject?.id });
    try {
      await addNote(noteModalTimestamp, content, color);
      console.log('Note saved successfully');
      setShowNoteModal(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }, [addNote, noteModalTimestamp, currentProject]);

  const handleBeatDetected = useCallback(() => {
    setBeatDetected(true);
    // Reset beat state after a short delay
    setTimeout(() => setBeatDetected(false), 100);
  }, []);

  const shortcuts = {
    togglePlayback: handleTogglePlayback,
    addNote: () => handleAddNoteRequest(),
    toggleView: () => setViewMode(prev => prev === 'waveform' ? 'list' : 'waveform'),
    showShortcuts: () => setShowShortcuts(true),
    seekBackward: () => {
      const newTime = Math.max(0, playbackState.currentTime - 5);
      handleSeek(newTime);
    },
    seekForward: () => {
      const newTime = Math.min(playbackState.duration, playbackState.currentTime + 5);
      handleSeek(newTime);
    },
  };

  useKeyboardShortcuts(shortcuts);

  const handleBackToProjects = () => {
    // Stop audio playback
    pause();
    
    // Clean up audio URLs
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }
    
    // Navigate to projects
    navigate('/projects');
  };

  // Show loading state while project loads
  if (!currentProject || !audioFile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground relative overflow-hidden">
      {/* Flume-inspired background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-flume-deep via-background to-flume-deep opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flume-electric/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flume-purple/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-flume-pink/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Background Audio Visualizer */}
        <div className="absolute inset-0 opacity-20">
          <AudioVisualizer
            audioElement={audioElement}
            isPlaying={playbackState.isPlaying}
            onBeatDetected={handleBeatDetected}
            className="h-full w-full"
          />
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <Header 
          audioFile={audioFile}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onShowShortcuts={() => setShowShortcuts(true)}
          currentProject={currentProject}
          onBackToProjects={handleBackToProjects}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'waveform' ? (
              <motion.div
                key="waveform"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <WaveformView
                  audioFile={audioFile}
                  playbackState={playbackState}
                  notes={notes}
                  onSeek={handleSeek}
                  onAddNote={handleAddNoteRequest}
                  selectedNote={selectedNote}
                  onSelectNote={setSelectedNote}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <ListView
                  notes={notes}
                  playbackState={playbackState}
                  onSeek={handleSeek}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  selectedNote={selectedNote}
                  onSelectNote={setSelectedNote}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <NotePreview
            notes={notes}
            currentTime={playbackState.currentTime}
            isPlaying={playbackState.isPlaying}
            onBeat={beatDetected}
          />
        </div>

        <AudioPlayer
          playbackState={playbackState}
          onTogglePlayback={handleTogglePlayback}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          audioFile={audioFile}
        />
      </div>

      <AnimatePresence>
        {showShortcuts && (
          <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={handleSaveNote}
        timestamp={noteModalTimestamp}
      />
    </div>
  );
}
