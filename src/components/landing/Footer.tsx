import Link from "next/link";
import { BouquetLogo } from "./BouquetLogo";

const productLinks = [
  { label: "Sala en vivo", href: "#producto" },
  { label: "Flujo de órdenes", href: "#como-funciona" },
  { label: "Pagos", href: "#como-funciona" },
];

export const Footer = () => (
  <footer className="relative border-t border-burgundy/10 bg-burgundy">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
      {/* Row 1: brand + nav + CTA */}
      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.9fr] lg:items-start">
        {/* Brand block */}
        <div className="max-w-md">
          <BouquetLogo size="lg" variant="light" showTagline />
          <p className="mt-5 text-[0.9rem] font-medium leading-[1.8] text-white/55">
            Hospitality OS para restaurantes que no aceptan el desorden.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-rose/70" aria-hidden="true" />
            México · {new Date().getFullYear()}
          </p>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación secundaria">
          <p className="mb-5 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-white/40">
            Producto
          </p>
          <ul className="space-y-3">
            {productLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[0.88rem] font-medium text-white/60 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact CTA */}
        <div>
          <p className="mb-5 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-white/40">
            ¿Conversamos?
          </p>
          <Link
            href="#contacto"
            className="group inline-flex items-center gap-3 rounded-full bg-white/[0.04] pl-5 pr-1.5 py-1.5 ring-1 ring-white/10 text-[0.85rem] font-semibold text-white transition-colors duration-300 hover:bg-white/[0.08]"
          >
            <span>Reservar demo</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/90 text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
          <p className="mt-5 text-[0.78rem] leading-[1.7] text-white/45 max-w-[28ch]">
            20 minutos. Sin tarjeta. Recorrido operativo completo.
          </p>
        </div>
      </div>

      {/* Row 2: legal */}
      <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-[0.7rem] font-medium text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Bouquet Operations · Hecho con cuidado en México.
        </p>
        <p className="text-white/30">
          Para restaurantes, taquerías y barras que operan en el mundo real.
        </p>
      </div>

      {/* Decoración floral footer */}
      <svg viewBox="0 0 400 40" className="absolute bottom-0 left-1/2 h-10 w-full -translate-x-1/2 opacity-10" aria-hidden="true">
        <path d="M0 20 Q50 5 100 20 Q150 35 200 20 Q250 5 300 20 Q350 35 400 20" stroke="#E8A5B0" strokeWidth="1" fill="none" />
        <circle cx="80" cy="15" r="4" fill="#D68C9F" />
        <circle cx="200" cy="20" r="5" fill="#C75B7A" />
        <circle cx="320" cy="15" r="4" fill="#E8A5B0" />
      </svg>
    </div>
  </footer>
);
