export interface Note {
  id: string;
  timestamp: number; // in seconds
  content: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  songId: string;
}

export interface Song {
  id: string;
  name: string;
  fileName: string;
  duration: number;
  fileData: ArrayBuffer; // Store the actual file data
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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
  currentSong: Song | null;
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
