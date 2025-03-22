"use client";

import { memo } from "react";

interface AnimatedBackgroundProps {
  isVisible: boolean;
  prefersReducedMotion: boolean;
}

export default memo<AnimatedBackgroundProps>(function AnimatedBackground({
  isVisible,
  prefersReducedMotion
}) {
  if (prefersReducedMotion) return null;

  return (
    <div
      className="absolute inset-0 z-0"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={`
          absolute top-0 -left-48 w-96 h-96 
          bg-blue-400 dark:bg-blue-700 rounded-full 
          mix-blend-multiply opacity-20 dark:opacity-10
          transition-transform duration-[10s] ease-in-out
          ${isVisible ? 'animate-float' : ''}
        `}
        style={{
          willChange: 'transform',
        }}
      />

      <div
        className={`
          absolute bottom-0 -right-48 w-96 h-96 
          bg-purple-400 dark:bg-purple-700 rounded-full 
          mix-blend-multiply opacity-20 dark:opacity-10
          transition-transform duration-[12s] ease-in-out
          ${isVisible ? 'animate-float-reverse' : ''}
        `}
        style={{
          willChange: 'transform',
          animationDelay: '1s'
        }}
      />
    </div>
  );
});