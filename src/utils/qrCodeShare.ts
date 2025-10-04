/**
 * QR Code sharing utilities for mobile devices
 * Handles SVG to PNG conversion and Web Share API integration
 */

/**
 * Converts an SVG element to a PNG Blob
 * @param svgElement - The SVG element to convert
 * @param size - Output image size (default: 256)
 * @returns Promise resolving to PNG Blob
 */
export const convertSvgToPngBlob = async (
  svgElement: SVGElement,
  size: number = 256
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Serialize the SVG to a string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create an image element to load the SVG
      const img = new Image();
      img.width = size;
      img.height = size;

      img.onload = () => {
        try {
          // Create a canvas and draw the image
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Fill with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size);

          // Draw the SVG image
          ctx.drawImage(img, 0, 0, size, size);

          // Clean up the object URL
          URL.revokeObjectURL(url);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            'image/png',
            1.0
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Checks if the Web Share API is available and can share files
 * @returns true if Web Share API is available with file support
 */
export const canShareFiles = (): boolean => {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  // Test if files can be shared
  try {
    const testFile = new File(['test'], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
};

/**
 * Shares a QR code image using the Web Share API
 * @param blob - The image blob to share
 * @param fileName - Name for the shared file (default: 'payment-qr-code.png')
 * @returns Promise resolving to true if shared successfully, false if cancelled
 * @throws Error if sharing fails (not user cancellation)
 */
export const shareQRCodeImage = async (
  blob: Blob,
  fileName: string = 'payment-qr-code.png'
): Promise<boolean> => {
  if (!canShareFiles()) {
    throw new Error('Web Share API not supported on this device');
  }

  try {
    const file = new File([blob], fileName, { type: 'image/png' });
    await navigator.share({
      files: [file],
      title: 'Payment QR Code',
      text: 'Scan this QR code in your banking app to make the payment',
    });
    return true;
  } catch (error) {
    // User cancelled the share - not an error
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    // Actual error occurred
    throw error;
  }
};

/**
 * Downloads a blob as a file (fallback when Web Share is not available)
 * @param blob - The blob to download
 * @param fileName - Name for the downloaded file
 */
export const downloadBlob = (blob: Blob, fileName: string = 'payment-qr-code.png'): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main function to share or download QR code
 * Automatically falls back to download if Web Share is not available
 * @param svgElement - The SVG element to share
 * @param fileName - Name for the file
 * @returns Promise resolving to 'shared', 'downloaded', or 'cancelled'
 */
export const shareOrDownloadQRCode = async (
  svgElement: SVGElement,
  fileName: string = 'payment-qr-code.png'
): Promise<'shared' | 'downloaded' | 'cancelled'> => {
  // Convert SVG to PNG blob
  const blob = await convertSvgToPngBlob(svgElement);

  // Try to share if possible
  if (canShareFiles()) {
    const shared = await shareQRCodeImage(blob, fileName);
    return shared ? 'shared' : 'cancelled';
  }

  // Fallback to download
  downloadBlob(blob, fileName);
  return 'downloaded';
};
