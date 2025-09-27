import '@testing-library/jest-dom';

// Setup for Preact testing
import { beforeAll, afterEach, vi } from 'vitest';

// Mock console.log for testing
const originalConsoleLog = console.log;

beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  // Clean up between tests
  console.log = originalConsoleLog;
});

// Global testing utilities
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};