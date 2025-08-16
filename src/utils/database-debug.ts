import { databaseService } from '@/services/database';
import { indexedDBService } from '@/services/indexeddb';

/**
 * Debug utilities for database operations
 */

export const dbDebug = {
  // Get storage usage info
  async getStorageInfo() {
    const estimate = await indexedDBService.getStorageEstimate();
    console.log('Storage Estimate:', {
      quota: estimate.quota ? `${(estimate.quota / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      usage: estimate.usage ? `${(estimate.usage / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      usageDetails: estimate.usageDetails
    });
    return estimate;
  },

  // List all projects with note counts
  async listProjects() {
    try {
      const projects = await databaseService.getProjects();
      console.log('Projects:', projects.length);
      
      for (const project of projects) {
        const notes = await databaseService.getNotesByProject(project.id);
        console.log(`- ${project.name} (${project.fileName}): ${notes.length} notes, ${Math.round(project.duration)}s`);
      }
      
      return projects;
    } catch (error) {
      console.error('Error listing projects:', error);
      return [];
    }
  },

  // Clear all data (for testing)
  async clearAllData() {
    try {
      await indexedDBService.clearAllData();
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },

  // Test database connectivity
  async testConnection() {
    try {
      await databaseService.initialize();
      const projects = await databaseService.getProjects();
      console.log('Database connection successful. Projects:', projects.length);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
};

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).dbDebug = dbDebug;
}
