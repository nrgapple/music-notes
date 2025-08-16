import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectSelector } from '@/components/ProjectSelector';
import { FileUpload } from '@/components/FileUpload';
import { AudioPlayer } from '@/components/AudioPlayer';
import { WaveformView } from '@/components/WaveformView';
import { ListView } from '@/components/ListView';
import { NotePreview } from '@/components/NotePreview';
import { NoteModal } from '@/components/NoteModal';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { Header } from '@/components/Header';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useNoteManager } from '@/hooks/useNoteManager';
import { databaseService } from '@/services/database';
import { getAudioDuration } from '@/utils/audio';
import '@/utils/database-debug'; // Import debug utilities for console access
import type { AudioFile, ViewMode, Project } from '@/types';

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('waveform');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalTimestamp, setNoteModalTimestamp] = useState(0);

  const {
    playbackState,
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
    selectedNote,
    setSelectedNote,
    loadNotes
  } = useNoteManager(currentProject?.id);

  // Load notes when project changes
  useEffect(() => {
    if (currentProject) {
      loadNotes();
    }
  }, [currentProject, loadNotes]);

  const handleProjectSelect = useCallback(async (project: Project) => {
    console.log('Selecting project:', project.name);
    setCurrentProject(project);
    
    try {
      // Load audio data from IndexedDB
      const projectWithAudio = await databaseService.getProjectWithAudio(project.id);
      if (!projectWithAudio) {
        console.error('No audio data found for project:', project.id);
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
        duration: project.duration,
        name: project.name
      };
      setAudioFile(audioFileData);
      console.log('Audio file loaded successfully');
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  }, [loadAudio]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const duration = await getAudioDuration(file);
      const fileData = await file.arrayBuffer();
      
      // Create project with audio file
      const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension for display name
      const project = await databaseService.createProject(
        projectName,
        file.name,
        duration,
        fileData,
        file.type
      );

      setCurrentProject(project);

      // Create audio file for playback
      const url = URL.createObjectURL(file);
      await loadAudio(url);
      
      const audioFileData: AudioFile = {
        file,
        url,
        duration,
        name: project.name
      };
      setAudioFile(audioFileData);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [loadAudio]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handleTogglePlayback = useCallback(() => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playbackState.isPlaying, play, pause]);

  const handleAddNoteRequest = useCallback((timestamp?: number) => {
    if (!audioFile || !currentProject) return;
    
    const noteTime = timestamp ?? playbackState.currentTime;
    setNoteModalTimestamp(noteTime);
    setShowNoteModal(true);
  }, [audioFile, currentProject, playbackState.currentTime]);

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

  // Show project selector if no project is selected
  if (!currentProject) {
    return <ProjectSelector onProjectSelect={handleProjectSelect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header 
        audioFile={audioFile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onShowShortcuts={() => setShowShortcuts(true)}
        currentProject={currentProject}
        onBackToProjects={() => {
          // Stop audio playback
          pause();
          
          // Clean up audio URLs
          if (audioFile?.url) {
            URL.revokeObjectURL(audioFile.url);
          }
          
          // Reset state
          setCurrentProject(null);
          setAudioFile(null);
          setSelectedNote(null);
          console.log('Navigated back to projects, cleaned up audio');
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!audioFile ? (
          <div className="flex-1 flex items-center justify-center">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <>
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {viewMode === 'waveform' ? (
                  <motion.div
                    key="waveform"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
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
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
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
              />
            </div>

            <AudioPlayer
              playbackState={playbackState}
              onTogglePlayback={handleTogglePlayback}
              onSeek={handleSeek}
              onVolumeChange={setVolume}
              audioFile={audioFile}
            />
          </>
        )}
      </main>

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

export default App;