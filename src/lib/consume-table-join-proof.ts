import { redirect } from "next/navigation";

function pickK(searchParams: Record<string, string | string[] | undefined>): string {
  const raw = searchParams.k;
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw) && raw[0]) return raw[0].trim();
  return "";
}

/**
 * Si la URL trae `?k=` (QR firmado), redirige al Route Handler que puede fijar la cookie `bq_gate_*`.
 * Las Server Components no pueden usar `cookies().set` en Next.js 16+.
 */
export function consumeTableJoinProofQuery(
  decodedCodigoFromPath: string,
  searchParams: Record<string, string | string[] | undefined>,
  destinationPath: string,
): void {
  const k = pickK(searchParams);
  if (!k) return;

  const dest = destinationPath.startsWith("/") ? destinationPath : `/${destinationPath}`;
  const qs = new URLSearchParams({
    code: decodedCodigoFromPath,
    k,
    dest,
  });
  redirect(`/api/mesa/join-proof?${qs.toString()}`);
}
