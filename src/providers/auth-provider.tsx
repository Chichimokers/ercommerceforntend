import { AuthProvider } from "@refinedev/core";
import { getSession } from "next-auth/react";

export const authProvider: AuthProvider = {
  login: async () => {
    // NextAuth maneja el login directamente
    return {
      success: false,
      error: new Error("Usar el método de login de NextAuth"),
      redirectTo: "/api/auth/signin"
    };
  },
  check: async () => {
    const session = await getSession();
    return session?.accessToken
      ? { success: true, authenticated: true }
      : { success: false, authenticated: false, redirectTo: "/login" };
  },
  logout: async () => {
    // Redirigir al endpoint de logout de NextAuth
    return {
      success: true,
      redirectTo: "/api/auth/signout"
    };
  },
  onError: async (error) => {
    console.error("Error de autenticación:", error);
    return { error };
  },
  getIdentity: async () => {
    const session = await getSession();
    return session?.user || null;
  }
};