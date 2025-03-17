"use client";

import { useSession } from "next-auth/react";

export default function AuthCheckClient({ fallback }: { fallback: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  if (isAuthenticated) {
    return null;
  }

  return <>{fallback}</>;
}