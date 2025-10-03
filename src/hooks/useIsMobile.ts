import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is a mobile device
 *
 * Detection strategy:
 * 1. Primary: User agent detection for mobile devices
 * 2. Secondary: Screen width fallback (< 768px considered mobile)
 * 3. Responsive: Updates on window resize
 *
 * @returns {boolean} True if device is mobile, false otherwise
 */
export const useIsMobile = (): boolean => {
  const checkIsMobile = (): boolean => {
    // Check user agent for mobile devices
    const userAgent =
      navigator?.userAgent ||
      navigator?.vendor ||
      (window as unknown as { opera?: string }).opera ||
      '';
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

    if (mobileRegex.test(userAgent.toLowerCase())) {
      return true;
    }

    // Fallback to screen width check
    return window.innerWidth < 768;
  };

  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);

    // Initial check on mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};
