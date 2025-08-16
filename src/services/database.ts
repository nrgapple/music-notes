import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBService } from './indexeddb';
import type { Project, ProjectWithAudio, Note } from '@/types';

class DatabaseService {
  private db: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize IndexedDB first
      await indexedDBService.initialize();

      const SQL = await initSqlJs({
        locateFile: () => `/sql-wasm.wasm`
      });

      // Try to load existing database from IndexedDB
      const savedData = await indexedDBService.loadDatabaseData();
      if (savedData) {
        try {
          this.db = new SQL.Database(savedData);
          console.log('Loaded existing database from IndexedDB');
          // Ensure tables exist (for schema updates)
          this.createTables();
        } catch (error) {
          console.warn('Failed to load saved database, creating new one:', error);
          this.db = new SQL.Database();
          this.createTables();
        }
      } else {
        console.log('Creating new database');
        this.db = new SQL.Database();
        this.createTables();
      }

      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables() {
    console.log('Creating/ensuring database tables exist...');
    
    // Projects table (now includes song data)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        file_name TEXT NOT NULL,
        duration REAL NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Notes table (now linked directly to projects)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        timestamp REAL NOT NULL,
        content TEXT NOT NULL,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        project_id TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created/verified successfully');
  }

  private async saveDatabase() {
    if (!this.db) {
      console.warn('Database not initialized, cannot save');
      return;
    }
    
    try {
      const data = this.db.export();
      await indexedDBService.saveDatabaseData(data);
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  // Project operations
  async createProject(name: string, fileName: string, duration: number, fileData: ArrayBuffer, mimeType: string, description?: string): Promise<Project> {
    await this.initialize();
    
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      fileName,
      duration,
      mimeType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store project metadata in SQLite
    this.db.run(
      'INSERT INTO projects (id, name, description, file_name, duration, mime_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [project.id, project.name, project.description || null, project.fileName, project.duration, project.mimeType, project.createdAt.toISOString(), project.updatedAt.toISOString()]
    );

    // Store audio file data in IndexedDB
    await indexedDBService.saveAudioFile(project.id, fileData, fileName, mimeType);

    await this.saveDatabase();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
    const projects: Project[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      projects.push({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string || undefined,
        fileName: row.file_name as string,
        duration: row.duration as number,
        mimeType: row.mime_type as string,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      });
    }
    
    stmt.free();
    return projects;
  }

  async getProject(projectId: string): Promise<Project | null> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    stmt.bind([projectId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      
      const project: Project = {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string || undefined,
        fileName: row.file_name as string,
        duration: row.duration as number,
        mimeType: row.mime_type as string,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      };
      
      stmt.free();
      return project;
    }
    
    stmt.free();
    return null;
  }

  // Get project with audio data
  async getProjectWithAudio(projectId: string): Promise<ProjectWithAudio | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const audioFile = await indexedDBService.loadAudioFile(projectId);
    if (!audioFile) return null;

    return {
      ...project,
      fileData: audioFile.data
    };
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.initialize();
    
    // Delete audio file from IndexedDB
    await indexedDBService.deleteAudioFile(projectId);
    
    // Delete project from SQLite (notes will be deleted via CASCADE)
    this.db.run('DELETE FROM projects WHERE id = ?', [projectId]);
    await this.saveDatabase();
  }

  // Note operations
  async createNote(projectId: string, timestamp: number, content: string, color?: string): Promise<Note> {
    await this.initialize();
    
    const note: Note = {
      id: uuidv4(),
      timestamp,
      content,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId
    };

    this.db.run(
      'INSERT INTO notes (id, timestamp, content, color, created_at, updated_at, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [note.id, note.timestamp, note.content, note.color || null, note.createdAt.toISOString(), note.updatedAt.toISOString(), note.projectId]
    );

    await this.saveDatabase();
    return note;
  }

  async getNotesByProject(projectId: string): Promise<Note[]> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM notes WHERE project_id = ? ORDER BY timestamp ASC');
    stmt.bind([projectId]);
    
    const notes: Note[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      notes.push({
        id: row.id as string,
        timestamp: row.timestamp as number,
        content: row.content as string,
        color: row.color as string || undefined,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        projectId: row.project_id as string
      });
    }
    
    stmt.free();
    return notes;
  }

  async updateNote(noteId: string, updates: Partial<Pick<Note, 'content' | 'color' | 'timestamp'>>): Promise<void> {
    await this.initialize();
    
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (updates.content !== undefined) {
      setParts.push('content = ?');
      values.push(updates.content);
    }
    
    if (updates.color !== undefined) {
      setParts.push('color = ?');
      values.push(updates.color);
    }
    
    if (updates.timestamp !== undefined) {
      setParts.push('timestamp = ?');
      values.push(updates.timestamp);
    }
    
    if (setParts.length === 0) return;
    
    setParts.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(noteId);
    
    this.db.run(
      `UPDATE notes SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );

    await this.saveDatabase();
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.initialize();
    
    this.db.run('DELETE FROM notes WHERE id = ?', [noteId]);
    await this.saveDatabase();
  }
}

export const databaseService = new DatabaseService();

