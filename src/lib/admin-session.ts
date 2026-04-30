/**
 * Sesión admin firmada con Web Crypto (HMAC-SHA256).
 * Sirve en proxy (Edge) y en route handlers (Node).
 * Soporta login centralizado AppUser + UserRole.
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
 * - **Producción** (`NODE_ENV=production`): define `AUTH_SECRET`. Si falta, el proxy
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
  claims: { appUserId: string; roles: string[] }
): Promise<string> {
  const exp = Date.now() + ttlMs;
  const payload = JSON.stringify({
    exp,
    aud: "bouquet_admin",
    sub: claims.appUserId,
    roles: claims.roles,
  });
  const raw = encoder().encode(payload);
  const payloadSlice = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  const payloadB64 = bufferToBase64Url(payloadSlice);
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64));
  const sigB64 = bufferToBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string
): Promise<{ ok: false } | { ok: true; appUserId: string; roles: string[] }> {
  if (!token || !secret) return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false };
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return { ok: false };

  const key = await importHmacKey(secret);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64)));
  const actual = base64UrlToBuffer(sigB64);
  if (!actual) return { ok: false };
  if (!timingSafeEqual(expected, actual)) return { ok: false };

  const payloadBytes = base64UrlToBuffer(payloadB64);
  if (!payloadBytes) return { ok: false };
  let parsed: { exp?: number; aud?: string; sub?: string; roles?: string[] };
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: number;
      aud?: string;
      sub?: string;
      roles?: string[];
    };
  } catch {
    return { ok: false };
  }
  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return { ok: false };
  if (parsed.aud !== "bouquet_admin") return { ok: false };
  if (typeof parsed.sub !== "string" || parsed.sub.length < 1) return { ok: false };
  if (!Array.isArray(parsed.roles)) return { ok: false };

  return { ok: true, appUserId: parsed.sub, roles: parsed.roles };
}

const ADMIN_AUTH_SECRET_KEYS = ["AUTH_SECRET", "NEXTAUTH_SECRET", "BOUQUET_ADMIN_AUTH_SECRET"] as const;

/**
 * Lee el secreto en runtime con `process.env[key]`.
 * En el Middleware (Edge) en Vercel, el acceso directo `process.env.AUTH_SECRET` a veces
 * queda inlinado vacío en el build; la forma dinámica evita eso y coincide con la guía de Next.
 */
export function getAdminAuthSecret(): string | undefined {
  for (const key of ADMIN_AUTH_SECRET_KEYS) {
    const raw = process.env[key];
    if (typeof raw === "string") {
      const t = raw.trim();
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

export function resolveAdminAuthSecret(): string | undefined {
  const fromEnv = getAdminAuthSecret();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return DEV_ADMIN_AUTH_SECRET_FALLBACK;
  if (process.env.BOUQUET_ADMIN_ALLOW_DEV_AUTH_SECRET === "1") return DEV_ADMIN_AUTH_SECRET_FALLBACK;
  return undefined;
}
