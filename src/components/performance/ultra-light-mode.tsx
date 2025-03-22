"use client";

import React from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface UltraLightModeProps {
  children: React.ReactNode;
  lightContent?: React.ReactNode;
}

export default function UltraLightMode({ children, lightContent }: UltraLightModeProps) {
  const { isUltraLowPerformance } = useDeviceCapabilities();

  if (isUltraLowPerformance && lightContent) {
    return <>{lightContent}</>;
  }

  return <>{children}</>;
}

export function UltraLightSkeleton() {
  return (
    <div className="w-full flex flex-col space-y-4 p-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
  );
}