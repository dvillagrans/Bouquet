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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffaf2_0%,#f5efe5_35%,#efe6d7_100%)] font-sans text-charcoal selection:bg-gold/25 selection:text-charcoal">
      <TopBar />
      <main>
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
