import { TopBar }          from "@/components/landing/TopBar";
import { Hero }            from "@/components/landing/Hero";
import { Ticker }          from "@/components/landing/Ticker";
import { Features }        from "@/components/landing/Features";
import { DashboardSection } from "@/components/landing/DashboardSection";
import { SocialProof }     from "@/components/landing/SocialProof";
import { CtaBand }         from "@/components/landing/CtaBand";
import { Footer }          from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-blue-500/25 selection:text-black">
      <TopBar />
      <main>
        {/* 1 — Hero full-viewport: headline + floor plan SVG en vivo */}
        <Hero />
        {/* 2 — Feature ticker: scrolling names in dark band */}
        <Ticker />
        {/* 3 — Feature pillars: 3 cards with mini-previews */}
        <Features />
        {/* 4 — Full product dashboard showcase */}
        <DashboardSection />
        {/* 5 — Stats + testimonial quote */}
        <SocialProof />
        {/* 6 — Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
