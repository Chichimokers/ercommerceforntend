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
    idToken: string;
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
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      client: {
        httpOptions: {
          timeout: 30000 // 15 segundos
        }
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      profile: async (profile) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/google/callback`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${profile.accessToken}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          console.log(`Estos son los datos: ${JSON.stringify(data)}`)

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error('Error fetching user data:', error);
          throw new Error('Failed to fetch user data');
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
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
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
            name: payload.name,
            email: credentials?.email,
            accessToken: accessToken,
            refreshToken: refreshToken,
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
      if (account?.provider === 'google' && user) {
        if (account?.id_token) {
          token.id = account.id_token;
        }
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 900 * 1000, // 15 minutos
        }
      }

      // Primera vez que se ejecuta (durante el login)
      if (account && user) {
        console.log("Nueva autenticación detectada", {
          provider: account.provider,
          userId: user.name,
          tokenExp: new Date((account.expires_at || 0) * 1000).toLocaleString(),
        });

        const finalToken =
          account.provider === "credentials"
            ? user.accessToken
            : account.access_token;
        const payload = await decodeJWT(finalToken!);

        return {
          ...token,
          accessToken: finalToken,
          accessTokenExpires: payload.exp * 1000,
          refreshToken: user.refreshToken || account.refreshToken,
          user: {
            id: payload.sub,
            name: user.name,
            email: payload.email || user.email,
            role: payload.role,
          },
        };
      }

      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 30000
      ) {
        console.log("Token aún válido, no se requiere renovación");
        console.log(`Tiempo restante ${(token.accessTokenExpires - Date.now()) / 1000}s`)
        return token;
      }

      console.log("Iniciando renovación de token");
      const newToken = await refreshAccessTokenWithLock(token);
      return newToken;
    },
    async session({ session, token }) {
      console.log("Actualizando sesión", { user: token.user?.email });
      session.idToken = token.idToken as string;
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
    /*async signIn({ account, user, profile }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/google/callback`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${account.access_token}`
              }
            }
          );

          const data = await response.json();

          account.access_token = data.accessToken;
          account.refreshToken = data.refreshToken;
          user.exp = data.expiresIn;
          user.id = data.user.id || profile?.sub
          user.email = data.user.email || profile?.email
          user.name = data.user.name || profile?.name

          return true;
        } catch (error) {
          console.error('Error en callback:', error);
          return false;
        }
      }
      return true;
    }*/
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