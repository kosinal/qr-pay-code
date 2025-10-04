import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQRCodeShare } from '../useQRCodeShare';
import * as qrCodeShareUtils from '../../utils/qrCodeShare';

vi.mock('../../utils/qrCodeShare');

describe('useQRCodeShare hook', () => {
  let mockShareOrDownloadQRCode: ReturnType<typeof vi.fn>;
  let mockCanShareFiles: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockShareOrDownloadQRCode = vi.fn();
    mockCanShareFiles = vi.fn().mockReturnValue(true);

    vi.spyOn(qrCodeShareUtils, 'shareOrDownloadQRCode').mockImplementation(
      mockShareOrDownloadQRCode
    );
    vi.spyOn(qrCodeShareUtils, 'canShareFiles').mockImplementation(mockCanShareFiles);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useQRCodeShare());

    expect(result.current.state).toEqual({
      isSharing: false,
      error: null,
      lastResult: null,
    });
    expect(result.current.canShare).toBe(true);
  });

  it('sets isSharing to true when shareQRCode is called', async () => {
    mockShareOrDownloadQRCode.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('shared'), 100))
    );

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    act(() => {
      result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.isSharing).toBe(true);

    await waitFor(() => {
      expect(result.current.state.isSharing).toBe(false);
    });
  });

  it('updates lastResult to "shared" on successful share', async () => {
    mockShareOrDownloadQRCode.mockResolvedValue('shared');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.lastResult).toBe('shared');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.isSharing).toBe(false);
  });

  it('updates lastResult to "downloaded" when download fallback is used', async () => {
    mockShareOrDownloadQRCode.mockResolvedValue('downloaded');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.lastResult).toBe('downloaded');
    expect(result.current.state.error).toBeNull();
  });

  it('updates lastResult to "cancelled" when user cancels share', async () => {
    mockShareOrDownloadQRCode.mockResolvedValue('cancelled');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.lastResult).toBe('cancelled');
    expect(result.current.state.error).toBeNull();
  });

  it('sets error state when shareQRCode fails', async () => {
    const errorMessage = 'Failed to share QR code';
    mockShareOrDownloadQRCode.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.error).toBe(errorMessage);
    expect(result.current.state.lastResult).toBeNull();
    expect(result.current.state.isSharing).toBe(false);
  });

  it('handles non-Error exceptions with default message', async () => {
    mockShareOrDownloadQRCode.mockRejectedValue('String error');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.error).toBe('Failed to share QR code. Please try again.');
  });

  it('passes custom filename to shareOrDownloadQRCode', async () => {
    mockShareOrDownloadQRCode.mockResolvedValue('shared');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const customFilename = 'custom-qr.png';

    await act(async () => {
      await result.current.shareQRCode(svgElement, customFilename);
    });

    expect(mockShareOrDownloadQRCode).toHaveBeenCalledWith(svgElement, customFilename);
  });

  it('clears error when clearError is called', () => {
    const { result } = renderHook(() => useQRCodeShare());

    // Manually set error state
    act(() => {
      result.current.shareQRCode(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it('resets entire state when reset is called', async () => {
    mockShareOrDownloadQRCode.mockResolvedValue('shared');

    const { result } = renderHook(() => useQRCodeShare());
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    await act(async () => {
      await result.current.shareQRCode(svgElement);
    });

    expect(result.current.state.lastResult).toBe('shared');

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      isSharing: false,
      error: null,
      lastResult: null,
    });
  });

  it('returns canShare based on canShareFiles utility', () => {
    mockCanShareFiles.mockReturnValue(false);

    const { result } = renderHook(() => useQRCodeShare());

    expect(result.current.canShare).toBe(false);
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useQRCodeShare());

    const firstShareQRCode = result.current.shareQRCode;
    const firstClearError = result.current.clearError;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.shareQRCode).toBe(firstShareQRCode);
    expect(result.current.clearError).toBe(firstClearError);
    expect(result.current.reset).toBe(firstReset);
  });
});
