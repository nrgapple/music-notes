import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, Music, Calendar, Upload } from 'lucide-react';
import { databaseService } from '@/services/database';
import type { Project } from '@/types';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/audio';

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
}

export function ProjectSelector({ onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await databaseService.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this project and all its notes? This cannot be undone.')) return;

    try {
      await databaseService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    setIsCreatingProject(true);
    try {
      // Get audio duration
      const duration = await new Promise<number>((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
          URL.revokeObjectURL(audio.src);
        });
        audio.addEventListener('error', reject);
        audio.src = URL.createObjectURL(file);
      });

      const fileData = await file.arrayBuffer();
      const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

      // Create project with audio file
      const project = await databaseService.createProject(
        projectName,
        file.name,
        duration,
        fileData,
        file.type
      );

      setProjects(prev => [project, ...prev]);
      setShowNewProjectModal(false);
      
      // Automatically select the new project
      onProjectSelect(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Music className="w-8 h-8 text-primary" />
              Vib Music Notes
            </h1>
            <p className="text-muted-foreground mt-2">Select a project or create a new one by uploading a song</p>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-ring"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first song to create a project and start taking notes</p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-ring"
            >
              <Upload className="w-4 h-4" />
              Upload Song
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => onProjectSelect(project)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all focus-ring"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="w-3 h-3" />
                      <span className="truncate">{project.fileName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.createdAt.toLocaleDateString()}
                      </div>
                      <span className="font-mono">
                        {formatTime(project.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Action hint */}
                  <div className="text-xs text-muted-foreground text-center py-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to open project
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isCreatingProject && setShowNewProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create New Project</h2>
                  <p className="text-sm text-muted-foreground">Upload a song to create a new project</p>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                    isCreatingProject
                      ? "border-muted-foreground/25 bg-muted/20"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  )}
                  onClick={() => !isCreatingProject && document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    disabled={isCreatingProject}
                  />

                  {isCreatingProject ? (
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">Creating project...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Choose an audio file</p>
                        <p className="text-sm text-muted-foreground">MP3, WAV, OGG, M4A supported</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isCreatingProject && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowNewProjectModal(false)}
                    className="flex-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors focus-ring"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}