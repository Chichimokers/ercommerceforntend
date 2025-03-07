import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const cookiesHeader = request.headers.get("cookie") || "";
  console.log("Encabezado de cookies recibido:", cookiesHeader);

  const isAuthenticated =
    cookiesHeader.includes("next-auth.session-token") ||
    cookiesHeader.includes("__Secure-next-auth.session-token");

  const hasCartItems = cookiesHeader.includes("cart");

  const pathname = request.nextUrl.pathname;

  if (["/buy", "/orders"].includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/buy" && (!isAuthenticated || !hasCartItems)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/login?to=${pathname}`, request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buy", "/admin/:path*", "/orders"],
};
