"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AnimatedButtonsProps {
  isVisible: boolean;
}

export default memo<AnimatedButtonsProps>(function AnimatedButtons({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 opacity-0 z-20 pointer-events-none">
      <Link href="/login" className="contents">
        <div className="
          animate-fade-in-up animation-delay-100
          group
          inline-flex items-center gap-2
          px-8 py-4
          bg-blue-600 hover:bg-blue-700
          text-white font-bold
          rounded-xl
          shadow-lg hover:shadow-blue-500/30
          pointer-events-auto
        ">
          <span>Inicia sesión</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
      <Link href="/register" className="contents">
        <div className="
          animate-fade-in-up animation-delay-200
          inline-flex items-center gap-2
          px-8 py-4
          bg-white hover:bg-gray-50
          text-blue-600 border-2 border-blue-100
          dark:bg-gray-800 dark:hover:bg-gray-750
          dark:text-blue-400 dark:border-blue-900/50
          font-bold rounded-xl
          shadow-sm hover:shadow-md
          pointer-events-auto
        ">
          <span>Crear cuenta</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
});