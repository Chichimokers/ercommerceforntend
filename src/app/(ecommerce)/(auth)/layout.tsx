"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <nav className="container mx-auto p-6 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 relative"
        >
          <div className="flex gap-2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg">
            <Link
              href="/login"
              className={`relative px-6 py-2 rounded-full transition-all duration-300 ${pathname === "/login"
                ? "text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
            >
              {pathname === "/login" && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className="relative z-10">Iniciar Sesión</span>
            </Link>
            <Link
              href="/register"
              className={`relative px-6 py-2 rounded-full transition-all duration-300 ${pathname === "/register"
                ? "text-white"
                : "hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
            >
              {pathname === "/register" && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className="relative z-10">Registrarse</span>
            </Link>
          </div>
        </motion.div>
      </nav>

      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent dark:from-purple-900/20" />
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-100px)] relative"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}