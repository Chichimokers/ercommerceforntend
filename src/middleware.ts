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

  let cartItems = [];
  let hasCart = false;

  try {
    let cartCookie = request.cookies.get("cart-legacy")?.value;

    if (!cartCookie) {
      cartCookie = request.cookies.get("cart")?.value;
      if (cartCookie) {
        const zustandData = JSON.parse(cartCookie);
        cartItems = zustandData?.state?.cart || [];
      }
    } else {
      // Parsear directamente la cookie legacy
      cartItems = JSON.parse(cartCookie);
    }

    hasCart = Array.isArray(cartItems) && cartItems.length > 0;
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

  let hasLocation = false;
  try {
    const locationCookie = request.cookies.get("user-location-storage")?.value;

    if (locationCookie) {
      console.log("📍 Cookie de ubicación encontrada");

      try {
        const locationData = JSON.parse(decodeURIComponent(locationCookie));

        // Extraer ubicación de cualquiera de las estructuras posibles
        const location =
          locationData?.state?.location ||
          locationData?.location ||
          (locationData?.province ? locationData : null);

        // Comprobar si la ubicación tiene datos válidos
        hasLocation = !!(
          location?.province &&
          location?.municipality &&
          location.province.trim() !== "" &&
          location.municipality.trim() !== ""
        );

        const isUuid = (value: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

        if (
          !hasLocation &&
          location?.province &&
          location?.municipality &&
          isUuid(location.province) &&
          isUuid(location.municipality)
        ) {
          console.log("📍 Ubicación con UUIDs detectada, considerando válida");
          hasLocation = true;
        }

        console.log("📍 Estado de ubicación:", hasLocation ?
          `Ubicación válida - ${location?.province?.substring(0, 8)}..., ${location?.municipality?.substring(0, 8)}...` :
          "No configurada o incompleta");
      } catch (e) {
        console.error("📍 Error al analizar cookie de ubicación:", e);
        hasLocation = false;
      }
    } else {
      console.log("📍 No hay cookie de ubicación");

      // SOLUCIÓN TEMPORAL: Si no hay cookie pero estamos en desarrollo, permitir acceso
      if (process.env.NODE_ENV === 'development') {
        const host = request.headers.get('host') || '';
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          console.log("📍 Entorno de desarrollo detectado, permitiendo acceso");
          hasLocation = true;
        }
      }
    }
  } catch (error) {
    console.error("❌ Error general al verificar ubicación:", error);
    hasLocation = false;
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
      return NextResponse.redirect(
        new URL(`/login?to=${encodeURIComponent(pathname)}&from=protected`, request.url),
        302
      );
    }

    if (!hasCart) {
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

  if (pathname.startsWith("/products") && !pathname.includes("/products/")) {
    if (!hasLocation) {
      console.log("📍 Redirigiendo a selección de ubicación forzada");
      return NextResponse.redirect(
        new URL(`/?locationRequired=true`, request.url),
        302
      );
    }
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
    "/access-denied",
    "/products",
  ],
};
