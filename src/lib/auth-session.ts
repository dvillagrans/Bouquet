/**
 * Sesión unificada firmada con Web Crypto (HMAC-SHA256).
 * Sirve para cualquier AppUser independientemente de su rol.
 */

const COOKIE_NAME = process.env.NODE_ENV === "production"
  ? "__Host-bq_session"
  : "bq_session";

const MAX_SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 días
const MAX_CONCURRENT_SESSIONS = 5;

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

export function sessionCookieName() {
  return COOKIE_NAME;
}

export async function createSessionToken(
  secret: string,
  ttlMs: number,
  claims: { appUserId: string; roles: string[]; iat?: number }
): Promise<string> {
  const exp = Date.now() + ttlMs;
  const iat = claims.iat ?? Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    exp,
    iat,
    aud: "bouquet",
    sub: claims.appUserId,
    roles: claims.roles,
  });
  const raw = encoder().encode(payload);
  const payloadSlice = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  const payloadB64 = bufferToBase64Url(payloadSlice);
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64));
  const sigB64 = bufferToBase64Url(sig);
  const token = `${payloadB64}.${sigB64}`;

  // Seguimiento de sesiones concurrentes
  const userId = claims.appUserId;
  let sessions = activeSessions.get(userId);
  if (!sessions) {
    sessions = new Set();
    activeSessions.set(userId, sessions);
  }
  if (sessions.size >= MAX_CONCURRENT_SESSIONS) {
    const oldest = Array.from(sessions).sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) {
      blacklistToken(oldest.token);
      sessions.delete(oldest);
    }
  }
  sessions.add({ token, createdAt: Date.now() });

  return token;
}

export async function verifySessionToken(
  token: string | undefined,
  secret?: string
): Promise<{ ok: false } | { ok: true; appUserId: string; roles: string[]; iat: number }> {
  if (!token) return { ok: false };
  const resolvedSecret = secret ?? resolveAuthSecret();
  if (!resolvedSecret) return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false };
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return { ok: false };

  const key = await importHmacKey(resolvedSecret);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder().encode(payloadB64)));
  const actual = base64UrlToBuffer(sigB64);
  if (!actual) return { ok: false };
  if (!timingSafeEqual(expected, actual)) return { ok: false };

  const payloadBytes = base64UrlToBuffer(payloadB64);
  if (!payloadBytes) return { ok: false };
  let parsed: { exp?: number; iat?: number; aud?: string; sub?: string; roles?: string[] };
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: number;
      iat?: number;
      aud?: string;
      sub?: string;
      roles?: string[];
    };
  } catch {
    return { ok: false };
  }
  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return { ok: false };
  if (typeof parsed.iat !== "number" || Date.now() - (parsed.iat * 1000) > MAX_SESSION_LIFETIME) return { ok: false };
  if (parsed.aud !== "bouquet") return { ok: false };
  if (typeof parsed.sub !== "string" || parsed.sub.length < 1) return { ok: false };
  if (!Array.isArray(parsed.roles)) return { ok: false };
  if (isTokenBlacklisted(token)) return { ok: false };

  // Session tracker — skipped in dev because HMR resets module state
  if (process.env.NODE_ENV === "production") {
    const sessions = activeSessions.get(parsed.sub);
    if (!sessions || !Array.from(sessions).some((s) => s.token === token)) return { ok: false };
  }

  return { ok: true, appUserId: parsed.sub, roles: parsed.roles, iat: parsed.iat };
}

const AUTH_SECRET_KEYS = ["AUTH_SECRET", "NEXTAUTH_SECRET", "BOUQUET_ADMIN_AUTH_SECRET"] as const;

export function getAuthSecret(): string {
  for (const key of AUTH_SECRET_KEYS) {
    const raw = process.env[key];
    if (typeof raw === "string") {
      const t = raw.trim();
      if (t.length > 0) return t;
    }
  }
  throw new Error(
    "AUTH_SECRET no está configurado. Define una de las siguientes variables de entorno: AUTH_SECRET, NEXTAUTH_SECRET, BOUQUET_ADMIN_AUTH_SECRET"
  );
}

export function resolveAuthSecret(): string {
  return getAuthSecret();
}

const blacklisted = new Map<string, number>(); // token -> exp
const activeSessions = new Map<string, Set<{ token: string; createdAt: number }>>(); // userId -> sessions

function decodeToken(token: string): { exp?: number; iat?: number; sub?: string; aud?: string; roles?: string[] } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payloadB64 = parts[0];
    if (!payloadB64) return null;
    const payloadBytes = base64UrlToBuffer(payloadB64);
    if (!payloadBytes) return null;
    return JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: number;
      iat?: number;
      sub?: string;
      aud?: string;
      roles?: string[];
    };
  } catch {
    return null;
  }
}

export function blacklistToken(token: string) {
  const payload = decodeToken(token);
  if (payload?.exp) blacklisted.set(token, payload.exp);
  if (typeof payload?.sub === "string") {
    const sessions = activeSessions.get(payload.sub);
    if (sessions) {
      const entry = Array.from(sessions).find((s) => s.token === token);
      if (entry) sessions.delete(entry);
      if (sessions.size === 0) activeSessions.delete(payload.sub);
    }
  }
}

export function isTokenBlacklisted(token: string): boolean {
  const exp = blacklisted.get(token);
  if (exp && exp < Date.now()) {
    blacklisted.delete(token);
    return false;
  }
  return blacklisted.has(token);
}

export async function refreshSessionToken(token: string, ttlMs = 30 * 24 * 60 * 60 * 1000): Promise<string> {
  const secret = resolveAuthSecret();
  const verifyResult = await verifySessionToken(token, secret);
  if (!verifyResult.ok) throw new Error("Invalid token");
  const newToken = await createSessionToken(secret, ttlMs, {
    appUserId: verifyResult.appUserId,
    roles: verifyResult.roles,
    iat: verifyResult.iat,
  });
  // Reemplazar token antiguo en el tracker
  const sessions = activeSessions.get(verifyResult.appUserId);
  if (sessions) {
    const oldEntry = Array.from(sessions).find((s) => s.token === token);
    if (oldEntry) sessions.delete(oldEntry);
    sessions.add({ token: newToken, createdAt: Date.now() });
  }
  return newToken;
}

export function invalidateAllSessions(userId: string) {
  const sessions = activeSessions.get(userId);
  if (sessions) {
    for (const s of sessions) {
      blacklistToken(s.token);
    }
    sessions.clear();
    activeSessions.delete(userId);
  }
}
