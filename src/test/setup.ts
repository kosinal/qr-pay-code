import '@testing-library/jest-dom';

// Setup for Preact testing
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  // Clean up between tests
  vi.clearAllMocks();
});
