import { NextRequest, NextResponse } from "next/server";

import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { verifyTableJoinProof } from "@/lib/table-join-proof";

const GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** Mantiene la ruta bajo `/mesa/` pero sustituye el segmento del código por el canónico de BD. */
function normalizeMesaPath(pathname: string, canonicalQr: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "mesa" || parts.length < 2) return null;
  const tail = parts.slice(2);
  const base = `/mesa/${encodeURIComponent(canonicalQr)}`;
  if (tail.length === 0) return `${base}/`;
  return `${base}/${tail.join("/")}`;
}

/**
 * Establece `bq_gate_*` (solo permitido en Route Handler) y redirige a la ruta de mesa sin `?k=`.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  const k = request.nextUrl.searchParams.get("k")?.trim() ?? "";
  const dest = request.nextUrl.searchParams.get("dest")?.trim() ?? "";

  const site = new URL(request.url);
  if (!code || !k || !dest.startsWith("/")) {
    return NextResponse.redirect(new URL("/", site.origin));
  }

  const destUrl = new URL(dest, site.origin);
  if (destUrl.origin !== site.origin) {
    return NextResponse.redirect(new URL("/", site.origin));
  }
  if (!destUrl.pathname.startsWith("/mesa/")) {
    return NextResponse.redirect(new URL("/", site.origin));
  }

  const table = await findTableByQrCode(code);
  if (!table || !verifyTableJoinProof(table.publicCode, k)) {
    return NextResponse.redirect(new URL(`/mesa/${encodeURIComponent(code)}/`, site.origin));
  }

  const normalized = normalizeMesaPath(destUrl.pathname, table.publicCode);
  if (!normalized) {
    return NextResponse.redirect(new URL("/", site.origin));
  }

  const finalUrl = new URL(normalized + destUrl.search, site.origin);
  const res = NextResponse.redirect(finalUrl);
  res.cookies.set(`bq_gate_${table.publicCode}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: GATE_COOKIE_MAX_AGE,
  });
  return res;
}
