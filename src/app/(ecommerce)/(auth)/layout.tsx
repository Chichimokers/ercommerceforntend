"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-950 flex flex-col">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-blue-200/20 dark:bg-blue-700/10 blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-purple-200/30 dark:bg-purple-700/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-blue-100/20 dark:bg-blue-800/10 blur-3xl"></div>

        {/* Patrón de puntos */}
        <div className="absolute inset-0 bg-[url('/auth-pattern.svg')] bg-repeat opacity-5 dark:opacity-10"></div>
      </div>

      {/* Logo y nav superior */}
      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="container mx-auto flex flex-col items-center">
          <nav className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-1 bg-white/70 dark:bg-gray-900/70 py-1.5 px-2 rounded-xl backdrop-blur-md shadow-lg shadow-blue-900/5 dark:shadow-blue-500/5 border border-white/50 dark:border-gray-800"
            >
              <AuthLink href="/login" label="Iniciar Sesión" active={pathname === "/login"} />
              <AuthLink href="/register" label="Registrarse" active={pathname === "/register"} />
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 relative z-10 container mx-auto flex justify-center items-center px-4 py-6 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl backdrop-blur-xl overflow-hidden shadow-xl shadow-blue-900/10 dark:shadow-blue-500/5 border border-white/60 dark:border-gray-800/60">
              {mounted && children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuthLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="relative w-full">
      <div className="px-4 py-2 rounded-lg text-center transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/5">
        {active && (
          <motion.div
            layoutId="authTab"
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-md"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <span className={`relative z-10 text-sm font-medium ${active ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}
