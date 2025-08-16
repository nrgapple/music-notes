import React, { useState, useCallback, useEffect } from 'react';
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
import type { AudioFile, ViewMode, Project, Song } from '@/types';

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSong, setSCurrentSong] = useState<Song | null>(null);
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
  } = useNoteManager(currentSong?.id);

  // Load notes when song changes
  useEffect(() => {
    if (currentSong) {
      loadNotes();
    }
  }, [currentSong, loadNotes]);

  const handleProjectSelect = useCallback(async (project: Project, song?: Song) => {
    setCurrentProject(project);
    
    if (song) {
      setSCurrentSong(song);
      
      // Create audio file from stored data
      const blob = new Blob([song.fileData], { type: song.mimeType });
      const file = new File([blob], song.fileName, { type: song.mimeType });
      const url = URL.createObjectURL(blob);
      
      try {
        await loadAudio(url);
        const audioFileData: AudioFile = {
          file,
          url,
          duration: song.duration,
          name: song.name
        };
        setAudioFile(audioFileData);
      } catch (error) {
        console.error('Error loading audio file:', error);
        URL.revokeObjectURL(url);
      }
    } else {
      setSCurrentSong(null);
      setAudioFile(null);
    }
  }, [loadAudio]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentProject) return;

    try {
      const duration = await getAudioDuration(file);
      const fileData = await file.arrayBuffer();
      
      // Save song to database
      const song = await databaseService.createSong(
        currentProject.id,
        file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display name
        file.name,
        duration,
        fileData,
        file.type
      );

      setSCurrentSong(song);

      // Create audio file for playback
      const url = URL.createObjectURL(file);
      await loadAudio(url);
      
      const audioFileData: AudioFile = {
        file,
        url,
        duration,
        name: song.name
      };
      setAudioFile(audioFileData);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [currentProject, loadAudio]);

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
    if (!audioFile || !currentSong) return;
    
    const noteTime = timestamp ?? playbackState.currentTime;
    setNoteModalTimestamp(noteTime);
    setShowNoteModal(true);
  }, [audioFile, currentSong, playbackState.currentTime]);

  const handleSaveNote = useCallback(async (content: string, color?: string) => {
    await addNote(noteModalTimestamp, content, color);
    setShowNoteModal(false);
  }, [addNote, noteModalTimestamp]);

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
          setCurrentProject(null);
          setSCurrentSong(null);
          setAudioFile(null);
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