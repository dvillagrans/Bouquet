import { type NextRequest } from "next/server";
export { proxy } from "./middleware-logic";

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
