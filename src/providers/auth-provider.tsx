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
    if (!session?.accessToken) {
      return {
        success: false,
        redirectTo: "/login",
        authenticated: false
      };
    }
    return { success: true, authenticated: true };
  },
  logout: async () => ({
    success: true,
    redirectTo: "/api/auth/signout"
  }),
  onError: async (error) => {
    console.error("Error de autenticación:", error);
    return { error };
  },
  getIdentity: async () => {
    try {
      const session = await getSession();
      return session?.user ?? null;
    } catch (error) {
      console.error("Error obteniendo identidad:", error);
      return null;
    }
  }
};
