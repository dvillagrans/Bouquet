import { type NextRequest } from "next/server";
import { proxy } from "./src/proxy";

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cadena/:path*",
    "/zona/:path*",
    "/dashboard/:path*",
    "/mesero/:path*",
    "/cocina/:path*",
    "/barra/:path*",
    "/restaurant/:path*",
  ],
};
