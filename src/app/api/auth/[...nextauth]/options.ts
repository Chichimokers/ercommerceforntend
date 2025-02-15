import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJWT } from "@/helpers/jwt-decode";

// Extender la interfaz de Session para incluir propiedades adicionales
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    accessToken?: string;
    error?: string;
    expires?: string;
  }
}

// Extender la interfaz JWT para incluir propiedades adicionales
declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

let refreshingTokenPromise: Promise<any> | null = null;


async function refreshAccessTokenWithLock(token: any) {
  if (refreshingTokenPromise) {
    return refreshingTokenPromise;
  }
  refreshingTokenPromise = refreshAccessToken(token);
  try {
    const newToken = await refreshingTokenPromise;
    return newToken;
  } finally {
    refreshingTokenPromise = null;
  }
}

// Función para renovar el token de acceso
async function refreshAccessToken(token: any) {
  try {
    console.log(
      "Intentando renovar token de acceso. Refresh token:",
      token.refreshToken?.slice(0, 5) + "..."
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      }
    );

    const data = await response.json();
    console.log("Respuesta de renovación:", {
      status: response.status,
      data: { ...data, accessToken: data.accessToken?.slice(0, 15) + "..." },
    });

    if (!response.ok) throw data;

    const payload = await decodeJWT(data.accessToken);
    console.log(
      "Token renovado exitosamente. Nuevo exp:",
      new Date(payload.exp * 1000).toLocaleString()
    );

    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: payload.exp * 1000,
      refreshToken: data.refreshToken || token.refreshToken,
      user: {
        ...token.user,
        id: payload.sub,
        name: payload.username || token.user?.name,
        email: payload.email || token.user?.email,
        role: payload.role || token.user?.role,
      },
    };
  } catch (error) {
    console.error("Error en renovación de token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessTokenExpires: Date.now() - 1000,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID as string,
      clientSecret: process.env.FACEBOOK_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            console.error('Error en la respuesta:', {
              status: res.status,
              error: errorData,
              credentials: credentials?.email
            });
            throw new Error(errorData.message || 'Falló la autenticación');
          }

          const { accessToken, refreshToken } = await res.json();
          const payload = await decodeJWT(accessToken);

          return {
            id: payload.sub,
            name: payload.username,
            email: credentials?.email,
            access_token: accessToken,
            refresh_token: refreshToken,
          };

        } catch (error) {
          console.error("Error de autenticación:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("Ejecutando callback JWT", {
        user: user?.email,
        accountProvider: account?.provider,
      });

      // Para proveedores sociales
      if (account?.provider === 'google' && user) {
        return {
          ...token,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          accessTokenExpires: Date.now() + 900 * 1000, // 15 minutos
        }
      }

      // Primera vez que se ejecuta (durante el login)
      if (account && user) {
        console.log("Nueva autenticación detectada", {
          provider: account.provider,
          userId: user.id,
          tokenExp: new Date((account.expires_at || 0) * 1000).toLocaleString(),
        });

        const finalToken =
          account.provider === "credentials"
            ? user.access_token
            : account.access_token;
        const payload = await decodeJWT(finalToken!);

        return {
          accessToken: finalToken,
          accessTokenExpires: payload.exp * 1000,
          refreshToken: user.refresh_token || account.refresh_token,
          user: {
            id: payload.sub,
            name: payload.username || user.name,
            email: payload.email || user.email,
            role: payload.role,
          },
        };
      }

      // Si no hay una nueva autenticación, se verifica si el token sigue siendo válido
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 30000 // 30 segundos de margen
      ) {
        console.log("Token aún válido, no se requiere renovación");
        console.log(`Tiempo restante ${(token.accessTokenExpires - Date.now()) / 1000}s`)
        return token;
      }

      // Si el token está por expirar o ya expiró, se renueva
      console.log("Iniciando renovación de token");
      const newToken = await refreshAccessTokenWithLock(token);
      return newToken;
    },
    async session({ session, token }) {
      console.log("Actualizando sesión", { user: token.user?.email });
      session.user = {
        id: token.user?.id ?? "",
        name: token.user?.name ?? "",
        email: token.user?.email ?? "",
        role: token.user?.role ?? "",
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      if (token.accessTokenExpires) {
        session.expires = new Date(token.accessTokenExpires).toLocaleString();
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Llamar a tu backend para registrar/validar el usuario
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${account.access_token}`
            }
          });

          if (!response.ok) throw new Error('Error en autenticación Google');

          const { accessToken, refreshToken } = await response.json();

          user.access_token = accessToken;
          user.refresh_token = refreshToken;

        } catch (error) {
          console.error('Google auth error:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);