/**
 * Sesión admin firmada con Web Crypto (HMAC-SHA256).
 * Sirve en middleware (Edge) y en route handlers (Node).
 */

const COOKIE_NAME = "bq_admin_session";

/**
 * Secreto HMAC para firmar la cookie de sesión admin (`bq_admin_session`).
 *
 * **Variable recomendada:** `AUTH_SECRET` (misma convención que Auth.js / NextAuth v5).
 *
 * Orden de resolución (gana la primera definida):
 * 1. `AUTH_SECRET`
 * 2. `NEXTAUTH_SECRET` (legado NextAuth v4)
 * 3. `BOUQUET_ADMIN_AUTH_SECRET` (compatibilidad con despliegues antiguos)
 *
 * - **Producción** (`NODE_ENV=production`): define `AUTH_SECRET`. Si falta, el middleware
 *   usa `?error=missing_secret`.
 * - **`next dev`**: sin ninguna, fallback interno de desarrollo.
 * - **`next start` local** sin secret: `BOUQUET_ADMIN_ALLOW_DEV_AUTH_SECRET=1` (solo tu máquina).
 */
export const DEV_ADMIN_AUTH_SECRET_FALLBACK = "bouquet-dev-admin-auth-secret-change-me-32";

function encoder() {
  return new TextEncoder();
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBuffer(s: string): Uint8Array | null {
  try {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const base64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

export function adminSessionCookieName() {
  return COOKIE_NAME;
}

export async function createAdminSessionToken(
  secret: string,
  ttlMs: number,
  claims: { superAdminId: string }
): Promise<string> {
  const exp = Date.now() + ttlMs;
  const payload = JSON.stringify({
    exp,
    role: "super_admin" as const,
    sid: claims.superAdminId,
  });
  const raw = encoder().encode(payload);
  const payloadSlice = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  const payloadB64 = bufferToBase64Url(payloadSlice);
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64));
  const sigB64 = bufferToBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  const key = await importHmacKey(secret);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64)));
  const actual = base64UrlToBuffer(sigB64);
  if (!actual) return false;
  if (!timingSafeEqual(expected, actual)) return false;

  const payloadBytes = base64UrlToBuffer(payloadB64);
  if (!payloadBytes) return false;
  let parsed: { exp?: number; role?: string; sid?: string };
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number; role?: string; sid?: string };
  } catch {
    return false;
  }
  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return false;
  if (parsed.role !== "super_admin" || typeof parsed.sid !== "string" || parsed.sid.length < 1) return false;
  return true;
}

export function getAdminAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.BOUQUET_ADMIN_AUTH_SECRET?.trim() ||
    undefined
  );
}

export function resolveAdminAuthSecret(): string | undefined {
  const fromEnv = getAdminAuthSecret();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return DEV_ADMIN_AUTH_SECRET_FALLBACK;
  if (process.env.BOUQUET_ADMIN_ALLOW_DEV_AUTH_SECRET === "1") return DEV_ADMIN_AUTH_SECRET_FALLBACK;
  return undefined;
}
