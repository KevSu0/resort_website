import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Setup and teardown for each test
beforeEach(async () => {
  // Test setup can go here
});

afterEach(async () => {
  // Test cleanup can go here
  jest.clearAllMocks();
});