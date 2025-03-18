"use client";

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
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col">

      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="container mx-auto flex flex-col items-center">
          <nav className="w-full max-w-md">
            <div
              className="flex items-center gap-1 bg-white/70 dark:bg-gray-900/70 py-1.5 px-2 rounded-xl backdrop-blur-md shadow-lg shadow-blue-900/5 dark:shadow-blue-500/5 border border-white/50 dark:border-gray-800"
            >
              <AuthLink href="/login" label="Iniciar Sesión" active={pathname === "/login"} />
              <AuthLink href="/register" label="Registrarse" active={pathname === "/register"} />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto flex justify-center items-center px-4 py-6 md:py-12">
        <div
          key={pathname}
          className="w-full max-w-lg"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl backdrop-blur-xl overflow-hidden shadow-xl shadow-blue-900/10 dark:shadow-blue-500/5 border border-white/60 dark:border-gray-800/60">
            {mounted && children}
          </div>
        </div>
      </main>
    </div>
  );
}

function AuthLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="relative w-full">
      <div className="px-4 py-2 rounded-lg text-center transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/5">
        {active && (
          <div
            className="absolute inset-0 bg-blue-600 rounded-lg shadow-md"
          />
        )}
        <span className={`relative z-10 text-sm font-medium ${active ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}
