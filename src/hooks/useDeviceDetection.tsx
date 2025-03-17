'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device capabilities and optimize rendering
 * @returns Object containing device information and capabilities
 */
export function useDeviceDetection() {
  const [deviceData, setDeviceData] = useState({
    isLowPerformance: false,
    isMobile: false,
    prefersReducedMotion: false,
    connectionType: 'unknown',
    effectiveType: '4g',
    isDataSaver: false,
    screenSize: 'desktop'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkCapabilities = () => {
      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      
      // Detect mobile device
      const isMobile = window.innerWidth < 768 || 
                      ('ontouchstart' in window && window.matchMedia?.('(pointer: coarse)').matches);
      
      // Classify screen size
      let screenSize = 'desktop';
      if (window.innerWidth < 640) screenSize = 'small';
      else if (window.innerWidth < 768) screenSize = 'medium';
      else if (window.innerWidth < 1024) screenSize = 'large';
      
      // Check for low-end hardware
      const isLowEnd = 
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || 
        ('connection' in navigator && (navigator as any).connection?.saveData) ||
        (typeof window.performance !== 'undefined' && 
         (window.performance as any).memory && 
         (window.performance as any).memory.jsHeapSizeLimit < 2147483648); // < 2GB
      
      // Connection information for additional optimizations
      let connectionType = 'unknown';
      let effectiveType = '4g';
      let isDataSaver = false;
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        connectionType = conn?.type || 'unknown';
        effectiveType = conn?.effectiveType || '4g';
        isDataSaver = conn?.saveData || false;
      }
      
      setDeviceData({
        isLowPerformance: prefersReducedMotion || isLowEnd || isDataSaver || ['slow-2g', '2g'].includes(effectiveType),
        isMobile,
        prefersReducedMotion,
        connectionType,
        effectiveType,
        isDataSaver,
        screenSize
      });
    };

    // Initial check
    checkCapabilities();
    
    // React to window resize
    const handleResize = () => {
      // Debounce the resize handler
      if (typeof window !== 'undefined') {
        let screenSize = 'desktop';
        if (window.innerWidth < 640) screenSize = 'small';
        else if (window.innerWidth < 768) screenSize = 'medium';
        else if (window.innerWidth < 1024) screenSize = 'large';
        
        setDeviceData(prev => ({
          ...prev,
          isMobile: window.innerWidth < 768,
          screenSize
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Optimize execution to avoid blocking the main thread
    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(checkCapabilities);
      return () => {
        cancelIdleCallback(idleId);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      const timeoutId = setTimeout(checkCapabilities, 300);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return deviceData;
}

export default useDeviceDetection;
