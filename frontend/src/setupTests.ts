import '@testing-library/jest-dom';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock do window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
});

// Mock do import.meta.env
(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000'
    }
  }
}; 