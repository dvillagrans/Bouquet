/** Prefijo `/restaurant/[id]` si la URL actual está bajo ese espacio (rewrite → /dashboard). */
export function restaurantBaseFromPathname(pathname: string): string | null {
  const m = pathname.match(/^\/restaurant\/([^/]+)/);
  return m ? `/restaurant/${m[1]}` : null;
}

/** Normaliza pathname del navegador al path “canónico” usado en navGroups (`/dashboard/...`). */
export function toCanonicalDashboardPath(pathname: string): string {
  const m = pathname.match(/^\/restaurant\/[^/]+(.*)$/);
  if (!m) return pathname;
  let tail = (m[1] || "").replace(/\/+$/, "") || "";
  if (!tail) return "/dashboard";
  if (!tail.startsWith("/")) tail = `/${tail}`;
  return `/dashboard${tail}`;
}

/** Convierte href canónico del sidebar al href real (`/restaurant/id/mesas` o `/dashboard/mesas`). */
export function resolveNavHref(canonicalHref: string, restaurantBase: string | null): string {
  if (!restaurantBase) return canonicalHref;
  if (canonicalHref === "/dashboard") return restaurantBase;
  if (canonicalHref.startsWith("/dashboard/")) {
    return `${restaurantBase}${canonicalHref.slice("/dashboard".length)}`;
  }
  return canonicalHref;
}
