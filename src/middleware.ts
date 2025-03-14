import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJWT } from "@/helpers/jwt-decode";

export async function middleware(request: NextRequest) {
  console.log("🔒 Middleware ejecutándose para:", request.nextUrl.pathname);

  // 1. Verificación de autenticación mejorada
  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // 2. Verificar access token explícitamente
  const accessToken = request.cookies.get("next-auth.access-token")?.value ||
    request.cookies.get("__Secure-next-auth.access-token")?.value;

  console.log("📝 Session token:", sessionToken ? "Presente" : "Ausente");
  console.log("📝 Access token:", accessToken ? "Presente" : "Ausente");

  const isAuthenticated = !!sessionToken;

  // 3. Decodificar token para verificar rol
  let isAdmin = false;
  if (accessToken) {
    try {
      const payload = await decodeJWT(accessToken);
      console.log("🔑 Token decodificado:", JSON.stringify({
        sub: payload.sub,
        role: payload.role
      }));

      // Verifica todas las posibles ubicaciones del rol en el payload
      isAdmin =
        payload.role === 'admin' ||
        payload.role === 1 || // Si el rol es numérico
        payload.user?.role === 'admin' ||
        payload.profile?.role === 'admin';

      console.log("👑 ¿Es admin?:", isAdmin);
    } catch (error) {
      console.error("❌ Error al decodificar token:", error);
    }
  } else if (sessionToken) {
    console.warn("⚠️ No hay access_token disponible, intentando usar session token...");
    // Intento de fallback con session token
    try {
      const payload = await decodeJWT(sessionToken);
      isAdmin =
        payload.role === 'admin' ||
        payload.role === 1 ||
        payload.user?.role === 'admin';
    } catch (error) {
      console.error("❌ Error al decodificar session token:", error);
    }
  }

  // Procesamiento del carrito (mantener tu código existente)
  const getCartItems = () => {
    try {
      // Obtener la cookie cart
      const cartCookie = request.cookies.get("cart")?.value;

      if (!cartCookie) {
        return null;
      }

      // Decodificar si está codificada como URL
      const decodedCart = decodeURIComponent(cartCookie);

      // Intentar parsearlo como JSON
      const cartData = JSON.parse(decodedCart);

      // Verificar si es un array no vacío
      if (Array.isArray(cartData) && cartData.length > 0) {
        console.log(`Carrito tiene ${cartData.length} elementos`);
        return cartData;
      }

      console.log("Carrito está vacío (array sin elementos)");
      return null;
    } catch (error) {
      console.error("Error al analizar datos del carrito:", error);
      return null;
    }
  };

  // Usamos la función para determinar si hay items en el carrito
  const cartItems = getCartItems();
  const hasCartItems = cartItems !== null && cartItems.length > 0;

  const pathname = request.nextUrl.pathname;

  // 4. Protección de rutas administrativas
  /*if (pathname.startsWith("/admin")) {

    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?to=${encodeURIComponent(pathname)}`, request.url)
      );
    }

    // Si está autenticado pero no es admin, acceso denegado
    if (!isAdmin) {
      return NextResponse.redirect(
        new URL("/acceso-denegado?reason=admin_required", request.url)
      );
    }

    console.log("✅ Acceso permitido a área admin");
  }*/

  // El resto de tu middleware para otras rutas se mantiene igual
  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
    if (!isAuthenticated) {
      const redirectUrl = new URL(
        `/login?to=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname === "/buy") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!hasCartItems) {
      return NextResponse.redirect(new URL("/cart", request.url));
    }
  }

  if (isAuthenticated && pathname === "/login") {
    console.log("Usuario ya autenticado, redirigiendo desde /login");
    // Si es admin, enviar a /admin, de lo contrario a home
    const redirectTo = request.nextUrl.searchParams.get("to") ||
      (isAdmin ? "/admin" : "/");
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

// Configuración del matcher
export const config = {
  matcher: ["/admin/:path*", "/orders", "/orders/:path*", "/buy"],
};
