import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate responsive QR code size based on viewport width
 * Ensures QR code fits properly on small devices like Samsung Galaxy S8+ (360px)
 */
export const useQRCodeSize = (): number => {
  const calculateQRSize = (): number => {
    const viewportWidth = window.innerWidth;

    // For very small devices (≤360px like Samsung Galaxy S8+), use aggressive scaling
    if (viewportWidth <= 360) {
      // Use 75% of viewport width to ensure it fits with all padding
      return Math.floor(viewportWidth * 0.75);
    }

    // Card padding based on breakpoints from SimpleLayout.css
    let cardPadding = 32; // Default: 1rem (16px) on each side for ≤576px
    if (viewportWidth > 576 && viewportWidth <= 768) {
      cardPadding = 48; // 1.5rem (24px) on each side
    } else if (viewportWidth > 768) {
      cardPadding = 32; // Bootstrap default
    }

    // Container padding: 0.5rem (8px) on each side
    const containerPadding = 16;

    // Calculate available width for QR code
    const availableWidth = viewportWidth - cardPadding - containerPadding;

    // Use 85% of available width to ensure comfortable fit
    // Max out at 256px for optimal QR code quality on larger screens
    const calculatedSize = Math.floor(availableWidth * 0.85);
    return Math.min(256, calculatedSize);
  };

  const [qrSize, setQRSize] = useState<number>(calculateQRSize);

  useEffect(() => {
    const handleResize = () => {
      setQRSize(calculateQRSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return qrSize;
};
