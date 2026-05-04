import crypto from "node:crypto";

/**
 * Firma URLs de acceso a mesa (`?k=`). Sin `TABLE_JOIN_SECRET` cualquiera podría
 * falsificar enlaces si conociera solo el código corto impreso en UI interna.
 * En desarrollo hay un secreto por defecto (no usar en producción).
 */
function getTableJoinSecret(): string {
  const env = process.env.TABLE_JOIN_SECRET;
  if (env && env.length >= 16) return env;
  throw new Error(
    "TABLE_JOIN_SECRET no está configurado. Define una cadena aleatoria de al menos 16 caracteres.",
  );
}

/** Parámetro `k` para anexar al enlace impreso en el QR del mesero. */
export function signTableJoinProof(qrCode: string): string {
  const trimmed = qrCode.trim();
  return crypto.createHmac("sha256", getTableJoinSecret()).update(trimmed, "utf8").digest("base64url");
}

export function verifyTableJoinProof(qrCode: string, proof: string | undefined): boolean {
  if (!proof?.trim()) return false;
  const expected = signTableJoinProof(qrCode);
  const a = Buffer.from(expected);
  const b = Buffer.from(proof.trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
