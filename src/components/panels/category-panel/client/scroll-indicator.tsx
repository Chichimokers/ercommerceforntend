"use client";

import { memo } from "react";

interface ScrollIndicatorProps {
  scrollPosition: number;
  isMobile: boolean;
}

export default memo(function ScrollIndicator({
  scrollPosition,
  isMobile
}: ScrollIndicatorProps) {
  if (!isMobile) return null;

  return (
    <div className="flex justify-center gap-2 pb-3 sm:pb-6 md:hidden">
      {Array.from({ length: 6 }).map((_, index) => {
        const isActive = index / 6 <= scrollPosition;
        return (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-150 ${isActive
              ? 'bg-blue-500 scale-100'
              : 'bg-gray-300 dark:bg-gray-600 scale-75'
              }`}
          />
        );
      })}
    </div>
  );
});