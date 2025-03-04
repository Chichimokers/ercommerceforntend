"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/50 dark:from-blue-800/20 via-purple-100/10 dark:via-purple-500/10 to-gray-100 dark:to-gray-900 pt-16">
      <nav className="container mx-auto p-4 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 bg-white/50 dark:bg-gray-900/50 py-2 px-4 rounded-full backdrop-blur-lg shadow-sm"
        >
          <AuthLink href="/login" label="Iniciar Sesión" active={pathname === "/login"} />
          <AuthLink href="/register" label="Registrarse" active={pathname === "/register"} />
        </motion.div>
      </nav>

      {/* Contenido de la página */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="container mx-auto flex justify-center items-center min-h-[70vh] pb-8"
      >
        <div className="bg-white/20 dark:bg-gray-900/50 rounded-3xl backdrop-blur-lg w-full max-w-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function AuthLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="relative px-6 py-2 rounded-full transition-all duration-300">
      {active && (
        <motion.div
          layoutId="authTab"
          className="absolute inset-0 bg-blue-700 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
      <span className={`relative z-10 text-sm md:text-base font-medium ${active ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
        {label}
      </span>
    </Link>
  );
}
