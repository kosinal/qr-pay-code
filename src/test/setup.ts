import '@testing-library/jest-dom';

// Setup for Preact testing
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  // Setup global test environment

  // Fix NaN timeout warnings from Bootstrap transitions in jsdom.
  // Bootstrap's Collapse/Transition reads CSS transitionDuration via getComputedStyle,
  // which returns empty strings in jsdom. parseFloat('') → NaN → setTimeout(fn, NaN)
  // triggers Node.js TimeoutNaNWarning.
  const origSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    return origSetTimeout(
      handler,
      typeof timeout === 'number' && Number.isNaN(timeout) ? 0 : timeout,
      ...args
    );
  }) as typeof globalThis.setTimeout;

  // Mock window.matchMedia for mobile detection tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock URL.createObjectURL and URL.revokeObjectURL for QR code sharing tests
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock HTMLCanvasElement's getContext for QR code conversion tests
  const mockCanvas = {
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    toBlob: vi.fn((callback) => {
      callback(new Blob(['mock-png-data'], { type: 'image/png' }));
    }),
  };

  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCanvas as unknown as CanvasRenderingContext2D
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob as (
    callback: BlobCallback,
    type?: string,
    quality?: number
  ) => void;
});

afterEach(() => {
  // Clean up between tests
  vi.clearAllMocks();
});
