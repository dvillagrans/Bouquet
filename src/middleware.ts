import { NextResponse, type NextRequest } from "next/server";

const RESTAURANT_COOKIE = "bq_restaurant_id";

/**
 * Admin: la cookie se valida en layout de servidor (Node), donde `AUTH_SECRET` sí está
 * disponible en Vercel. Aquí solo pasamos la ruta para el redirect `?from=` en login.
 *
 * `/restaurant/[id]/...` reescribe al route handler real y fija `bq_restaurant_id`.
 * Rutas tipo `/restaurant/[id]/cocina` → `/cocina`, `/restaurant/[id]/mesero` → `/mesero`; el resto → `/dashboard/...`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/restaurant/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return NextResponse.next();
    }
    const restaurantId = segments[1]!;
    const rest = segments.slice(2);
    let internalPath: string;
    if (rest.length === 0) {
      internalPath = "/dashboard";
    } else if (rest[0] === "cocina" || rest[0] === "mesero") {
      internalPath = `/${rest.join("/")}`;
    } else {
      internalPath = `/dashboard/${rest.join("/")}`;
    }
    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    const res = NextResponse.rewrite(url);
    res.cookies.set(RESTAURANT_COOKIE, restaurantId, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
    return res;
  }

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
  matcher: ["/admin/:path*", "/restaurant/:path*"],
};
