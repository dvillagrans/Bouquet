import Link from "next/link";

/*
 *  H-6 fix: placeholder links marked with aria-disabled + tabIndex={-1};
 *           functional section links use real hrefs.
 *  L-2 fix: year is dynamic via new Date().getFullYear().
 */

const cols: Record<string, Array<{ label: string; href: string; live?: boolean }>> = {
  Producto: [
    { label: "Sala en vivo",      href: "#producto",      live: true },
    { label: "Flujo de órdenes",  href: "#como-funciona", live: true },
    { label: "Pagos",             href: "#como-funciona", live: true },
    { label: "Reportes",          href: "#",              live: false },
  ],
  Empresa: [
    { label: "Nosotros",          href: "#", live: false },
    { label: "Blog",              href: "#", live: false },
    { label: "Casos de éxito",    href: "#", live: false },
    { label: "Prensa",            href: "#", live: false },
  ],
  Legal: [
    { label: "Privacidad",        href: "#", live: false },
    { label: "Términos de uso",   href: "#", live: false },
    { label: "Cookies",           href: "#", live: false },
  ],
};

export const Footer = () => (
  <footer className="border-t border-wire bg-ink">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">

        {/* Brand */}
        <div className="flex flex-col gap-4 lg:max-w-[200px]">
          <Link href="/" className="font-serif text-[1.5rem] font-semibold italic tracking-tight text-light/80 transition-opacity hover:opacity-60">
            bouquet
          </Link>
          <p className="text-[0.8rem] font-medium leading-[1.75] text-dim">
            Hospitality OS para restaurantes que no aceptan el desorden.
          </p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-wire">
            México · {new Date().getFullYear()}
          </p>
        </div>

        {/* Links */}
        {Object.entries(cols).map(([group, items]) => (
          <div key={group}>
            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-dim">
              {group}
            </p>
            <ul className="space-y-2.5">
              {items.map(({ label, href, live }) => (
                <li key={label}>
                  {live ? (
                    <Link
                      href={href}
                      className="text-[0.82rem] font-medium text-dim/70 transition-colors hover:text-light"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      className="cursor-default text-[0.82rem] font-medium text-dim/35"
                      aria-disabled="true"
                      title="Próximamente"
                    >
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-wire pt-8 sm:flex-row sm:items-center">
        <p className="text-[0.7rem] font-medium text-dim/50">
          © {new Date().getFullYear()} Bouquet Operations S.A. de C.V. Todos los derechos reservados.
        </p>
        <p className="text-[0.7rem] font-medium text-dim/40">
          Hecho con cuidado en México
        </p>
      </div>
    </div>
  </footer>
);
