import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("\n🚀 Middleware ejecutándose para:", pathname);

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthenticated = !!sessionToken;

  let role = null;
  let isAdmin = false;

  const cartCookie = request.cookies.get("cart")?.value;

  let cartItems = [];
  let hasCart = false;

  try {
    if (cartCookie) {
      cartItems = JSON.parse(cartCookie);
      hasCart = Array.isArray(cartItems) && cartItems.length > 0;
    }
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    hasCart = false;
  }

  console.log("🛒 Estado del carrito:", hasCart ? `Tiene ${cartItems.length} productos` : "Vacío o no existe");

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    role = token?.user?.role;
    isAdmin = String(role) === "2";

    console.log(`🔑 Rol del usuario: ${role} (¿Es admin?: ${isAdmin})`);
  } catch (error) {
    console.error("❌ Error al verificar role:", error);
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?to=${encodeURIComponent(pathname)}`, request.url),
        302
      );
    }

    if (!isAdmin) {
      const accessDeniedUrl = new URL("/access-denied", request.url).toString();

      return new Response(null, {
        status: 302,
        headers: {
          "Location": accessDeniedUrl,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Redirect-Reason": "not-admin"
        }
      });
    }
  }

  if (pathname.startsWith("/checkout")) {
    if (!isAuthenticated) {
      console.log("❌ Redirigiendo a login - no autenticado");
      return NextResponse.redirect(
        new URL(`/login?to=${encodeURIComponent(pathname)}`, request.url),
        302
      );
    }

    if (!hasCart) {
      console.log("⛔ REDIRIGIENDO a shopping-cart - carrito vacío");
      const cartUrl = new URL("/shopping-cart", request.url).toString();

      return new Response(null, {
        status: 302,
        headers: {
          "Location": cartUrl,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Redirect-Reason": "empty-cart"
        }
      });
    }
  }

  if (pathname.startsWith("/orders") && !isAuthenticated) {
    return NextResponse.redirect(
      new URL(`/login?to=${encodeURIComponent(pathname)}`, request.url),
      302
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/orders",
    "/orders/:path*",
    "/checkout",
    "/access-denied"
  ],
};
