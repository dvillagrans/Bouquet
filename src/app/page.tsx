import { TopBar } from "@/components/landing/TopBar";
import { Hero } from "@/components/landing/Hero";
import { ProductMockup } from "@/components/landing/ProductMockup";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-gold/20 selection:text-charcoal relative overflow-hidden">
      
      {/* Background Gradients using actual tailwind configuration colors */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center">
        <div className="absolute top-0 h-[600px] w-full max-w-4xl rounded-full bg-sage/10 blur-[100px] mix-blend-multiply" />
        <div className="absolute -right-40 top-40 h-[600px] w-[600px] rounded-full bg-champagne/20 blur-[100px] mix-blend-multiply" />
      </div>

      {/* Grid Pattern overlay for texture */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#2B241E05_1px,transparent_1px),linear-gradient(to_bottom,#2B241E05_1px,transparent_1px)] bg-[size:32px_32px]" />

      <TopBar />
      
      <main className="relative z-10 w-full pb-32">
        <Hero />
        <ProductMockup />
      </main>

    </div>
  );
}
