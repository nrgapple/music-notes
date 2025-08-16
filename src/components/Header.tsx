
import { motion } from 'framer-motion';
import { Music, Waves, List, Keyboard, ArrowLeft, Folder } from 'lucide-react';
import type { AudioFile, ViewMode, Project } from '@/types';
import { cn } from '@/utils/cn';

interface HeaderProps {
  audioFile: AudioFile | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onShowShortcuts: () => void;
  currentProject?: Project | null;
  onBackToProjects?: () => void;
}

export function Header({ audioFile, viewMode, onViewModeChange, onShowShortcuts, currentProject, onBackToProjects }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {currentProject && onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Music className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Vib Music Notes</h1>
          </div>
          
          {currentProject && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Folder className="w-4 h-4" />
              {currentProject.name}
            </motion.div>
          )}
          
          {audioFile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-muted-foreground"
            >
              • {audioFile.name}
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {audioFile && (
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('waveform')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'waveform'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Waves className="w-4 h-4" />
                Waveform
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'list'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          )}

          <button
            onClick={onShowShortcuts}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            Shortcuts
          </button>
        </div>
      </div>
    </header>
  );
}
