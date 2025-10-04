import { useState, useCallback } from 'react';
import { shareOrDownloadQRCode, canShareFiles } from '../utils/qrCodeShare';

export interface QRCodeShareState {
  isSharing: boolean;
  error: string | null;
  lastResult: 'shared' | 'downloaded' | 'cancelled' | null;
}

export interface UseQRCodeShareReturn {
  /**
   * Current sharing state
   */
  state: QRCodeShareState;

  /**
   * Whether the device supports Web Share API for files
   */
  canShare: boolean;

  /**
   * Share or download the QR code
   * @param svgElement - The SVG element to share
   * @param fileName - Optional filename
   */
  shareQRCode: (svgElement: SVGElement, fileName?: string) => Promise<void>;

  /**
   * Clear the error state
   */
  clearError: () => void;

  /**
   * Reset the entire state
   */
  reset: () => void;
}

/**
 * Custom hook for QR code sharing functionality
 * Manages state and provides interface for sharing QR codes on mobile devices
 *
 * @example
 * ```tsx
 * const { state, canShare, shareQRCode } = useQRCodeShare();
 *
 * const handleShare = () => {
 *   const svg = document.querySelector('svg');
 *   if (svg) {
 *     shareQRCode(svg);
 *   }
 * };
 * ```
 */
export const useQRCodeShare = (): UseQRCodeShareReturn => {
  const [state, setState] = useState<QRCodeShareState>({
    isSharing: false,
    error: null,
    lastResult: null,
  });

  const canShare = canShareFiles();

  const shareQRCode = useCallback(async (svgElement: SVGElement, fileName?: string) => {
    setState({
      isSharing: true,
      error: null,
      lastResult: null,
    });

    try {
      const result = await shareOrDownloadQRCode(svgElement, fileName);

      setState({
        isSharing: false,
        error: null,
        lastResult: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to share QR code. Please try again.';

      setState({
        isSharing: false,
        error: errorMessage,
        lastResult: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isSharing: false,
      error: null,
      lastResult: null,
    });
  }, []);

  return {
    state,
    canShare,
    shareQRCode,
    clearError,
    reset,
  };
};
