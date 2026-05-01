import { TopBar } from "@/components/landing/TopBar";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { Features } from "@/components/landing/Features";
import { ProductSection } from "@/components/landing/ProductSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#FDF2F5_0%,#F5D5DC_35%,#FAF6F3_100%)] font-sans text-burgundy selection:bg-rose/20 selection:text-burgundy">
      {/* Skip-to-content */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-burgundy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-rose"
      >
        Saltar al contenido
      </a>

      {/* Film grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />

      <TopBar />
      <main id="hero" className="relative z-[2]">
        <Hero />
        <Ticker />
        <Features />
        <ProductSection />
        <SocialProof />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
