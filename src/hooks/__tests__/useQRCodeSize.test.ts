import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQRCodeSize } from '../useQRCodeSize';

describe('useQRCodeSize', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setViewportWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  describe('Very small devices (≤360px)', () => {
    it('returns 75% of viewport width for Samsung Galaxy S8+ (360px)', () => {
      setViewportWidth(360);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(270); // 360 * 0.75 = 270
    });

    it('returns 75% of viewport width for 320px width device', () => {
      setViewportWidth(320);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(240); // 320 * 0.75 = 240
    });

    it('returns 75% of viewport width for exactly 360px', () => {
      setViewportWidth(360);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(270);
    });
  });

  describe('Small devices (361px - 576px)', () => {
    it('calculates size with card padding for 400px width', () => {
      setViewportWidth(400);
      const { result } = renderHook(() => useQRCodeSize());
      // availableWidth = 400 - 32 (card) - 16 (container) = 352
      // size = 352 * 0.85 = 299.2 -> 299, but capped at 256
      expect(result.current).toBe(256);
    });

    it('calculates size with card padding for 576px width', () => {
      setViewportWidth(576);
      const { result } = renderHook(() => useQRCodeSize());
      // availableWidth = 576 - 32 - 16 = 528
      // size = 528 * 0.85 = 448.8 -> 448, but capped at 256
      expect(result.current).toBe(256);
    });
  });

  describe('Medium devices (577px - 768px)', () => {
    it('calculates size with larger card padding for 700px width', () => {
      setViewportWidth(700);
      const { result } = renderHook(() => useQRCodeSize());
      // availableWidth = 700 - 48 (larger card padding) - 16 = 636
      // size = 636 * 0.85 = 540.6 -> 540, but capped at 256
      expect(result.current).toBe(256);
    });
  });

  describe('Large devices (>768px)', () => {
    it('returns maximum size of 256px for 1024px width', () => {
      setViewportWidth(1024);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(256);
    });

    it('returns maximum size of 256px for 1920px width', () => {
      setViewportWidth(1920);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(256);
    });
  });

  describe('Window resize handling', () => {
    it('updates size when window is resized', () => {
      setViewportWidth(360);
      const { result } = renderHook(() => useQRCodeSize());
      expect(result.current).toBe(270);

      act(() => {
        setViewportWidth(768);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(256);
    });

    it('cleans up resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useQRCodeSize());

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
