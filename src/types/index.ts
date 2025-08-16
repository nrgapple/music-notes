export interface Note {
  id: string;
  timestamp: number; // in seconds
  content: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string; // Now linked directly to project
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  // Song properties are now part of the project
  fileName: string;
  duration: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithAudio extends Project {
  fileData: ArrayBuffer; // Only when we need the audio data
}

export interface AudioFile {
  file: File;
  url: string;
  duration: number;
  name: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export type ViewMode = 'waveform' | 'list';

export interface AppState {
  currentProject: Project | null;
  audioFile: AudioFile | null;
  notes: Note[];
  playbackState: PlaybackState;
  viewMode: ViewMode;
  selectedNote: Note | null;
}

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
}
