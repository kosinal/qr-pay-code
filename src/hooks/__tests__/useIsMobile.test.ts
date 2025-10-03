import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useIsMobile } from '../useIsMobile';

// Polyfill Event constructor for jsdom
if (typeof Event === 'undefined') {
  global.Event = window.Event as typeof Event;
}

describe('useIsMobile Hook', () => {
  let originalUserAgent: string;
  let originalInnerWidth: number;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  describe('User Agent Detection', () => {
    it('detects Android devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects iPhone devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects iPad devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects iPod devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects BlackBerry devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects Windows Phone devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1)',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('detects desktop Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('detects desktop Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('detects desktop Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  describe('Screen Width Fallback', () => {
    it('returns true for narrow screens (< 768px) on desktop user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('returns false for wide screens (>= 768px) on desktop user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('handles exact boundary case (768px)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  describe('Window Resize Handling', () => {
    it('updates when window is resized from desktop to mobile width', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
        configurable: true,
      });

      const { result, rerender } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);

      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      rerender();

      expect(result.current).toBe(true);
    });

    it('updates when window is resized from mobile to desktop width', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });

      const { result, rerender } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);

      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      rerender();

      expect(result.current).toBe(false);
    });

    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useIsMobile());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});
