import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  convertSvgToPngBlob,
  canShareFiles,
  shareQRCodeImage,
  downloadBlob,
  shareOrDownloadQRCode,
} from '../qrCodeShare';

describe('qrCodeShare utilities', () => {
  describe('convertSvgToPngBlob', () => {
    it('converts SVG element to PNG blob', async () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('width', '256');
      svgElement.setAttribute('height', '256');

      // Mock Image to immediately call onload
      const mockImage = {
        width: 0,
        height: 0,
        onload: null as ((this: GlobalEventHandlers, ev: Event) => void) | null,
        onerror: null as ((this: GlobalEventHandlers, ev: ErrorEvent) => void) | null,
        set src(_value: string) {
          // Trigger onload asynchronously
          setTimeout(() => {
            if (mockImage.onload) {
              mockImage.onload.call({} as GlobalEventHandlers, new Event('load'));
            }
          }, 0);
        },
      };

      global.Image = vi.fn(() => mockImage) as unknown as typeof Image;

      const blob = await convertSvgToPngBlob(svgElement, 256);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    }, 10000);

    it('handles custom size parameter', async () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      const mockImage = {
        width: 0,
        height: 0,
        onload: null as ((this: GlobalEventHandlers, ev: Event) => void) | null,
        onerror: null as ((this: GlobalEventHandlers, ev: ErrorEvent) => void) | null,
        set src(_value: string) {
          setTimeout(() => {
            if (mockImage.onload) {
              mockImage.onload.call({} as GlobalEventHandlers, new Event('load'));
            }
          }, 0);
        },
      };

      global.Image = vi.fn(() => mockImage) as unknown as typeof Image;

      const blob = await convertSvgToPngBlob(svgElement, 512);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    }, 10000);

    it('rejects when canvas context is not available', async () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      const mockImage = {
        width: 0,
        height: 0,
        onload: null as ((this: GlobalEventHandlers, ev: Event) => void) | null,
        onerror: null as ((this: GlobalEventHandlers, ev: ErrorEvent) => void) | null,
        set src(_value: string) {
          setTimeout(() => {
            if (mockImage.onload) {
              mockImage.onload.call({} as GlobalEventHandlers, new Event('load'));
            }
          }, 0);
        },
      };

      global.Image = vi.fn(() => mockImage) as unknown as typeof Image;

      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      await expect(convertSvgToPngBlob(svgElement)).rejects.toThrow('Failed to get canvas context');

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }, 10000);
  });

  describe('canShareFiles', () => {
    beforeEach(() => {
      // Reset navigator.share and navigator.canShare
      delete (navigator as { share?: unknown }).share;
      delete (navigator as { canShare?: unknown }).canShare;
    });

    it('returns false when navigator.share is not available', () => {
      expect(canShareFiles()).toBe(false);
    });

    it('returns false when navigator.canShare is not available', () => {
      (navigator as { share: () => Promise<void> }).share = vi.fn();
      expect(canShareFiles()).toBe(false);
    });

    it('returns true when Web Share API supports files', () => {
      (navigator as { share: () => Promise<void> }).share = vi.fn();
      (navigator as { canShare: (data: { files: File[] }) => boolean }).canShare = vi
        .fn()
        .mockReturnValue(true);

      expect(canShareFiles()).toBe(true);
    });

    it('returns false when Web Share API does not support files', () => {
      (navigator as { share: () => Promise<void> }).share = vi.fn();
      (navigator as { canShare: (data: { files: File[] }) => boolean }).canShare = vi
        .fn()
        .mockReturnValue(false);

      expect(canShareFiles()).toBe(false);
    });

    it('handles exceptions gracefully', () => {
      (navigator as { share: () => Promise<void> }).share = vi.fn();
      (navigator as { canShare: (data: { files: File[] }) => boolean }).canShare = vi
        .fn()
        .mockImplementation(() => {
          throw new Error('Not supported');
        });

      expect(canShareFiles()).toBe(false);
    });
  });

  describe('shareQRCodeImage', () => {
    let mockShare: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockShare = vi.fn().mockResolvedValue(undefined);
      (navigator as unknown as { share: typeof mockShare }).share = mockShare;
      (navigator as unknown as { canShare: (data: { files: File[] }) => boolean }).canShare = vi
        .fn()
        .mockReturnValue(true);
    });

    afterEach(() => {
      delete (navigator as { share?: unknown }).share;
      delete (navigator as { canShare?: unknown }).canShare;
    });

    it('shares QR code using Web Share API', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const result = await shareQRCodeImage(blob, 'test.png');

      expect(result).toBe(true);
      expect(mockShare).toHaveBeenCalledWith({
        files: expect.arrayContaining([
          expect.objectContaining({
            name: 'test.png',
            type: 'image/png',
          }),
        ]),
        title: 'Payment QR Code',
        text: 'Scan this QR code in your banking app to make the payment',
      });
    });

    it('uses default filename when not provided', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      await shareQRCodeImage(blob);

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.arrayContaining([
            expect.objectContaining({
              name: 'payment-qr-code.png',
            }),
          ]),
        })
      );
    });

    it('returns false when user cancels share (AbortError)', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      mockShare.mockRejectedValue(abortError);

      const blob = new Blob(['test'], { type: 'image/png' });
      const result = await shareQRCodeImage(blob);

      expect(result).toBe(false);
    });

    it('throws error when sharing fails (not AbortError)', async () => {
      const error = new Error('Share failed');
      mockShare.mockRejectedValue(error);

      const blob = new Blob(['test'], { type: 'image/png' });

      await expect(shareQRCodeImage(blob)).rejects.toThrow('Share failed');
    });

    it('throws error when Web Share API is not supported', async () => {
      delete (navigator as { share?: unknown }).share;
      delete (navigator as { canShare?: unknown }).canShare;

      const blob = new Blob(['test'], { type: 'image/png' });

      await expect(shareQRCodeImage(blob)).rejects.toThrow(
        'Web Share API not supported on this device'
      );
    });
  });

  describe('downloadBlob', () => {
    it('creates download link and triggers download', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const clickSpy = vi.fn();

      // Mock createElement and appendChild
      const linkElement = document.createElement('a');
      linkElement.click = clickSpy;
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(linkElement);
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => linkElement);
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => linkElement);

      downloadBlob(blob, 'test.png');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkElement.download).toBe('test.png');
      expect(appendChildSpy).toHaveBeenCalledWith(linkElement);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(linkElement);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('uses default filename when not provided', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const linkElement = document.createElement('a');
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(linkElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkElement);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkElement);

      downloadBlob(blob);

      expect(linkElement.download).toBe('payment-qr-code.png');

      createElementSpy.mockRestore();
    });
  });

  describe('shareOrDownloadQRCode', () => {
    let svgElement: SVGSVGElement;
    let mockImage: {
      width: number;
      height: number;
      onload: ((this: GlobalEventHandlers, ev: Event) => void) | null;
      onerror: ((this: GlobalEventHandlers, ev: ErrorEvent) => void) | null;
      src: string;
    };

    beforeEach(() => {
      svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('width', '256');
      svgElement.setAttribute('height', '256');

      // Mock Image for SVG to PNG conversion
      mockImage = {
        width: 0,
        height: 0,
        onload: null,
        onerror: null,
        set src(_value: string) {
          setTimeout(() => {
            if (mockImage.onload) {
              mockImage.onload.call({} as GlobalEventHandlers, new Event('load'));
            }
          }, 0);
        },
        get src() {
          return '';
        },
      };

      global.Image = vi.fn(() => mockImage) as unknown as typeof Image;
    });

    afterEach(() => {
      delete (navigator as { share?: unknown }).share;
      delete (navigator as { canShare?: unknown }).canShare;
    });

    it('shares QR code when Web Share API is available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      (navigator as unknown as { share: typeof mockShare }).share = mockShare;
      (navigator as unknown as { canShare: () => boolean }).canShare = vi
        .fn()
        .mockReturnValue(true);

      const result = await shareOrDownloadQRCode(svgElement, 'test.png');

      expect(result).toBe('shared');
      expect(mockShare).toHaveBeenCalled();
    }, 10000);

    it('returns cancelled when user cancels share', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      const mockShare = vi.fn().mockRejectedValue(abortError);
      (navigator as unknown as { share: typeof mockShare }).share = mockShare;
      (navigator as unknown as { canShare: () => boolean }).canShare = vi
        .fn()
        .mockReturnValue(true);

      const result = await shareOrDownloadQRCode(svgElement);

      expect(result).toBe('cancelled');
    }, 10000);

    it('downloads QR code when Web Share API is not available', async () => {
      // Mock document.createElement to return appropriate elements
      const originalCreateElement = document.createElement.bind(document);
      const linkElement = originalCreateElement('a');
      const clickSpy = vi.fn();
      linkElement.click = clickSpy;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return linkElement;
        }
        // For canvas and other elements, use original implementation
        return originalCreateElement(tagName);
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkElement);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkElement);

      const result = await shareOrDownloadQRCode(svgElement, 'test.png');

      expect(result).toBe('downloaded');
      expect(clickSpy).toHaveBeenCalled();
    }, 10000);
  });

  describe('Edge cases and error handling', () => {
    let testSvgElement: SVGElement;

    beforeEach(() => {
      testSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      testSvgElement.setAttribute('viewBox', '0 0 100 100');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      rect.setAttribute('fill', 'red');
      testSvgElement.appendChild(rect);
    });

    it('handles canvas context creation failure', async () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      await expect(convertSvgToPngBlob(testSvgElement)).rejects.toThrow(
        'Failed to get canvas context'
      );

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }, 10000);

    it('handles image load errors', async () => {
      const originalImage = global.Image;

      // Mock Image to trigger onerror
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      } as any;

      try {
        await expect(convertSvgToPngBlob(testSvgElement)).rejects.toThrow(
          'Failed to load SVG image'
        );
      } finally {
        global.Image = originalImage;
      }
    }, 10000);

    it('handles canvas.toBlob returning null', async () => {
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;

      try {
        HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation(function (callback) {
          callback(null);
        });

        await expect(convertSvgToPngBlob(testSvgElement)).rejects.toThrow(
          'Failed to convert canvas to blob'
        );
      } finally {
        HTMLCanvasElement.prototype.toBlob = originalToBlob;
      }
    }, 10000);

    it('handles errors during image drawing', async () => {
      if (typeof CanvasRenderingContext2D === 'undefined') {
        // Skip this test in environments without CanvasRenderingContext2D
        return;
      }

      const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = vi.fn().mockImplementation(() => {
        throw new Error('Drawing failed');
      });

      await expect(convertSvgToPngBlob(testSvgElement)).rejects.toThrow('Drawing failed');

      CanvasRenderingContext2D.prototype.drawImage = originalDrawImage;
    }, 10000);
  });
});
