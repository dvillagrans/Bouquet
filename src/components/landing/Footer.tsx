import Link from "next/link";
import Image from "next/image";
import { BouquetLogo } from "./BouquetLogo";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";

const productLinks = [
  { label: "Sala en vivo", href: "#producto" },
  { label: "Flujo de órdenes", href: "#como-funciona" },
  { label: "Pagos", href: "#como-funciona" },
];

export const Footer = () => (
  <footer className="relative overflow-hidden border-t border-white/5 bg-[#0A0406]">
    {/* Ultra-premium dark gradient background */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#3A1624_0%,transparent_60%)] opacity-40" />

    {/* Massive Watermark Text */}
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-[0.03] select-none">
      <span className="font-serif text-[25vw] font-bold tracking-tighter text-white whitespace-nowrap">
        BOUQUET
      </span>
    </div>

    {/* Floral Decoration */}
    <Image
      src={floralRight}
      alt=""
      className="pointer-events-none absolute -bottom-[10%] -right-[5%] w-[40vw] max-w-[600px] opacity-[0.1] mix-blend-screen sepia-[.2] hue-rotate-[-20deg]"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto max-w-[85rem] px-6 py-20 lg:px-10 lg:py-28">
      {/* Row 1: brand + nav + CTA */}
      <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:items-start lg:gap-24">
        {/* Brand block */}
        <div className="max-w-md">
          <div className="mb-8">
            <BouquetLogo size="lg" variant="light" showTagline />
          </div>
          <p className="font-serif text-[1.4rem] font-medium leading-[1.4] text-white/80">
            Hospitality OS para restaurantes que no aceptan el desorden.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F472B6] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F472B6]"></span>
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50">
              México · {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación secundaria" className="lg:pl-8">
          <p className="mb-6 flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/30">
            <span className="h-px w-6 bg-white/20" />
            Ecosistema
          </p>
          <ul className="space-y-4">
            {productLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="group relative inline-flex items-center text-[1rem] font-medium text-white/60 transition-colors hover:text-white"
                >
                  <span>{label}</span>
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-[#F472B6] transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact CTA */}
        <div className="rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-8 backdrop-blur-md">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/30">
            ¿Listos para el cambio?
          </p>
          <h4 className="mb-6 font-serif text-[1.8rem] font-medium text-white leading-tight">
            Inicia tu <br/><span className="italic text-[#F472B6]">transformación.</span>
          </h4>
          <Link
            href="#contacto"
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-full bg-white px-6 py-3 text-[0.95rem] font-bold text-[#0A0406] transition-transform hover:scale-[1.02]"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10">Agendar Demo</span>
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0406] text-white transition-transform duration-300 group-hover:rotate-45">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          </Link>
          <p className="mt-5 text-[0.8rem] leading-[1.6] text-white/40">
            20 minutos. Sin tarjeta. Recorrido operativo completo y sin compromiso.
          </p>
        </div>
      </div>

      {/* Row 2: legal */}
      <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
        <p className="text-[0.75rem] font-medium text-white/40">
          © {new Date().getFullYear()} Bouquet Operations · Diseñado con precisión para el mundo real.
        </p>
        <p className="text-[0.75rem] font-medium text-white/30">
          Privacidad & Términos
        </p>
      </div>
    </div>
  </footer>
);
