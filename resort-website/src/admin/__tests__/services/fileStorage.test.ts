import { fileStorageService } from '../../services/fileStorage';

// Mock IndexedDB
const mockDB = {
  objectStoreNames: {
    contains: jest.fn(),
    length: 3,
  },
  transaction: jest.fn(),
  close: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(),
};

const mockObjectStore = {
  getAll: jest.fn(),
};

const mockRequest = {
  result: [],
  onsuccess: null as any,
  onerror: null as any,
};

const mockOpenRequest = {
  result: mockDB,
  onerror: null as any,
  onsuccess: null as any,
  onupgradeneeded: null as any,
};

// Mock IndexedDB globals
(global as any).indexedDB = {
  open: jest.fn(() => mockOpenRequest),
};

describe('fileStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockDB.objectStoreNames.contains.mockReturnValue(true);
    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
    mockObjectStore.getAll.mockReturnValue(mockRequest);

    // Setup request event handlers
    mockRequest.onsuccess = null;
    mockRequest.onerror = null;
    mockOpenRequest.onsuccess = null;
    mockOpenRequest.onerror = null;
    mockOpenRequest.onupgradeneeded = null;
  });

  describe('getStorageUsage', () => {
    it('calculates storage usage correctly', async () => {
      // Mock database with sample data
      const mockData = [
        { id: 1, name: 'file1.jpg', data: 'x'.repeat(1024 * 1024) }, // 1MB
        { id: 2, name: 'file2.jpg', data: 'x'.repeat(2 * 1024 * 1024) }, // 2MB
      ];

      mockRequest.result = mockData;

      // Trigger success
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: { result: mockData } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const usage = await fileStorageService.getStorageUsage();

      expect(usage.used).toBeCloseTo(0.01, 2); // ~3MB in JSON format
      expect(usage.limit).toBe(100);
      expect(usage.breakdown).toBeDefined();
    });

    it('handles empty database', async () => {
      mockRequest.result = [];

      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const usage = await fileStorageService.getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.breakdown.media).toBe(0);
      expect(usage.breakdown.content).toBe(0);
    });

    it('categorizes storage by store type', async () => {
      // Mock different store names
      mockDB.objectStoreNames.contains = jest.fn()
        .mockReturnValueOnce(true) // media_files
        .mockReturnValueOnce(true) // draft_content
        .mockReturnValueOnce(true); // admin_settings

      const mediaData = [{ id: 1, type: 'image' }];
      const contentData = [{ id: 1, content: 'text' }];
      const settingsData = [{ id: 1, setting: 'value' }];

      // Mock multiple getAll calls for different stores
      let callCount = 0;
      mockObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockRequest };
        if (callCount === 0) request.result = mediaData;
        else if (callCount === 1) request.result = contentData;
        else request.result = settingsData;
        callCount++;
        return request;
      });

      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const usage = await fileStorageService.getStorageUsage();

      expect(usage.breakdown.media).toBeGreaterThan(0);
      expect(usage.breakdown.content).toBeGreaterThan(0);
      expect(usage.breakdown.settings).toBeGreaterThan(0);
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database error');
      mockOpenRequest.onerror = jest.fn();

      setTimeout(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror({ target: { error } } as any);
        }
      }, 0);

      const usage = await fileStorageService.getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.limit).toBe(100);
    });

    it('handles transaction errors', async () => {
      mockObjectStore.getAll.mockReturnValue({
        onsuccess: null,
        onerror: jest.fn(),
      });

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const usage = await fileStorageService.getStorageUsage();

      expect(usage.used).toBe(0);
    });
  });

  describe('getDB', () => {
    it('opens database connection', async () => {
      const promise = (fileStorageService as any).getDB();

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await promise;
      expect(result).toBe(mockDB);
      expect((global as any).indexedDB.open).toHaveBeenCalledWith('WayanadResortsDB', 1);
    });

    it('handles database open errors', async () => {
      const error = new Error('Failed to open database');

      const promise = (fileStorageService as any).getDB();

      setTimeout(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror({ target: { error } } as any);
        }
      }, 0);

      await expect(promise).rejects.toThrow(error);
    });

    it('creates object stores on upgrade', async () => {
      const mockUpgradeEvent = {
        target: { result: mockDB },
        oldVersion: 0,
        newVersion: 1,
      };

      mockDB.objectStoreNames.contains = jest.fn().mockReturnValue(false);
      mockDB.createObjectStore = jest.fn();

      const promise = (fileStorageService as any).getDB();

      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          mockOpenRequest.onupgradeneeded(mockUpgradeEvent);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      await promise;

      expect(mockDB.createObjectStore).toHaveBeenCalledWith('admin_settings', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('media_files', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('draft_content', { keyPath: 'id' });
    });

    it('does not create existing object stores', async () => {
      const mockUpgradeEvent = {
        target: { result: mockDB },
        oldVersion: 0,
        newVersion: 1,
      };

      mockDB.objectStoreNames.contains = jest.fn().mockReturnValue(true);
      mockDB.createObjectStore = jest.fn();

      const promise = (fileStorageService as any).getDB();

      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          mockOpenRequest.onupgradeneeded(mockUpgradeEvent);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      await promise;

      expect(mockDB.createObjectStore).not.toHaveBeenCalled();
    });
  });
});