// Jest setup file
require('@testing-library/jest-dom');
jest.mock('./src/config');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock crypto API for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    subtle: {
      digest: jest.fn(),
    },
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByType: jest.fn(),
    getEntriesByName: jest.fn(),
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
  writable: true,
});

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.onabort = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onprogress = null;
  }

  readAsDataURL(blob) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,mock' } });
      }
    }, 0);
  }

  readAsText(blob) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'mock text content' } });
      }
    }, 0);
  }

  abort() {
    if (this.onabort) {
      this.onabort(new ProgressEvent('abort'));
    }
  }
};

// Mock Image loading
global.Image = class Image {
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Mock window.alert and window.confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Test utilities
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.beforeAll = beforeAll;
global.beforeEach = beforeEach;
global.afterAll = afterAll;
global.afterEach = afterEach;

// Setup global test helpers
global.createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const blob = new Blob(['mock file content'], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

global.createMockEvent = (type, data = {}) => {
  return {
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {
      value: '',
      checked: false,
      ...data.target,
    },
    currentTarget: {
      value: '',
      ...data.currentTarget,
    },
    ...data,
  };
};

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Clear sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Clear fetch mock
  global.fetch.mockClear();
});