import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const cookiesHeader = request.headers.get("cookie") || "";
  console.log("Encabezado de cookies recibido:", cookiesHeader);

  const isAuthenticated =
    cookiesHeader.includes("next-auth.session-token") ||
    cookiesHeader.includes("__Secure-next-auth.session-token");

  const hasCartItems = cookiesHeader.includes("cart");
  const isEmailValidated = cookiesHeader.includes("emailValidated");

  const pathname = request.nextUrl.pathname;

  // 🔒 Bloquear acceso a rutas protegidas
  if (["/buy", "/orders"].includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🛒 Requerir sesión + carrito lleno + email validado en /buy
  if (pathname === "/buy" && (!isAuthenticated || !hasCartItems || !isEmailValidated)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔐 Bloquear acceso no autorizado a /admin/*
  if (pathname.startsWith("/admin") && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/login?to=${pathname}`, request.url));
  }

  // 🔄 Redirigir a /admin si el usuario ya está autenticado e intenta ir a /login
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buy", "/admin/:path*", "/orders"],
};
