import JSZip from 'jszip';
import { databaseService } from './database';
import type { Project, Note } from '@/types';

export interface ExportedProject {
  project: Project;
  notes: Note[];
  audioFileName: string;
  audioMimeType: string;
  exportedAt: string;
  version: '1.0';
}

class ProjectExportService {
  /**
   * Export a project as a .mnz file
   */
  async exportProject(projectId: string): Promise<void> {
    try {
      console.log('Starting project export for:', projectId);
      
      // Get project with audio data
      const projectWithAudio = await databaseService.getProjectWithAudio(projectId);
      if (!projectWithAudio) {
        throw new Error('Project not found');
      }

      // Get all notes for the project
      const notes = await databaseService.getNotesByProject(projectId);
      console.log('Exporting', notes.length, 'notes for project:', projectId);

      // Create the export data structure
      const exportData: ExportedProject = {
        project: {
          id: projectWithAudio.id,
          name: projectWithAudio.name,
          description: projectWithAudio.description,
          fileName: projectWithAudio.fileName,
          duration: projectWithAudio.duration,
          mimeType: projectWithAudio.mimeType,
          createdAt: projectWithAudio.createdAt,
          updatedAt: projectWithAudio.updatedAt,
        },
        notes,
        audioFileName: projectWithAudio.fileName,
        audioMimeType: projectWithAudio.mimeType,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      // Create zip file
      const zip = new JSZip();
      
      // Add project metadata
      zip.file('project.json', JSON.stringify(exportData, null, 2));
      
      // Add audio file
      zip.file(`audio/${projectWithAudio.fileName}`, projectWithAudio.fileData);
      
      // Add README for humans
      const readme = this.generateReadme(exportData);
      zip.file('README.txt', readme);

      // Generate zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Create download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectWithAudio.name.replace(/[^a-z0-9]/gi, '_')}.mnz`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);
      
      console.log('Project exported successfully');
    } catch (error) {
      console.error('Failed to export project:', error);
      throw error;
    }
  }

  /**
   * Import a project from a .mnz file
   */
  async importProject(file: File): Promise<Project> {
    try {
      console.log('Starting project import from:', file.name);
      
      if (!file.name.endsWith('.mnz')) {
        throw new Error('Invalid file format. Please select a .mnz file.');
      }

      // Read the zip file
      const zip = await JSZip.loadAsync(file);
      
      // Get project metadata
      const projectFile = zip.file('project.json');
      if (!projectFile) {
        throw new Error('Invalid .mnz file: missing project.json');
      }

      const projectDataText = await projectFile.async('text');
      const exportData: ExportedProject = JSON.parse(projectDataText);
      
      // Validate structure
      if (!exportData.project || exportData.notes === undefined || !exportData.audioFileName) {
        throw new Error('Invalid .mnz file: missing required data');
      }

      console.log('Found', exportData.notes.length, 'notes in export file');

      // Get audio file
      const audioFile = zip.file(`audio/${exportData.audioFileName}`);
      if (!audioFile) {
        throw new Error('Invalid .mnz file: missing audio file');
      }

      const audioArrayBuffer = await audioFile.async('arraybuffer');

      // Create project in database (this will generate a new ID automatically)
      const newProject = await databaseService.createProject(
        `${exportData.project.name} (Imported)`,
        exportData.project.fileName,
        exportData.project.duration,
        audioArrayBuffer,
        exportData.project.mimeType
      );

      console.log('Created new project with ID:', newProject.id);

      // Import notes with the actual new project ID
      console.log('Importing', exportData.notes.length, 'notes...');
      for (let i = 0; i < exportData.notes.length; i++) {
        const note = exportData.notes[i];
        try {
          console.log(`Creating note ${i + 1}/${exportData.notes.length}:`, note.content.substring(0, 50), 'at', note.timestamp);
          const createdNote = await databaseService.createNote(
            newProject.id,
            note.timestamp,
            note.content,
            note.color
          );
          console.log('Successfully created note with ID:', createdNote.id);
        } catch (error) {
          console.error(`Failed to create note ${i + 1}:`, error);
          throw error;
        }
      }

      console.log('Project imported successfully:', newProject.id);
      return newProject;
    } catch (error) {
      console.error('Failed to import project:', error);
      throw error;
    }
  }

  /**
   * Generate a human-readable README for the export
   */
  private generateReadme(exportData: ExportedProject): string {
    return `Music Notes Project Export (.mnz)
=========================================

Project: ${exportData.project.name}
${exportData.project.description ? `Description: ${exportData.project.description}` : ''}
Audio File: ${exportData.audioFileName}
Duration: ${Math.floor(exportData.project.duration / 60)}:${Math.floor(exportData.project.duration % 60).toString().padStart(2, '0')}
Notes: ${exportData.notes.length} note(s)
Created: ${new Date(exportData.project.createdAt).toLocaleDateString()}
Exported: ${new Date(exportData.exportedAt).toLocaleDateString()}

This is a Music Notes project file (.mnz). 
To import this project:
1. Open Music Notes app (https://music-notes.vercel.app)
2. Click "Import Project" 
3. Select this .mnz file

Contents:
- project.json: Project metadata and notes
- audio/: Original audio file
- README.txt: This file

Music Notes - Express your music through words
https://music-notes.vercel.app
`;
  }

  /**
   * Validate .mnz file structure without importing
   */
  async validateMnzFile(file: File): Promise<{ valid: boolean; error?: string; projectName?: string }> {
    try {
      if (!file.name.endsWith('.mnz')) {
        return { valid: false, error: 'File must have .mnz extension' };
      }

      const zip = await JSZip.loadAsync(file);
      const projectFile = zip.file('project.json');
      
      if (!projectFile) {
        return { valid: false, error: 'Missing project.json file' };
      }

      const projectDataText = await projectFile.async('text');
      const exportData: ExportedProject = JSON.parse(projectDataText);
      
      if (!exportData.project?.name) {
        return { valid: false, error: 'Invalid project data' };
      }

      if (exportData.notes === undefined) {
        return { valid: false, error: 'Missing notes data' };
      }

      const audioFile = zip.file(`audio/${exportData.audioFileName}`);
      if (!audioFile) {
        return { valid: false, error: 'Missing audio file' };
      }

      return { 
        valid: true, 
        projectName: exportData.project.name 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const projectExportService = new ProjectExportService();
