import { DatabaseService } from '../../services/databaseService';

// Mock IndexedDB
const mockDB = {
  objectStoreNames: ['enquiries', 'media', 'properties', 'rooms', 'settings'],
  close: jest.fn(),
  transaction: jest.fn(),
  createObjectStore: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(),
};

const mockObjectStore = {
  getAll: jest.fn(),
  count: jest.fn(),
  indexNames: ['status', 'createdAt', 'email', 'assignedTo', 'type', 'slug', 'featured', 'uploadedAt', 'filename'],
};

const mockStoreRequest = {
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

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    dbService = new DatabaseService();

    // Reset mock implementations
    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
    mockObjectStore.getAll.mockReturnValue(mockStoreRequest);
    mockObjectStore.count.mockReturnValue(mockStoreRequest);

    // Setup request event handlers
    mockStoreRequest.onsuccess = null;
    mockStoreRequest.onerror = null;
    mockOpenRequest.onsuccess = null;
    mockOpenRequest.onerror = null;
    mockOpenRequest.onupgradeneeded = null;
  });

  describe('runIntegrityCheck', () => {
    it('passes check when database is healthy', async () => {
      // Mock successful data retrieval
      const mockEnquiries = [
        {
          id: '1',
          customer: { email: 'test@example.com' },
          status: 'NEW',
          createdAt: new Date().toISOString(),
        },
      ];
      const mockMedia = [
        { id: '1', type: 'image', filename: 'test.jpg' },
      ];
      const mockProperties = [
        { id: '1', name: 'Test Property', slug: 'test-property' },
      ];
      const mockRooms = [
        { id: '1', name: 'Test Room', type: 'DELUXE', price: 100 },
      ];

      // Setup mock responses
      let callCount = 0;
      mockObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockStoreRequest };
        if (callCount === 0) request.result = mockEnquiries;
        else if (callCount === 1) request.result = mockMedia;
        else if (callCount === 2) request.result = mockProperties;
        else if (callCount === 3) request.result = mockRooms;
        callCount++;
        return request;
      });

      mockObjectStore.count.mockReturnValue({
        onsuccess: jest.fn((handler) => {
          setTimeout(() => handler({ target: { result: 5 } }), 0);
        }),
        onerror: jest.fn(),
      });

      // Simulate async operations
      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.storeCounts).toBeDefined();
      expect(result.checkResults).toBeDefined();
    });

    it('detects missing object stores', async () => {
      // Mock database with missing stores
      mockDB.objectStoreNames = ['enquiries', 'media'] as any; // Missing properties and rooms

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Missing object store: properties');
      expect(result.issues).toContain('Missing object store: rooms');
    });

    it('validates enquiry data structure', async () => {
      const invalidEnquiries = [
        {
          id: '1',
          // Missing customer.email
          status: 'NEW',
          createdAt: 'invalid-date',
        },
        {
          // Missing id
          customer: { email: 'test@example.com' },
          status: 'NEW',
          createdAt: new Date().toISOString(),
        },
      ];

      mockObjectStore.getAll.mockReturnValue({
        ...mockStoreRequest,
        result: invalidEnquiries,
      });

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Enquiry missing customer email');
      expect(result.issues).toContain('Enquiry missing ID');
      expect(result.issues).toContain('Enquiry 1 has invalid createdAt');
    });

    it('validates media data structure', async () => {
      const invalidMedia = [
        {
          id: '1',
          // Missing type
          filename: 'test.jpg',
        },
        {
          // Missing id
          type: 'image',
          filename: 'test2.jpg',
        },
      ];

      mockObjectStore.getAll.mockReturnValue({
        ...mockStoreRequest,
        result: invalidMedia,
      });

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Media item missing type');
      expect(result.issues).toContain('Media item missing ID');
    });

    it('validates property data structure', async () => {
      const invalidProperties = [
        {
          id: '1',
          name: 'Test Property',
          // Missing slug
        },
        {
          // Missing id
          name: 'Test Property 2',
          slug: 'test-property-2',
        },
      ];

      mockObjectStore.getAll.mockReturnValue({
        ...mockStoreRequest,
        result: invalidProperties,
      });

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Property missing slug');
      expect(result.issues).toContain('Property missing ID');
    });

    it('validates room data structure', async () => {
      const invalidRooms = [
        {
          id: '1',
          name: 'Test Room',
          type: 'DELUXE',
          // Missing price
        },
        {
          id: '2',
          name: 'Test Room 2',
          // Missing type
          price: 150,
        },
        {
          id: '3',
          name: 'Test Room 3',
          type: 'SUITE',
          price: 'invalid', // Should be number
        },
      ];

      mockObjectStore.getAll.mockReturnValue({
        ...mockStoreRequest,
        result: invalidRooms,
      });

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Room missing or invalid price');
      expect(result.issues).toContain('Room missing type');
    });

    it('validates indexes exist', async () => {
      // Mock store with missing indexes
      mockObjectStore.indexNames = ['status']; // Missing createdAt index

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Missing index createdAt in store enquiries');
    });

    it('handles database initialization errors', async () => {
      const error = new Error('Database error');
      (dbService as any).initialize = jest.fn().mockRejectedValue(error);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Database integrity check failed: Error: Database error');
    });

    it('handles store-specific errors', async () => {
      // Mock successful for some stores, error for others
      mockObjectStore.getAll.mockImplementation(() => {
        const request = {
          onsuccess: null,
          onerror: jest.fn(),
        };
        return request;
      });

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
        if (mockObjectStore.getAll().onerror) {
          mockObjectStore.getAll().onerror({ target: { error: 'Store error' } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Error checking store enquiries: Store error');
    });

    it('returns store counts for all stores', async () => {
      // Mock different counts for each store
      mockObjectStore.count.mockImplementation(() => ({
        onsuccess: jest.fn((handler) => {
          setTimeout(() => handler({ target: { result: 5 } }), 0);
        }),
        onerror: jest.fn(),
      }));

      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.storeCounts).toBeDefined();
      expect(typeof result.storeCounts.enquiries).toBe('number');
      expect(typeof result.storeCounts.media).toBe('number');
    });

    it('includes check results for each store', async () => {
      setTimeout(() => {
        if (mockStoreRequest.onsuccess) {
          mockStoreRequest.onsuccess({ target: { result: [] } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } } as any);
        }
      }, 0);

      const result = await dbService.runIntegrityCheck();

      expect(result.checkResults).toBeDefined();
      expect(result.checkResults.enquiries).toBeDefined();
      expect(result.checkResults.media).toBeDefined();
      expect(result.checkResults.properties).toBeDefined();
      expect(result.checkResults.rooms).toBeDefined();
    });
  });
});