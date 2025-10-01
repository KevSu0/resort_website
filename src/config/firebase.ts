/**
 * Firebase configuration stubs
 * These are placeholder implementations to allow compilation
 * In a real implementation, you would initialize Firebase with actual config
 */

// Interface definitions for mock Firebase types
interface MockDocumentData {
  [key: string]: unknown;
}

interface MockDocumentReference {
  get: () => Promise<{ exists: boolean; data: () => MockDocumentData }>;
  set: (data: MockDocumentData) => Promise<void>;
  update: (data: MockDocumentData) => Promise<void>;
  delete: () => Promise<void>;
}

interface MockQuery {
  get: () => Promise<{ docs: unknown[] }>;
  orderBy: (field: string, direction?: string) => MockQuery;
  limit: (count: number) => MockQuery;
}

interface MockCollectionReference {
  addDoc: (data: MockDocumentData) => Promise<{ id: string }>;
  doc: (id: string) => MockDocumentReference;
  where: (field: string, op: string, value: unknown) => MockQuery;
  orderBy: (field: string, direction?: string) => MockQuery;
  limit: (count: number) => MockQuery;
  get: () => Promise<{ docs: unknown[] }>;
}

interface MockFirestore {
  collection: (path: string) => MockCollectionReference;
}

interface MockStorageReference {
  fullPath: string;
  uploadBytes: (file: File | ArrayBuffer | Uint8Array) => Promise<{ ref: { fullPath: string } }>;
  getDownloadURL: () => Promise<string>;
  delete: () => Promise<void>;
  listAll: () => Promise<{ items: unknown[] }>;
}

interface MockStorage {
  app: { name: string };
  maxUploadRetryTime: number;
  maxOperationRetryTime: number;
  ref: (path: string) => MockStorageReference;
}

// Mock Firebase Firestore
export const db: MockFirestore = {
  // Mock collection reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collection: (path: string): MockCollectionReference => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addDoc: (data: MockDocumentData) => Promise.resolve({ id: 'mock-id' }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    doc: (id: string): MockDocumentReference => ({
      get: () => Promise.resolve({ exists: true, data: () => ({}) }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set: (data: MockDocumentData) => Promise.resolve(),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      update: (data: MockDocumentData) => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    where: (field: string, op: string, value: unknown): MockQuery => ({
      get: () => Promise.resolve({ docs: [] }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      orderBy: (field: string, direction?: string): MockQuery => ({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        limit: (count: number): MockQuery => ({
          get: () => Promise.resolve({ docs: [] }),
        }),
        get: () => Promise.resolve({ docs: [] }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      limit: (count: number): MockQuery => ({
        get: () => Promise.resolve({ docs: [] }),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orderBy: (field: string, direction?: string): MockQuery => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      limit: (count: number): MockQuery => ({
        get: () => Promise.resolve({ docs: [] }),
      }),
      get: () => Promise.resolve({ docs: [] }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    limit: (count: number): MockQuery => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
    get: () => Promise.resolve({ docs: [] }),
  }),
};

// Mock Firebase Storage
export const storage: MockStorage = {
  app: { name: 'mock-app' },
  maxUploadRetryTime: 600000,
  maxOperationRetryTime: 120000,
  ref: (path: string): MockStorageReference => ({
    fullPath: path,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    uploadBytes: (file: File | ArrayBuffer | Uint8Array) => Promise.resolve({ ref: { fullPath: path } }),
    getDownloadURL: () => Promise.resolve(`https://mock-url.com/${path}`),
    delete: () => Promise.resolve(),
    listAll: () => Promise.resolve({ items: [] }),
  }),
};

// Mock Firebase Timestamp
export const Timestamp = {
  now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000 }),
  fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000 }),
};

// Mock Firebase functions
export const collection = (db: MockFirestore, path: string): MockCollectionReference => db.collection(path);
export const addDoc = (ref: MockCollectionReference, data: MockDocumentData): Promise<{ id: string }> => ref.addDoc(data);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const query = (ref: MockCollectionReference | MockQuery, ...constraints: unknown[]): MockQuery => ref as MockQuery;
export const where = (field: string, op: string, value: unknown) => ({ field, op, value });
export const orderBy = (field: string, direction?: string) => ({ field, direction });
export const limit = (count: number) => ({ count });
export const getDocs = (ref: MockQuery) => ref.get();
export const ref = (storage: MockStorage, path: string): MockStorageReference => storage.ref(path);
export const uploadBytes = (ref: MockStorageReference, file: File | ArrayBuffer | Uint8Array) => ref.uploadBytes(file);
export const getDownloadURL = (ref: MockStorageReference) => ref.getDownloadURL();
export const deleteObject = (ref: MockStorageReference) => ref.delete();
export const listAll = (ref: MockStorageReference) => ref.listAll();

// Additional Firebase functions that might be needed
export const doc = (db: MockFirestore, path: string, id?: string): MockDocumentReference => {
  if (id) {
    return db.collection(path).doc(id);
  }
  return {
    get: () => Promise.resolve({ exists: false, data: () => ({}) }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set: (data: MockDocumentData) => Promise.resolve(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (data: MockDocumentData) => Promise.resolve(),
    delete: () => Promise.resolve(),
  };
};

export const getDoc = (ref: MockDocumentReference) => ref.get();
export const updateDoc = (ref: MockDocumentReference, data: MockDocumentData) => ref.update(data);
export const deleteDoc = (ref: MockDocumentReference) => ref.delete();
export const serverTimestamp = () => ({ toDate: () => new Date() });
export const startAfter = (doc: MockDocumentReference) => ({ startAfter: doc });