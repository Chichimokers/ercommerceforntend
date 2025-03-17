"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { memo } from "react";

interface ScrollControlsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  isMobile: boolean;
}

export default memo(function ScrollControls({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  isMobile
}: ScrollControlsProps) {
  if (!isMobile) return null;

  return (
    <div className="px-4 sm:px-6 pt-2 pb-1 sm:pt-4 sm:pb-2 relative z-10">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            aria-label="Desplazar a la izquierda"
            className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 
              ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300'}`}
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onScrollRight}
            disabled={!canScrollRight}
            aria-label="Desplazar a la derecha"
            className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 
              ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300'}`}
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});