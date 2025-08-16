/**
 * IndexedDB service for storing SQLite database and audio files
 */

const DB_NAME = 'VibMusicNotesDB';
const DB_VERSION = 1;
const STORES = {
  DATABASE: 'database',
  AUDIO_FILES: 'audioFiles',
} as const;

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create database store for SQLite data
        if (!db.objectStoreNames.contains(STORES.DATABASE)) {
          db.createObjectStore(STORES.DATABASE, { keyPath: 'id' });
          console.log('Created database object store');
        }

        // Create audio files store for binary audio data
        if (!db.objectStoreNames.contains(STORES.AUDIO_FILES)) {
          const audioStore = db.createObjectStore(STORES.AUDIO_FILES, { keyPath: 'id' });
          audioStore.createIndex('songId', 'songId', { unique: true });
          console.log('Created audio files object store');
        }
      };
    });
  }

  async saveDatabaseData(data: Uint8Array): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DATABASE], 'readwrite');
      const store = transaction.objectStore(STORES.DATABASE);
      
      const request = store.put({
        id: 'sqlite-database',
        data: data,
        updatedAt: new Date().toISOString(),
      });

      request.onerror = () => {
        console.error('Failed to save database data:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Database data saved to IndexedDB, size:', data.length, 'bytes');
        resolve();
      };
    });
  }

  async loadDatabaseData(): Promise<Uint8Array | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DATABASE], 'readonly');
      const store = transaction.objectStore(STORES.DATABASE);
      
      const request = store.get('sqlite-database');

      request.onerror = () => {
        console.error('Failed to load database data:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          console.log('Loaded database data from IndexedDB, size:', result.data.length, 'bytes');
          resolve(new Uint8Array(result.data));
        } else {
          console.log('No database data found in IndexedDB');
          resolve(null);
        }
      };
    });
  }

  async saveAudioFile(songId: string, audioData: ArrayBuffer, fileName: string, mimeType: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.AUDIO_FILES], 'readwrite');
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      
      const request = store.put({
        id: songId,
        songId: songId,
        data: audioData,
        fileName: fileName,
        mimeType: mimeType,
        savedAt: new Date().toISOString(),
      });

      request.onerror = () => {
        console.error('Failed to save audio file:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Audio file saved to IndexedDB:', fileName, 'size:', audioData.byteLength, 'bytes');
        resolve();
      };
    });
  }

  async loadAudioFile(songId: string): Promise<{ data: ArrayBuffer; fileName: string; mimeType: string } | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.AUDIO_FILES], 'readonly');
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      
      const request = store.get(songId);

      request.onerror = () => {
        console.error('Failed to load audio file:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          console.log('Loaded audio file from IndexedDB:', result.fileName);
          resolve({
            data: result.data,
            fileName: result.fileName,
            mimeType: result.mimeType,
          });
        } else {
          console.log('No audio file found for song:', songId);
          resolve(null);
        }
      };
    });
  }

  async deleteAudioFile(songId: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.AUDIO_FILES], 'readwrite');
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      
      const request = store.delete(songId);

      request.onerror = () => {
        console.error('Failed to delete audio file:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Audio file deleted from IndexedDB for song:', songId);
        resolve();
      };
    });
  }

  async getStorageEstimate(): Promise<{ quota?: number; usage?: number; usageDetails?: any }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      console.log('Storage estimate:', estimate);
      return estimate;
    }
    return {};
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DATABASE, STORES.AUDIO_FILES], 'readwrite');
      
      transaction.objectStore(STORES.DATABASE).clear();
      transaction.objectStore(STORES.AUDIO_FILES).clear();

      transaction.onerror = () => {
        console.error('Failed to clear IndexedDB:', transaction.error);
        reject(transaction.error);
      };

      transaction.oncomplete = () => {
        console.log('IndexedDB cleared successfully');
        resolve();
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
