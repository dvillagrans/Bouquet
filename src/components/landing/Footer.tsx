import Link from "next/link";

/*
 *  Footer simplificado — sin dead-links "Próximamente".
 *  Mantiene únicamente navegación funcional + CTA de contacto.
 */

const productLinks = [
  { label: "Sala en vivo",     href: "#producto"      },
  { label: "Flujo de órdenes", href: "#como-funciona" },
  { label: "Pagos",            href: "#como-funciona" },
];

export const Footer = () => (
  <footer className="relative border-t border-wire bg-ink">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">

      {/* Row 1: brand + nav + CTA */}
      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.9fr] lg:items-start">
        {/* Brand block */}
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-baseline gap-2 group">
            <span className="font-serif text-[1.75rem] font-semibold italic tracking-tight text-light/85 transition-opacity group-hover:opacity-70">
              bouquet
            </span>
            <span className="text-[0.56rem] font-bold uppercase tracking-[0.38em] text-dim">
              ops
            </span>
          </Link>
          <p className="mt-5 text-[0.9rem] font-medium leading-[1.8] text-dim">
            Hospitality OS para restaurantes que no aceptan el desorden.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-dim/70">
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" aria-hidden="true" />
            México · {new Date().getFullYear()}
          </p>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación secundaria">
          <p className="mb-5 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-dim/60">
            Producto
          </p>
          <ul className="space-y-3">
            {productLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[0.88rem] font-medium text-dim/75 transition-colors hover:text-light"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact CTA */}
        <div>
          <p className="mb-5 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-dim/60">
            ¿Conversamos?
          </p>
          <Link
            href="#contacto"
            className="group inline-flex items-center gap-3 rounded-full bg-white/[0.04] pl-5 pr-1.5 py-1.5 ring-1 ring-white/10 text-[0.85rem] font-semibold text-light transition-colors duration-300 hover:bg-white/[0.08]"
          >
            <span>Reservar demo</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/90 text-charcoal transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
          <p className="mt-5 text-[0.78rem] leading-[1.7] text-dim/60 max-w-[28ch]">
            20 minutos. Sin tarjeta. Recorrido operativo completo.
          </p>
        </div>
      </div>

      {/* Row 2: legal */}
      <div className="mt-16 flex flex-col gap-3 border-t border-wire pt-8 text-[0.7rem] font-medium text-dim/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Bouquet Operations · Hecho con cuidado en México.
        </p>
        <p className="text-dim/40">
          Para restaurantes, taquerías y barras que operan en el mundo real.
        </p>
      </div>
    </div>
  </footer>
);
