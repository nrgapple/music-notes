import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Song, Note } from '@/types';

class DatabaseService {
  private db: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('vib-music-notes-db');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } else {
        this.db = new SQL.Database();
        this.createTables();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables() {
    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Songs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        duration REAL NOT NULL,
        file_data BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        project_id TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Notes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        timestamp REAL NOT NULL,
        content TEXT NOT NULL,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        song_id TEXT NOT NULL,
        FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
      )
    `);

    this.saveDatabase();
  }

  private saveDatabase() {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const dataArray = Array.from(data);
      localStorage.setItem('vib-music-notes-db', JSON.stringify(dataArray));
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  // Project operations
  async createProject(name: string, description?: string): Promise<Project> {
    await this.initialize();
    
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.db.run(
      'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [project.id, project.name, project.description || null, project.createdAt.toISOString(), project.updatedAt.toISOString()]
    );

    this.saveDatabase();
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
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      });
    }
    
    stmt.free();
    return projects;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.initialize();
    
    this.db.run('DELETE FROM projects WHERE id = ?', [projectId]);
    this.saveDatabase();
  }

  // Song operations
  async createSong(projectId: string, name: string, fileName: string, duration: number, fileData: ArrayBuffer, mimeType: string): Promise<Song> {
    await this.initialize();
    
    const song: Song = {
      id: uuidv4(),
      name,
      fileName,
      duration,
      fileData,
      mimeType,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId
    };

    const uint8Array = new Uint8Array(fileData);
    
    this.db.run(
      'INSERT INTO songs (id, name, file_name, duration, file_data, mime_type, created_at, updated_at, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [song.id, song.name, song.fileName, song.duration, uint8Array, song.mimeType, song.createdAt.toISOString(), song.updatedAt.toISOString(), song.projectId]
    );

    this.saveDatabase();
    return song;
  }

  async getSongsByProject(projectId: string): Promise<Song[]> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM songs WHERE project_id = ? ORDER BY created_at DESC');
    stmt.bind([projectId]);
    
    const songs: Song[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const fileData = new Uint8Array(row.file_data as ArrayBuffer).buffer;
      
      songs.push({
        id: row.id as string,
        name: row.name as string,
        fileName: row.file_name as string,
        duration: row.duration as number,
        fileData,
        mimeType: row.mime_type as string,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        projectId: row.project_id as string
      });
    }
    
    stmt.free();
    return songs;
  }

  async getSong(songId: string): Promise<Song | null> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM songs WHERE id = ?');
    stmt.bind([songId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const fileData = new Uint8Array(row.file_data as ArrayBuffer).buffer;
      
      const song: Song = {
        id: row.id as string,
        name: row.name as string,
        fileName: row.file_name as string,
        duration: row.duration as number,
        fileData,
        mimeType: row.mime_type as string,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        projectId: row.project_id as string
      };
      
      stmt.free();
      return song;
    }
    
    stmt.free();
    return null;
  }

  // Note operations
  async createNote(songId: string, timestamp: number, content: string, color?: string): Promise<Note> {
    await this.initialize();
    
    const note: Note = {
      id: uuidv4(),
      timestamp,
      content,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
      songId
    };

    this.db.run(
      'INSERT INTO notes (id, timestamp, content, color, created_at, updated_at, song_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [note.id, note.timestamp, note.content, note.color || null, note.createdAt.toISOString(), note.updatedAt.toISOString(), note.songId]
    );

    this.saveDatabase();
    return note;
  }

  async getNotesBySong(songId: string): Promise<Note[]> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM notes WHERE song_id = ? ORDER BY timestamp ASC');
    stmt.bind([songId]);
    
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
        songId: row.song_id as string
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

    this.saveDatabase();
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.initialize();
    
    this.db.run('DELETE FROM notes WHERE id = ?', [noteId]);
    this.saveDatabase();
  }
}

export const databaseService = new DatabaseService();

