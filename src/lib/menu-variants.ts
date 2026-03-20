export type MenuVariant = { name: string; price: number };

export function parseVariantsJson(v: unknown): MenuVariant[] {
  if (!Array.isArray(v)) return [];
  const out: MenuVariant[] = [];
  for (const el of v) {
    if (!el || typeof el !== "object") continue;
    const name = (el as { name?: unknown }).name;
    const price = (el as { price?: unknown }).price;
    if (typeof name !== "string" || typeof price !== "number" || !Number.isFinite(price)) continue;
    out.push({ name: name.trim(), price });
  }
  return out;
}
