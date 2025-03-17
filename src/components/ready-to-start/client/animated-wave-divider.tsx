"use client";

import { memo } from "react";

export default memo(function AnimatedWaveDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
      <svg
        className="relative w-full h-16 sm:h-24 text-white dark:text-gray-900"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="animate-wave-slow"
          d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3L1200,107L1200,320L0,320Z"
          fill="currentColor"
          fillOpacity="1"
        />
        <path
          className="animate-wave opacity-30"
          d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,128C960,117,1056,139,1152,144L1200,144L1200,320L0,320Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
});