// Utility for managing custom audio uploads via IndexedDB and Object URLs
const DB_NAME = 'PomodoroAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'customAudio';
const KEY = 'currentTrack';

export interface StoredAudioMeta {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

let cachedBlobUrl: string | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an audio File/Blob to IndexedDB and return an Object URL and metadata.
 */
export async function saveAudioFileToDB(file: File): Promise<{ url: string; meta: StoredAudioMeta }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const meta: StoredAudioMeta = {
      name: file.name,
      size: file.size,
      type: file.type || 'audio/mpeg',
      lastModified: file.lastModified,
    };

    const record = {
      blob: file,
      meta,
    };

    const request = store.put(record, KEY);
    request.onsuccess = () => {
      if (cachedBlobUrl) {
        URL.revokeObjectURL(cachedBlobUrl);
      }
      cachedBlobUrl = URL.createObjectURL(file);
      resolve({ url: cachedBlobUrl, meta });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve the saved audio Blob URL and metadata from IndexedDB.
 */
export async function loadAudioFileFromDB(): Promise<{ url: string; meta: StoredAudioMeta } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY);

      request.onsuccess = () => {
        const result = request.result;
        if (!result || !result.blob) {
          resolve(null);
          return;
        }

        if (cachedBlobUrl) {
          URL.revokeObjectURL(cachedBlobUrl);
        }
        cachedBlobUrl = URL.createObjectURL(result.blob);
        resolve({ url: cachedBlobUrl, meta: result.meta });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load audio from IndexedDB:', err);
    return null;
  }
}

/**
 * Remove saved custom audio file from IndexedDB.
 */
export async function deleteAudioFileFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(KEY);

      request.onsuccess = () => {
        if (cachedBlobUrl) {
          URL.revokeObjectURL(cachedBlobUrl);
          cachedBlobUrl = null;
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete audio from IndexedDB:', err);
  }
}

/**
 * Get current cached Blob URL if available.
 */
export function getCachedBlobUrl(): string | null {
  return cachedBlobUrl;
}
