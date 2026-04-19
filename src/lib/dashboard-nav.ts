/** Prefijo `/restaurant/[id]` si la URL actual está bajo ese espacio (rewrite a `/dashboard`, `/cocina` o `/mesero`). */
export function restaurantBaseFromPathname(pathname: string): string | null {
  const m = pathname.match(/^\/restaurant\/([^/]+)/);
  return m ? `/restaurant/${m[1]}` : null;
}

/** Normaliza pathname del navegador al path “canónico” usado en navGroups (`/dashboard/...`, `/cocina`, `/mesero`). */
export function toCanonicalDashboardPath(pathname: string): string {
  const m = pathname.match(/^\/restaurant\/[^/]+(.*)$/);
  if (!m) return pathname;
  let tail = (m[1] || "").replace(/\/+$/, "") || "";
  if (!tail) return "/dashboard";
  if (!tail.startsWith("/")) tail = `/${tail}`;
  if (
    tail === "/cocina" ||
    tail.startsWith("/cocina/") ||
    tail === "/mesero" ||
    tail.startsWith("/mesero/")
  ) {
    return tail;
  }
  return `/dashboard${tail}`;
}

/**
 * Si la ruta actual coincide con un ítem del nav (paths canónicos tipo `/dashboard/...`, `/cocina`, `/mesero`).
 * `/dashboard` solo coincide exacto — evita marcar «Panel Principal» en `/dashboard/mesas`, etc.
 */
export function canonicalPathMatchesNavHref(logicalPath: string, canonicalHref: string): boolean {
  if (logicalPath === canonicalHref) return true;
  if (canonicalHref === "/dashboard") return false;
  return logicalPath.startsWith(`${canonicalHref}/`);
}

/** Convierte href canónico del sidebar al href real (`/restaurant/id/mesas`, `/restaurant/id/cocina`, etc.). */
export function resolveNavHref(canonicalHref: string, restaurantBase: string | null): string {
  if (!restaurantBase) return canonicalHref;
  if (canonicalHref === "/dashboard") return restaurantBase;
  if (canonicalHref.startsWith("/dashboard/")) {
    return `${restaurantBase}${canonicalHref.slice("/dashboard".length)}`;
  }
  if (
    canonicalHref === "/cocina" ||
    canonicalHref.startsWith("/cocina/") ||
    canonicalHref === "/mesero" ||
    canonicalHref.startsWith("/mesero/")
  ) {
    return `${restaurantBase}${canonicalHref}`;
  }
  return canonicalHref;
}
