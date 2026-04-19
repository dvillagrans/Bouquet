import { TopBar }          from "@/components/landing/TopBar";
import { Hero }            from "@/components/landing/Hero";
import { Ticker }          from "@/components/landing/Ticker";
import { Features }        from "@/components/landing/Features";
import { ProductSection }   from "@/components/landing/ProductSection";
import { SocialProof }     from "@/components/landing/SocialProof";
import { CtaBand }         from "@/components/landing/CtaBand";
import { Footer }          from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#fffaf2_0%,#f5efe5_35%,#efe6d7_100%)] font-sans text-charcoal selection:bg-gold/25 selection:text-charcoal">
      {/* Skip-to-content — accesibilidad teclado */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gold"
      >
        Saltar al contenido
      </a>

      {/* Sitewide film grain overlay — fixed, pointer-events-none (sin coste en scroll) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />

      <TopBar />
      <main id="hero" className="relative z-[2]">
        {/* 1 — Hero full-viewport: headline + floor plan SVG en vivo */}
        <Hero />
        {/* 2 — Feature ticker: scrolling names in dark band */}
        <Ticker />
        {/* 3 — Feature pillars: 3 cards with mini-previews */}
        <Features />
        {/* 4 — Full product dashboard showcase */}
        <ProductSection />
        {/* 5 — Stats + testimonial quote */}
        <SocialProof />
        {/* 6 — Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
