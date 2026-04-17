import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin: la cookie se valida en layout de servidor (Node), donde `AUTH_SECRET` sí está
 * disponible en Vercel. Aquí solo pasamos la ruta para el redirect `?from=` en login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-bouquet-admin-pathname", pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
