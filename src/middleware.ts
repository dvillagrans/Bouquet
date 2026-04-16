import { NextResponse, type NextRequest } from "next/server";
import { adminSessionCookieName, resolveAdminAuthSecret, verifyAdminSessionToken } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    const secretEarly = resolveAdminAuthSecret();
    if (secretEarly) {
      const tokenEarly = request.cookies.get(adminSessionCookieName())?.value;
      const already = await verifyAdminSessionToken(tokenEarly, secretEarly);
      if (already) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  const secret = resolveAdminAuthSecret();

  if (!secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "missing_secret");
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(adminSessionCookieName())?.value;
  const ok = await verifyAdminSessionToken(token, secret);
  if (!ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
