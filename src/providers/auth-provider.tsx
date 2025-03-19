import { AuthProvider } from "@refinedev/core";
import { getSession } from "next-auth/react";

export const authProvider: AuthProvider = {
  login: async () => {
    return {
      success: false,
      error: new Error("Usar el método de login de NextAuth"),
      redirectTo: "/api/auth/signin"
    };
  },
  check: async () => {
    const session = await getSession();
    
    if (!session?.access_token) {
      // Obtener la URL actual para redirigir después del login
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const redirectPath = currentPath.startsWith('/admin') ? `/login?to=${encodeURIComponent('/admin')}` : '/login';
      
      return {
        success: false,
        redirectTo: redirectPath,
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
    
    if (error.response?.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const redirectPath = currentPath.startsWith('/admin') ? `/login?to=${encodeURIComponent('/admin')}` : '/login';
      
      return {
        logout: true,
        redirectTo: redirectPath
      };
    }
    
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
