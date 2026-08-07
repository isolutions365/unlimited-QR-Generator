import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  isNative: boolean;          // Capacitor iOS / Android native platform
  isMobileWidth: boolean;     // Screen width < 768px
  isMobileView: boolean;      // isNative || isMobileWidth || isSimulatedMobile
  isDesktopView: boolean;     // !isMobileView
  platformName: string;       // 'ios' | 'android' | 'web'
  isSimulatedMobile: boolean; // Dev/testing toggle for mobile app view
  toggleSimulatedMobile: () => void;
}

export function usePlatformLayout(): PlatformInfo {
  const isNative = typeof window !== 'undefined' && Capacitor ? Capacitor.isNativePlatform() : false;
  const nativePlatform = typeof window !== 'undefined' && Capacitor ? Capacitor.getPlatform() : 'web';

  const [isMobileWidth, setIsMobileWidth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const [isSimulatedMobile, setIsSimulatedMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('qr_simulated_mobile_view') === 'true';
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileWidth(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSimulatedMobile = () => {
    setIsSimulatedMobile(prev => {
      const next = !prev;
      localStorage.setItem('qr_simulated_mobile_view', String(next));
      return next;
    });
  };

  const isMobileView = isNative || isMobileWidth || isSimulatedMobile;
  const isDesktopView = !isMobileView;

  return {
    isNative,
    isMobileWidth,
    isMobileView,
    isDesktopView,
    platformName: isNative ? nativePlatform : 'web',
    isSimulatedMobile,
    toggleSimulatedMobile
  };
}
