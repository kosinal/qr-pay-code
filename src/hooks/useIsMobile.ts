import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is a mobile device or tablet
 *
 * Detection strategy:
 * 1. Primary: Touch capability detection (navigator.maxTouchPoints)
 * 2. Secondary: Pointer type detection (coarse pointer indicates touch device)
 * 3. Tertiary: Hover capability detection (mobile/tablet lack precise hover)
 * 4. Quaternary: User agent detection for mobile devices
 * 5. Fallback: Screen width check (< 768px considered mobile)
 *
 * This approach correctly identifies:
 * - Small phones and tablets (traditional detection)
 * - Large tablets like iPad Pro in desktop mode (touch + pointer detection)
 * - Android tablets with wide screens (touch + coarse pointer)
 * - Excludes desktop computers with touchscreens (touch but fine pointer + hover)
 *
 * @returns {boolean} True if device is mobile or tablet, false otherwise
 */
export const useIsMobile = (): boolean => {
  const checkIsMobile = (): boolean => {
    // 1. Check touch capability (most reliable for modern devices)
    const hasTouch = navigator.maxTouchPoints > 0;

    // 2. Check pointer type (coarse = touch-based input)
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // 3. Check hover capability (mobile/tablet typically lack precise hover)
    const lacksHover = window.matchMedia('(hover: none)').matches;

    // 4. Check user agent for mobile devices
    const userAgent =
      navigator?.userAgent ||
      navigator?.vendor ||
      (window as unknown as { opera?: string }).opera ||
      '';
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const hasMobileUA = mobileRegex.test(userAgent.toLowerCase());

    // Device is mobile/tablet if it has touch AND at least one of:
    // - Coarse pointer (touch-optimized input)
    // - Lacks hover (no mouse-like hover capability)
    // - Mobile user agent (explicit device identification)
    if (hasTouch && (hasCoarsePointer || lacksHover || hasMobileUA)) {
      return true;
    }

    // Fallback for older browsers or edge cases
    return hasMobileUA || window.innerWidth < 768;
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
