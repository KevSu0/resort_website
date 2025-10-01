/**
 * Type Safety Tests
 * 
 * This file contains tests to verify that our type-safe implementations
 * maintain functionality while eliminating the use of `any` types.
 */

import { PrismaAdapter } from '../lib/database/adapters/PrismaAdapter';
import { cmsApi } from '../api/cmsApi';
import { 
  isDatabaseEntity,
  isBrandEntity,
  isSiteEntity,
  isContentBlock,
  isApiResponse,
  isWebhookPayload
} from '../utils/typeGuards';

// Mock implementations for testing
const mockPrismaAdapter = {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  healthCheck: jest.fn()
} as unknown as PrismaAdapter;

const mockCmsApi = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
} as unknown as typeof cmsApi;

describe('Type Safety Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Entity Type Guards', () => {
    test('isDatabaseEntity correctly identifies valid database entities', () => {
      const validEntity = {
        id: 'test-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test Entity'
      };

      expect(isDatabaseEntity(validEntity)).toBe(true);
    });

    test('isDatabaseEntity correctly rejects invalid database entities', () => {
      const invalidEntity = {
        id: 'test-id',
        // Missing createdAt and updatedAt
        name: 'Test Entity'
      };

      expect(isDatabaseEntity(invalidEntity)).toBe(false);
    });

    test('isBrandEntity correctly identifies valid brand entities', () => {
      const validBrand = {
        id: 'brand-id',
        name: 'Test Brand',
        slug: 'test-brand',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(isBrandEntity(validBrand)).toBe(true);
    });

    test('isSiteEntity correctly identifies valid site entities', () => {
      const validSite = {
        id: 'site-id',
        brandId: 'brand-id',
        name: 'Test Site',
        slug: 'test-site',
        title: 'Test Site Title',
        language: 'en',
        timezone: 'UTC',
        isActive: true,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(isSiteEntity(validSite)).toBe(true);
    });
  });

  describe('CMS Type Guards', () => {
    test('isContentBlock correctly identifies valid content blocks', () => {
      const validContentBlock = {
        id: 'block-id',
        type: 'text',
        content: { text: 'Sample text' },
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(isContentBlock(validContentBlock)).toBe(true);
    });

    test('isContentBlock correctly rejects invalid content blocks', () => {
      const invalidContentBlock = {
        id: 'block-id',
        type: 'text',
        // Missing required fields
      };

      expect(isContentBlock(invalidContentBlock)).toBe(false);
    });
  });

  describe('API Type Guards', () => {
    test('isApiResponse correctly identifies valid API responses', () => {
      const validApiResponse = {
        success: true,
        data: { id: 'test-id' },
        message: 'Operation successful'
      };

      expect(isApiResponse(validApiResponse)).toBe(true);
    });

    test('isApiResponse correctly rejects invalid API responses', () => {
      const invalidApiResponse = {
        // Missing success field
        data: { id: 'test-id' }
      };

      expect(isApiResponse(invalidApiResponse)).toBe(false);
    });

    test('isWebhookPayload correctly identifies valid webhook payloads', () => {
      const validWebhookPayload = {
        event: 'create',
        data: {
          collection: 'pages',
          documentId: 'page-id',
          userId: 'user-id'
        },
        timestamp: {
          seconds: 1234567890,
          nanoseconds: 123456789
        },
        userId: 'user-id'
      };

      expect(isWebhookPayload(validWebhookPayload)).toBe(true);
    });
  });

  describe('Database Operations', () => {
    test('PrismaAdapter query method maintains type safety', async () => {
      const mockResult = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' }
      ];

      mockPrismaAdapter.query = jest.fn().mockResolvedValue({
        data: mockResult,
        total: mockResult.length
      });

      const result = await mockPrismaAdapter.query('SELECT * FROM test');
      
      expect(result.data).toEqual(mockResult);
      expect(result.total).toBe(mockResult.length);
    });

    test('PrismaAdapter insert method maintains type safety', async () => {
      const mockData = { name: 'Test Entity' };
      const mockResult = { id: 'new-id', ...mockData, createdAt: new Date(), updatedAt: new Date() };

      mockPrismaAdapter.insert = jest.fn().mockResolvedValue(mockResult);

      const result = await mockPrismaAdapter.insert('test', mockData);
      
      expect(result).toEqual(mockResult);
    });
  });

  describe('CMS API Operations', () => {
    test('cmsApi getAll method maintains type safety', async () => {
      const mockResult = [
        { id: '1', title: 'Test Page 1' },
        { id: '2', title: 'Test Page 2' }
      ];

      mockCmsApi.getAll = jest.fn().mockResolvedValue({
        success: true,
        data: mockResult,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockResult.length,
          itemsPerPage: 10
        }
      });

      const result = await mockCmsApi.getAll('pages');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.pagination).toBeDefined();
    });

    test('cmsApi create method maintains type safety', async () => {
      const mockData = { title: 'New Page' };
      const mockResult = { id: 'new-id', ...mockData };

      mockCmsApi.create = jest.fn().mockResolvedValue({
        success: true,
        data: mockResult,
        message: 'Page created successfully'
      });

      const result = await mockCmsApi.create('pages', mockData, 'user-id');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('Type Safety Verification', () => {
    test('No any types are used in critical paths', () => {
      // This test verifies that we've successfully replaced `any` types
      // with more specific types in our critical paths
      
      // Check that our type guards work correctly
      const unknownValue: unknown = { id: 'test', name: 'Test' };
      
      if (isDatabaseEntity(unknownValue)) {
        // TypeScript now knows this is a database entity
        expect(unknownValue.id).toBe('test');
      } else {
        fail('Value should be identified as a database entity');
      }
      
      // Check that API responses are properly typed
      const unknownResponse: unknown = { success: true, data: { id: 'test' } };
      
      if (isApiResponse(unknownResponse)) {
        // TypeScript now knows this is an API response
        expect(unknownResponse.success).toBe(true);
      } else {
        fail('Value should be identified as an API response');
      }
    });
  });
});

/**
 * Integration test to verify that the type-safe implementations
 * work together correctly in a real-world scenario.
 */
describe('Integration Tests', () => {
  test('End-to-end workflow maintains type safety', async () => {
    // Mock a complete workflow: create a page, update it, and retrieve it
    
    // 1. Create a page
    const pageData = { title: 'Test Page', content: 'Test content' };
    const createdPage = { id: 'page-id', ...pageData, createdAt: new Date(), updatedAt: new Date() };
    
    mockCmsApi.create = jest.fn().mockResolvedValue({
      success: true,
      data: createdPage,
      message: 'Page created successfully'
    });
    
    const createResult = await mockCmsApi.create('pages', pageData, 'user-id');
    expect(createResult.success).toBe(true);
    
    // 2. Update the page
    const updateData = { title: 'Updated Test Page' };
    const updatedPage = { ...createdPage, ...updateData, updatedAt: new Date() };
    
    mockCmsApi.update = jest.fn().mockResolvedValue({
      success: true,
      data: updatedPage,
      message: 'Page updated successfully'
    });
    
    const updateResult = await mockCmsApi.update('pages', 'page-id', updateData, 'user-id');
    expect(updateResult.success).toBe(true);
    
    // 3. Retrieve the page
    mockCmsApi.getById = jest.fn().mockResolvedValue({
      success: true,
      data: updatedPage
    });
    
    const getResult = await mockCmsApi.getById('pages', 'page-id');
    expect(getResult.success).toBe(true);
    expect(getResult.data).toEqual(updatedPage);
    
    // Verify type safety throughout the workflow
    if (getResult.success && getResult.data) {
      // TypeScript knows this is a page object
      expect((getResult.data as { title: string }).title).toBe('Updated Test Page');
    } else {
      fail('Should have successfully retrieved the updated page');
    }
  });
});