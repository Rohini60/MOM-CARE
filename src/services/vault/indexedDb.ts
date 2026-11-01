/**
 * IndexedDB storage for encrypted vault file blobs.
 * Keeps user medical documents strictly encrypted on device.
 */

const DB_NAME = 'momcare_health_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'encrypted_files';

export interface StoredEncryptedFile {
  fileId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  ivHex: string;
  encryptedBlob: Blob;
  updatedAt: string;
}

function openVaultDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEncryptedFileToIndexedDB(
  fileId: string,
  userId: string,
  fileName: string,
  mimeType: string,
  ivHex: string,
  encryptedBuffer: ArrayBuffer
): Promise<void> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const blob = new Blob([encryptedBuffer], { type: mimeType });

    const record: StoredEncryptedFile = {
      fileId,
      userId,
      fileName,
      mimeType,
      ivHex,
      encryptedBlob: blob,
      updatedAt: new Date().toISOString(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getEncryptedFileFromIndexedDB(
  fileId: string
): Promise<StoredEncryptedFile | null> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(fileId);
    req.onsuccess = () => resolve((req.result as StoredEncryptedFile) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteEncryptedFileFromIndexedDB(fileId: string): Promise<void> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(fileId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllVaultFilesForUser(userId: string): Promise<void> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('userId');
    const req = index.openCursor(IDBKeyRange.only(userId));

    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}
