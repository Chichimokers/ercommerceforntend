import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJWT } from "@/helpers/jwt-decode";
import { cookies } from "next/headers";

let refreshingTokenPromise: Promise<any> | null = null;


async function refreshaccesstokenWithLock(token: any) {
  if (refreshingTokenPromise) {
    return refreshingTokenPromise;
  }
  refreshingTokenPromise = refreshaccesstoken(token);
  try {
    const newToken = await refreshingTokenPromise;
    return newToken;
  } finally {
    refreshingTokenPromise = null;
  }
}

// Función para renovar el token de acceso
async function refreshaccesstoken(token: any) {
  try {
    /*console.log(
      "Intentando renovar token de acceso. Refresh token:",
      token.refresh_token?.slice(0, 5) + "..."
    );*/
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: token.refresh_token,
        }),
      }
    );

    const data = await response.json();
    /*console.log("Respuesta de renovación:", {
      status: response.status,
      data: { ...data, access_token: data.access_token?.slice(0, 15) + "..." },
    });*/

    if (!response.ok) throw data;

    const payload = await decodeJWT(data.access_token);
    /*console.log(
      "Token renovado exitosamente. Nuevo exp:",
      new Date(payload.exp * 1000).toLocaleString()
    );*/

    return {
      ...token,
      access_token: data.access_token,
      accessTokenExpires: payload.exp * 1000,
      refresh_token: data.refresh_token || token.refresh_token,
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
      error: "Refreshaccess_tokenError",
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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        }
      },
      client: {
        httpOptions: {
          timeout: 30000 // 30 segundos
        }
      },
      profile: (profile) => {
        /*console.log("Perfil de Google recibido:", {
          id: profile.sub,
          email: profile.email,
          name: profile.name
        });*/

        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
        };
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

          const data = await res.json();
          //console.log(`Estos son los datos que me llegan: `, JSON.stringify(data))
          const { access_token, refresh_token } = data;
          const payload = await decodeJWT(access_token);

          return {
            id: payload.sub,
            name: payload.name,
            email: credentials?.email,
            access_token: access_token,
            refresh_token: refresh_token,
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
      if (account?.provider === 'google' && account?.id_token && !token.access_token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/google/token-exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: account.id_token })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en intercambio');
          }

          const data = await response.json();
          const payload = await decodeJWT(data.access_token);

          if (!data.refresh_token) {
            throw new Error('Falta refresh_token en la respuesta');
          }

          return {
            ...token,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            accessTokenExpires: payload.exp * 1000,
            user: {
              id: payload.sub,
              name: payload.name || token.user?.name,
              email: payload.email || token.user?.email,
              role: payload.role || token.user?.role
            }
          };
        } catch (error) {
          console.error('Error detallado:', error);
          return { ...token, error: 'GoogleExchangeError' };
        }
      }

      if (account && user) {
        /*console.log("Nueva autenticación detectada", {
          provider: account.provider,
          userId: user.name,
          tokenExp: new Date((account.expires_at || 0) * 1000).toLocaleString(),
        });*/

        const finalToken =
          account.provider === "credentials"
            ? user.access_token
            : account.access_token;
        const payload = await decodeJWT(finalToken!);

        return {
          ...token,
          access_token: finalToken,
          accessTokenExpires: payload.exp * 1000,
          refresh_token: user.refresh_token || account.refresh_token,
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
        //console.log("Token aún válido, no se requiere renovación");
        //console.log(`Tiempo restante ${(token.accessTokenExpires - Date.now()) / 1000}s`)
        return token;
      }

      //console.log("Iniciando renovación de token");
      try {
        const newToken = await refreshaccesstokenWithLock(token);
        return newToken;
      } catch (error) {
        console.error("Error crítico en renovación de token:", error);
        return { ...token, error: "RefreshTokenFailed", accessTokenExpires: 0 };
      }
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
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.error = token.error;
      if (token.accessTokenExpires) {
        session.expires = new Date(token.accessTokenExpires).toLocaleString();
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Si la URL de redirección es al checkout, verificar el carrito
      if (url.startsWith(`${baseUrl}/checkout`)) {
        try {
          // Intentar obtener el carrito desde la cookie
          const cartCookie = (await cookies()).get("cart")?.value || (await cookies()).get("cart-legacy")?.value;
          const hasItems = cartCookie && (
            (cartCookie.includes('"cart":') && JSON.parse(cartCookie)?.state?.cart?.length > 0) ||
            (!cartCookie.includes('"cart":') && JSON.parse(cartCookie)?.length > 0)
          );

          if (!hasItems) {
            // Si no hay items, redireccionar a productos
            return `${baseUrl}/products?empty=true`;
          }
        } catch (e) {
          console.error("Error verificando carrito en callback:", e);
        }
      }

      // Comportamiento predeterminado: redireccionar a la URL solicitada
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },

  events: {
    async signIn({ user, account, profile }) {
      /*console.log("Evento signIn ejecutado", {
        user: user.email,
        account,
        profile,
      });*/
    },
    async session({ session, token }) {
      // Usar esta función para sincronizar el access token con una cookie
      if (token.access_token) {
        const secureCookie = process.env.NODE_ENV === "production";
        const cookieName = secureCookie ? "__Secure-next-auth.access-token" : "next-auth.access-token";

        // Configuración de la cookie
        const cookieOptions = {
          httpOnly: true,
          secure: secureCookie,
          sameSite: "lax" as const,
          path: "/",
          maxAge: token.accessTokenExpires ?
            Math.floor((token.accessTokenExpires - Date.now()) / 1000) :
            24 * 60 * 60, // 1 día por defecto
        };

        // Esta cookie será establecida en la respuesta
        // @ts-ignore - Este campo existe pero no está tipado correctamente
        session.cookie = {
          name: cookieName,
          value: token.access_token,
          options: cookieOptions
        };
      }
    }
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "development",
        path: "/",
      },
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);